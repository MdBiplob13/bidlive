import mongoose from "mongoose";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Bid from "@/models/Bid";

/**
 * Execute a function within a Mongoose transaction session.
 */
export async function runInTransaction(fn) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get or create a wallet for a user.
 */
export async function getOrCreateWallet(userId, session = null) {
  const query = Wallet.findOne({ user: userId });
  if (session) query.session(session);
  let wallet = await query;

  if (!wallet) {
    wallet = new Wallet({
      user: userId,
      balance: 0,
      available: 0,
      locked: 0,
    });
    if (session) {
      await wallet.save({ session });
    } else {
      await wallet.save();
    }
  }
  return wallet;
}

/**
 * Check if user has sufficient available balance.
 */
export async function checkAvailableBalance(userId, amount, session = null) {
  const wallet = await getOrCreateWallet(userId, session);
  return wallet.available >= amount;
}

/**
 * Lock bidding funds when placing a bid.
 * Handles both new bids and raising the ceiling of an existing bid.
 */
export async function lockBiddingFunds(userId, auctionId, newCeiling, session = null) {
  const wallet = await getOrCreateWallet(userId, session);

  // Find if there is any existing active lock on this auction for this user.
  // We can query the bids or search for active lock transaction.
  const activeBid = await Bid.findOne({ auction: auctionId, bidder: userId, status: "active" })
    .sort({ maxAutoBid: -1, amount: -1 })
    .session(session);

  const oldCeiling = activeBid ? Math.max(activeBid.amount, activeBid.maxAutoBid || 0) : 0;
  const delta = newCeiling - oldCeiling;

  if (delta <= 0) return wallet; // No additional funds need to be locked

  if (wallet.available < delta) {
    throw new Error(`Insufficient wallet balance. You need at least ৳${delta} more (total ৳${newCeiling} ceiling required) but only have ৳${wallet.available} available.`);
  }

  // Update balances
  wallet.available -= delta;
  wallet.locked += delta;
  await wallet.save({ session });

  // Record ledger entry
  await Transaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type: "bid_lock",
        amount: -delta,
        balanceAfter: wallet.balance,
        availableAfter: wallet.available,
        lockedAfter: wallet.locked,
        status: "completed",
        referenceType: "Auction",
        referenceId: auctionId,
        description: `Locked ৳${delta} for bidding ceiling on auction.`,
      },
    ],
    { session }
  );

  return wallet;
}

/**
 * Release locked bidding funds back to available balance (e.g. when outbid).
 */
export async function releaseBiddingFunds(userId, auctionId, session = null) {
  const wallet = await getOrCreateWallet(userId, session);

  // Find the total amount currently locked for this user on this auction.
  // We can calculate this from the user's highest bid maxAutoBid ceiling.
  const bids = await Bid.find({ auction: auctionId, bidder: userId }).session(session);
  if (bids.length === 0) return wallet;

  const ceiling = Math.max(...bids.map((b) => Math.max(b.amount, b.maxAutoBid || 0)));

  // If the user's current locked amount is less than the ceiling, we just release whatever we can,
  // but to prevent negative locked balance, we bound it by wallet.locked.
  const releaseAmount = Math.min(ceiling, wallet.locked);
  if (releaseAmount <= 0) return wallet;

  wallet.locked -= releaseAmount;
  wallet.available += releaseAmount;
  await wallet.save({ session });

  await Transaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type: "bid_release",
        amount: releaseAmount,
        balanceAfter: wallet.balance,
        availableAfter: wallet.available,
        lockedAfter: wallet.locked,
        status: "completed",
        referenceType: "Auction",
        referenceId: auctionId,
        description: `Released ৳${releaseAmount} locked bidding funds after being outbid.`,
      },
    ],
    { session }
  );

  return wallet;
}

/**
 * Deduct winning bid amount permanently and release the excess lock.
 */
export async function deductWinningFunds(userId, auctionId, winningAmount, session = null) {
  const wallet = await getOrCreateWallet(userId, session);

  // Find the lock ceiling that was held
  const bids = await Bid.find({ auction: auctionId, bidder: userId }).session(session);
  if (bids.length === 0) {
    throw new Error("No bids found for the winner on this auction to deduct funds from.");
  }
  const ceiling = Math.max(...bids.map((b) => Math.max(b.amount, b.maxAutoBid || 0)));

  // The locked amount is 'ceiling'.
  // We deduct winningAmount from wallet.locked and wallet.balance.
  // The excess (ceiling - winningAmount) goes back to wallet.available and is deducted from wallet.locked.
  const excess = ceiling - winningAmount;

  wallet.locked -= ceiling;
  wallet.available += excess;
  wallet.balance -= winningAmount;
  await wallet.save({ session });

  await Transaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type: "payment_deduction",
        amount: -winningAmount,
        balanceAfter: wallet.balance,
        availableAfter: wallet.available,
        lockedAfter: wallet.locked,
        status: "completed",
        referenceType: "Auction",
        referenceId: auctionId,
        description: `Deducted ৳${winningAmount} for winning auction bid (excess ৳${excess} released).`,
      },
    ],
    { session }
  );

  return wallet;
}

