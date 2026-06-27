import mongoose from "mongoose";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import Order from "@/models/Order";
import { bidIncrement } from "@/lib/currency";
import { notify } from "@/lib/notify";
import {
  runInTransaction,
  lockBiddingFunds,
  releaseBiddingFunds,
  deductWinningFunds,
  creditWinningFunds,
} from "@/lib/wallet/walletService";

/** Minimum acceptable next bid for an auction. */
export function minNextBid(auction) {
  if (auction.currentBid > 0) {
    const step = auction.bidIncrement || bidIncrement(auction.currentBid);
    return auction.currentBid + step;
  }
  return auction.startingPrice;
}

/**
 * Place a bid with eBay-style proxy (auto) bidding.
 *
 * The bidder submits a visible `amount` and an optional `maxAutoBid` ceiling.
 * The engine resolves the proxy war against the current leader's ceiling and
 * sets the new public price to the minimum needed to lead.
 *
 * Returns { auction, leaderChanged, outbidUser }.
 * Throws Error with .status for validation problems.
 */
export async function placeBid({ auctionId, bidderId, amount, maxAutoBid = 0 }) {
  return runInTransaction(async (session) => {
    const auction = await Auction.findById(auctionId).session(session);
    if (!auction) throw httpError("Auction not found", 404);
    if (auction.status !== "active") throw httpError("This auction is not active", 400);
    if (new Date(auction.endDate).getTime() <= Date.now())
      throw httpError("This auction has ended", 400);
    if (String(auction.seller) === String(bidderId))
      throw httpError("You cannot bid on your own auction", 400);

    const step = auction.bidIncrement || bidIncrement(auction.currentBid || auction.startingPrice);
    const required = minNextBid(auction);
    if (amount < required)
      throw httpError(`Bid must be at least ৳${required}`, 400);

    const newMax = Math.max(amount, maxAutoBid || 0);
    const isSameLeader =
      auction.highestBidder && String(auction.highestBidder) === String(bidderId);

    // --- Check and Lock Bidding Funds ---
    // This will throw if the user has insufficient available balance.
    await lockBiddingFunds(bidderId, auction._id, newMax, session);

    // Record the bidder's manual bid (their intent / ceiling).
    await Bid.create(
      [
        {
          auction: auction._id,
          bidder: bidderId,
          amount,
          isAutoBid: newMax > amount,
          maxAutoBid: newMax,
          type: "manual",
          status: "active",
        },
      ],
      { session }
    );

    let leaderChanged = false;
    let outbidUser = null;

    if (!auction.highestBidder || isSameLeader) {
      // First bid, or current leader raising their own ceiling.
      auction.currentBid = Math.max(auction.currentBid || 0, amount, auction.startingPrice);
      auction.highestBidder = bidderId;
      leaderChanged = !isSameLeader;
    } else {
      // Resolve proxy war against the standing leader.
      const leaderBid = await Bid.findOne({
        auction: auction._id,
        bidder: auction.highestBidder,
      })
        .sort({ maxAutoBid: -1, amount: -1 })
        .session(session)
        .lean();
      const leaderMax = Math.max(leaderBid?.maxAutoBid || 0, auction.currentBid);

      if (newMax > leaderMax) {
        // Challenger wins; price rises just above the leader's ceiling.
        outbidUser = auction.highestBidder;
        auction.currentBid = Math.min(newMax, leaderMax + step);
        auction.highestBidder = bidderId;
        leaderChanged = true;
      } else {
        // Leader holds; auto-bid lifts price to just beat the challenger.
        auction.currentBid = Math.min(leaderMax, newMax + step);
        outbidUser = bidderId; // the challenger is immediately outbid
        // Record the leader's automatic proxy response.
        await Bid.create(
          [
            {
              auction: auction._id,
              bidder: auction.highestBidder,
              amount: auction.currentBid,
              isAutoBid: true,
              maxAutoBid: leaderMax,
              type: "proxy",
              status: "active",
            },
          ],
          { session }
        );
      }
    }

    // Mark previously-active bids from the loser as outbid.
    await Bid.updateMany(
      { auction: auction._id, bidder: { $ne: auction.highestBidder }, status: "active" },
      { $set: { status: "outbid" } }
    ).session(session);

    // --- Release Locked Funds for the Outbid User ---
    if (outbidUser) {
      await releaseBiddingFunds(outbidUser, auction._id, session);
    }

    auction.bidCount = await Bid.countDocuments({ auction: auction._id }).session(session);
    if (auction.reservePrice > 0 && auction.currentBid >= auction.reservePrice) {
      auction.reserveMet = true;
    }
    await auction.save({ session });

    // Fire-and-forget outbid notification.
    if (outbidUser && String(outbidUser) !== String(bidderId)) {
      notify({
        user: outbidUser,
        type: "outbid",
        title: { en: "You've been outbid", bn: "আপনি পিছিয়ে পড়েছেন" },
        body: {
          en: `Someone outbid you on "${auction.title}".`,
          bn: `কেউ "${auction.title}" নিলামে আপনাকে ছাড়িয়ে গেছে।`,
        },
        link: `/auctions/${auction._id}`,
        meta: { auction: String(auction._id) },
      }).catch(() => {});
    }

    return { auction, leaderChanged, outbidUser };
  });
}

/**
 * Settle a single auction whose time is up: pick winner, create order,
 * notify both parties. Idempotent — safe to call repeatedly.
 */
export async function settleAuction(auctionId) {
  // Use a transactional lock to prevent double-settlement.
  return runInTransaction(async (session) => {
    const auction = await Auction.findById(auctionId).session(session);
    if (!auction) return null;
    if (["sold", "ended", "cancelled", "rejected"].includes(auction.status)) return auction;
    if (auction.status !== "active") return auction;
    if (new Date(auction.endDate).getTime() > Date.now()) return auction;

    const reserveOk = auction.reservePrice === 0 || auction.currentBid >= auction.reservePrice;

    if (auction.highestBidder && reserveOk) {
      auction.winner = auction.highestBidder;
      auction.status = "sold";
      auction.settledAt = new Date();
      await auction.save({ session });

      await Bid.updateMany(
        { auction: auction._id, bidder: auction.winner, status: "active" },
        { $set: { status: "won" } }
      ).session(session);
      await Bid.updateMany(
        { auction: auction._id, status: "active" },
        { $set: { status: "lost" } }
      ).session(session);

      // --- Deduct Winning Funds ---
      // Deducts currentBid from winner's locked balance and releases the rest.
      await deductWinningFunds(auction.winner, auction._id, auction.currentBid, session);

      // --- Credit Seller Wallet (Minus custom commission rate) ---
      const commRate = auction.commissionRate !== undefined ? auction.commissionRate : 0.05;
      await creditWinningFunds(auction.seller, auction._id, auction.currentBid, commRate, session);

      const orderResults = await Order.create(
        [
          {
            auction: auction._id,
            seller: auction.seller,
            buyer: auction.winner,
            amount: auction.currentBid,
            status: "confirmed", // Pre-paid, mark as confirmed!
          },
        ],
        { session }
      );
      const order = orderResults[0];

      await notify({
        user: auction.winner,
        type: "won",
        title: { en: "Congratulations — you won!", bn: "অভিনন্দন — আপনি জিতেছেন!" },
        body: {
          en: `You won "${auction.title}". An order has been created.`,
          bn: `আপনি "${auction.title}" জিতেছেন। একটি অর্ডার তৈরি হয়েছে।`,
        },
        link: `/dashboard/orders/${order._id}`,
        meta: { auction: String(auction._id), order: String(order._id) },
      });
      await notify({
        user: auction.seller,
        type: "new_order",
        title: { en: "Your item sold!", bn: "আপনার পণ্য বিক্রি হয়েছে!" },
        body: {
          en: `"${auction.title}" sold for ৳${auction.currentBid}.`,
          bn: `"${auction.title}" ৳${auction.currentBid} এ বিক্রি হয়েছে।`,
        },
        link: `/dashboard/orders/${order._id}`,
        meta: { auction: String(auction._id), order: String(order._id) },
      });
    } else {
      // No bids or reserve not met -> ended without sale.
      auction.status = "ended";
      auction.settledAt = new Date();
      await auction.save({ session });
      await Bid.updateMany(
        { auction: auction._id, status: "active" },
        { $set: { status: "lost" } }
      ).session(session);
      await notify({
        user: auction.seller,
        type: "auction_ended",
        title: { en: "Auction ended", bn: "নিলাম শেষ হয়েছে" },
        body: {
          en: `"${auction.title}" ended without a winning bid.`,
          bn: `"${auction.title}" বিজয়ী বিড ছাড়াই শেষ হয়েছে।`,
        },
        link: `/auctions/${auction._id}`,
        meta: { auction: String(auction._id) },
      });
    }
    return auction;
  });
}

/** Settle every active auction past its end date. Used by cron/lazy sweep. */
export async function settleExpiredAuctions(limit = 50) {
  const due = await Auction.find({ status: "active", endDate: { $lte: new Date() } })
    .select("_id")
    .limit(limit)
    .lean();
  const results = [];
  for (const a of due) {
    results.push(await settleAuction(a._id));
  }
  return results;
}

function httpError(message, status) {
  const e = new Error(message);
  e.status = status;
  return e;
}