/**
 * Credit sales earnings to the seller, deducting site commission.
 */
export async function creditWinningFunds(sellerId, auctionId, winningAmount, commissionRate = 0.05, session = null) {
  const sellerWallet = await getOrCreateWallet(sellerId, session);
  const commission = Math.round(winningAmount * commissionRate);
  const netEarnings = winningAmount - commission;

  // Credit seller
  sellerWallet.balance += netEarnings;
  sellerWallet.available += netEarnings;
  await sellerWallet.save({ session });

  await Transaction.create(
    [
      {
        wallet: sellerWallet._id,
        user: sellerId,
        type: "payment_received",
        amount: netEarnings,
        balanceAfter: sellerWallet.balance,
        availableAfter: sellerWallet.available,
        lockedAfter: sellerWallet.locked,
        status: "completed",
        referenceType: "Auction",
        referenceId: auctionId,
        description: `Credited ৳${netEarnings} (৳${winningAmount} sale price minus ৳${commission} site commission).`,
      },
    ],
    { session }
  );

  // Credit admin/system wallet
  if (commission > 0) {
    const adminUser = await User.findOne({ role: "admin" }).session(session);
    if (adminUser) {
      const adminWallet = await getOrCreateWallet(adminUser._id, session);
      adminWallet.balance += commission;
      adminWallet.available += commission;
      await adminWallet.save({ session });

      await Transaction.create(
        [
          {
            wallet: adminWallet._id,
            user: adminUser._id,
            type: "commission",
            amount: commission,
            balanceAfter: adminWallet.balance,
            availableAfter: adminWallet.available,
            lockedAfter: adminWallet.locked,
            status: "completed",
            referenceType: "Auction",
            referenceId: auctionId,
            description: `Received ৳${commission} site commission from auction sale.`,
          },
        ],
        { session }
      );
    }
  }

  return sellerWallet;
}

/**
 * User requests a withdrawal. Locks available balance.
 */
export async function requestWithdrawal(userId, amount, method, accountDetails, session = null) {
  const wallet = await getOrCreateWallet(userId, session);

  if (wallet.available < amount) {
    throw new Error(`Insufficient funds for withdrawal. Available: ৳${wallet.available}. Requested: ৳${amount}.`);
  }

  // Lock available balance
  wallet.available -= amount;
  wallet.locked += amount;
  await wallet.save({ session });

  // Create a pending transaction
  const txn = await Transaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type: "withdrawal",
        amount: -amount,
        balanceAfter: wallet.balance,
        availableAfter: wallet.available,
        lockedAfter: wallet.locked,
        status: "pending",
        paymentGateway: method,
        description: `Pending withdrawal of ৳${amount} to ${method} account ${accountDetails}.`,
        metadata: { method, accountDetails },
      },
    ],
    { session }
  );

  return txn[0];
}

/**
 * Approve a pending withdrawal. Deducts locked and total balance.
 */
export async function approveWithdrawal(transactionId, session = null) {
  const txn = await Transaction.findById(transactionId).session(session);
  if (!txn) throw new Error("Transaction not found");
  if (txn.status !== "pending" || txn.type !== "withdrawal") {
    throw new Error("Only pending withdrawal transactions can be approved.");
  }

  const wallet = await Wallet.findById(txn.wallet).session(session);
  const amount = Math.abs(txn.amount);

  wallet.locked -= amount;
  wallet.balance -= amount;
  await wallet.save({ session });

  txn.status = "completed";
  txn.balanceAfter = wallet.balance;
  txn.availableAfter = wallet.available;
  txn.lockedAfter = wallet.locked;
  txn.description = txn.description.replace("Pending", "Completed");
  await txn.save({ session });

  return txn;
}

/**
 * Reject a pending withdrawal. Releases locked funds back to available balance.
 */
export async function rejectWithdrawal(transactionId, session = null) {
  const txn = await Transaction.findById(transactionId).session(session);
  if (!txn) throw new Error("Transaction not found");
  if (txn.status !== "pending" || txn.type !== "withdrawal") {
    throw new Error("Only pending withdrawal transactions can be rejected.");
  }

  const wallet = await Wallet.findById(txn.wallet).session(session);
  const amount = Math.abs(txn.amount);

  wallet.locked -= amount;
  wallet.available += amount;
  await wallet.save({ session });

  txn.status = "failed";
  txn.balanceAfter = wallet.balance;
  txn.availableAfter = wallet.available;
  txn.lockedAfter = wallet.locked;
  txn.description = txn.description.replace("Pending", "Rejected / Refunded");
  await txn.save({ session });

  return txn;
}

/**
 * Initiate an automatic gateway deposit session.
 */
export async function initiateGatewayDeposit(userId, amount, providerName, session = null) {
  const wallet = await getOrCreateWallet(userId, session);

  // Create a pending transaction
  const txn = new Transaction({
    wallet: wallet._id,
    user: userId,
    type: "deposit",
    amount,
    balanceAfter: wallet.balance,
    availableAfter: wallet.available,
    lockedAfter: wallet.locked,
    status: "pending",
    paymentGateway: providerName,
    description: `Initiated ৳${amount} deposit via ${providerName}.`,
  });

  if (session) {
    await txn.save({ session });
  } else {
    await txn.save();
  }

  return txn;
}

/**
 * User requests a manual deposit.
 */
export async function requestManualDeposit(userId, amount, method, gatewayTxnId, session = null) {
  const wallet = await getOrCreateWallet(userId, session);

  // Check if this gateway transaction ID is already registered to avoid duplicates
  const existing = await Transaction.findOne({ gatewayTxnId }).session(session);
  if (existing) {
    throw new Error("This transaction ID has already been submitted.");
  }

  const txn = await Transaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type: "deposit",
        amount,
        balanceAfter: wallet.balance,
        availableAfter: wallet.available,
        lockedAfter: wallet.locked,
        status: "pending",
        paymentGateway: `manual_${method}`,
        gatewayTxnId,
        description: `Pending manual deposit of ৳${amount} via ${method} (Txn: ${gatewayTxnId}).`,
        metadata: { method, gatewayTxnId },
      },
    ],
    { session }
  );

  return txn[0];
}

/**
 * Approve a pending manual deposit.
 */
export async function approveManualDeposit(transactionId, session = null) {
  const txn = await Transaction.findById(transactionId).session(session);
  if (!txn) throw new Error("Transaction not found");
  if (txn.status !== "pending" || txn.type !== "deposit") {
    throw new Error("Only pending deposit transactions can be approved.");
  }

  const wallet = await Wallet.findById(txn.wallet).session(session);
  const amount = txn.amount;

  wallet.balance += amount;
  wallet.available += amount;
  await wallet.save({ session });

  txn.status = "completed";
  txn.balanceAfter = wallet.balance;
  txn.availableAfter = wallet.available;
  txn.lockedAfter = wallet.locked;
  txn.description = txn.description.replace("Pending manual", "Approved manual");
  await txn.save({ session });

  return txn;
}

/**
 * Reject a pending manual deposit.
 */
export async function rejectManualDeposit(transactionId, session = null) {
  const txn = await Transaction.findById(transactionId).session(session);
  if (!txn) throw new Error("Transaction not found");
  if (txn.status !== "pending" || txn.type !== "deposit") {
    throw new Error("Only pending deposit transactions can be rejected.");
  }

  txn.status = "failed";
  txn.description = txn.description.replace("Pending manual", "Rejected manual");
  await txn.save({ session });

  return txn;
}

/**
 * Admin performs direct wallet adjustments.
 */
export async function adminAdjustment(userId, amount, type, description, session = null) {
  const wallet = await getOrCreateWallet(userId, session);

  if (type === "adjustment_credit") {
    wallet.balance += amount;
    wallet.available += amount;
  } else if (type === "adjustment_debit") {
    if (wallet.available < amount) {
      throw new Error(`Insufficient available funds (Available: ৳${wallet.available}) to debit ৳${amount}.`);
    }
    wallet.balance -= amount;
    wallet.available -= amount;
  } else {
    throw new Error("Invalid adjustment type");
  }

  await wallet.save({ session });

  const txn = await Transaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type,
        amount: type === "adjustment_credit" ? amount : -amount,
        balanceAfter: wallet.balance,
        availableAfter: wallet.available,
        lockedAfter: wallet.locked,
        status: "completed",
        description,
      },
    ],
    { session }
  );

  return txn[0];
}
