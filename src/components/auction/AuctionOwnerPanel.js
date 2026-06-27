"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Eye,
  Gavel,
  Heart,
  Ban,
  Trash2,
  LayoutDashboard,
  FileEdit,
  X,
  Loader2,
  Calendar,
  DollarSign,
  Info,
} from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STATUS_VARIANT = {
  pending: "muted",
  active: "success",
  sold: "default",
  ended: "secondary",
  rejected: "destructive",
  cancelled: "outline",
};

export default function AuctionOwnerPanel({ auction }) {
  const { locale } = useLanguage();
  const router = useRouter();
  const qc = useQueryClient();

  // Request modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState("change"); // change, cancel
  const [requestReason, setRequestReason] = useState("");

  // Change fields state
  const [title, setTitle] = useState(auction.title || "");
  const [description, setDescription] = useState(auction.description || "");
  const [startingPrice, setStartingPrice] = useState(auction.startingPrice || "");
  const [reservePrice, setReservePrice] = useState(auction.reservePrice || "");
  const [location, setLocation] = useState(auction.location || "");
  const [endDate, setEndDate] = useState(
    auction.endDate ? new Date(auction.endDate).toISOString().slice(0, 16) : ""
  );

  const cancel = useMutation({
    mutationFn: async () => api.patch(`/auctions/${auction._id}`, { action: "cancel" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auction", auction._id] });
      toast.success(locale === "bn" ? "নিলাম বাতিল হয়েছে" : "Auction cancelled");
    },
    onError: (e) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async () => api.delete(`/auctions/${auction._id}`),
    onSuccess: () => {
      toast.success(locale === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted");
      router.push("/dashboard/auctions");
    },
    onError: (e) => toast.error(e.message),
  });

  // Submit request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/auctions/${auction._id}/request`, payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Request submitted successfully.");
      setShowRequestModal(false);
      setRequestReason("");
      qc.invalidateQueries({ queryKey: ["auction", auction._id] });
    },
    onError: (err) => toast.error(err.message),
  });

  const noBids = !(auction.bidCount > 0);
  const canCancelDirectly = noBids && ["pending"].includes(auction.status);
  const canDelete = noBids && ["pending", "rejected"].includes(auction.status);
  const canRequestChange = auction.status === "active";
  const busy = cancel.isPending || del.isPending || submitRequestMutation.isPending;

  const stats = [
    { icon: Eye, label: locale === "bn" ? "ভিউ" : "Views", value: auction.views || 0 },
    { icon: Gavel, label: locale === "bn" ? "বিড" : "Bids", value: auction.bidCount || 0 },
    { icon: Heart, label: locale === "bn" ? "ওয়াচিং" : "Watching", value: auction.watchCount || 0 },
  ];

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const payload = {
      type: requestType,
      reason: requestReason,
    };

    if (requestType === "change") {
      const requestedChanges = {};
      if (title !== auction.title) requestedChanges.title = title;
      if (description !== auction.description) requestedChanges.description = description;
      if (Number(startingPrice) !== auction.startingPrice) requestedChanges.startingPrice = Number(startingPrice);
      if (Number(reservePrice) !== auction.reservePrice) requestedChanges.reservePrice = Number(reservePrice);
      if (location !== auction.location) requestedChanges.location = location;
      if (new Date(endDate).getTime() !== new Date(auction.endDate).getTime()) {
        requestedChanges.endDate = endDate;
      }

      if (Object.keys(requestedChanges).length === 0) {
        toast.error(locale === "bn" ? "কোন পরিবর্তন করা হয়নি" : "No modifications specified.");
        return;
      }
      payload.requestedChanges = requestedChanges;
    }

    submitRequestMutation.mutate(payload);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === "bn" ? "আপনার নিলাম" : "Your listing"}
        </p>
        <Badge variant={STATUS_VARIANT[auction.status]}>{auction.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-muted/50 p-2.5 text-center">
            <s.icon className="mx-auto mb-1 size-4 text-muted-foreground" />
            <p className="text-lg font-extrabold leading-none">{s.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {auction.status === "rejected" && auction.rejectionReason && (
        <p className="mt-1 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
          {locale === "bn" ? "কারণ" : "Reason"}: {auction.rejectionReason}
        </p>
      )}

      <div className="space-y-2 pt-2">
        <Button asChild variant="secondary" className="w-full">
          <Link href="/dashboard/auctions">
            <LayoutDashboard className="size-4" />{" "}
            {locale === "bn" ? "ড্যাশবোর্ডে পরিচালনা করুন" : "Manage in dashboard"}
          </Link>
        </Button>

        {/* Change / Cancel Request for Approved Auctions */}
        {canRequestChange && (
          <Button variant="outline" className="w-full border-primary/45 hover:bg-primary/5" onClick={() => setShowRequestModal(true)}>
            <FileEdit className="size-4 text-primary" />
            {locale === "bn" ? "পরিবর্তন বা বাতিলের অনুরোধ" : "Request Change / Cancellation"}
          </Button>
        )}

        {canCancelDirectly && (
          <Button
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() =>
              confirm(locale === "bn" ? "এই নিলাম বাতিল করবেন?" : "Cancel this auction?") &&
              cancel.mutate()
            }
          >
            <Ban className="size-4" /> {locale === "bn" ? "নিলাম বাতিল করুন" : "Cancel auction"}
          </Button>
        )}

        {canDelete && (
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10"
            disabled={busy}
            onClick={() =>
              confirm(locale === "bn" ? "এই নিলাম মুছে ফেলবেন?" : "Delete this auction?") &&
              del.mutate()
            }
          >
            <Trash2 className="size-4" /> {locale === "bn" ? "মুছে ফেলুন" : "Delete"}
          </Button>
        )}
      </div>

      {/* Change / Cancel Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <FileEdit className="size-5 text-primary" />
                {locale === "bn" ? "পরিবর্তন বা বাতিলের অনুরোধ" : "Change or Cancellation Request"}
              </h3>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold select-none">
                  <input
                    type="radio"
                    name="reqType"
                    checked={requestType === "change"}
                    onChange={() => setRequestType("change")}
                    className="text-primary focus:ring-primary"
                  />
                  Request Changes
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold select-none text-destructive">
                  <input
                    type="radio"
                    name="reqType"
                    checked={requestType === "cancel"}
                    onChange={() => setRequestType("cancel")}
                    className="text-destructive focus:ring-destructive"
                  />
                  Request Cancellation
                </label>
              </div>

              {requestType === "change" ? (
                <div className="space-y-3.5 rounded-xl border border-border/80 bg-muted/20 p-4 text-xs">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-xs" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Starting Price (৳)</Label>
                      <Input
                        type="number"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Reserve Price (৳)</Label>
                      <Input
                        type="number"
                        value={reservePrice}
                        onChange={(e) => setReservePrice(e.target.value)}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">End Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Location</Label>
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-8 text-xs" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px]">Description</Label>
                    <Textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="text-xs resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-destructive/5 rounded-xl border border-destructive/20 text-xs text-destructive/90 flex gap-2">
                  <Info className="size-4 shrink-0" />
                  <p>
                    Caution: Once approved by admin, the auction will be cancelled and closed. Any active bidder locks will be refunded to their available balance immediately.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="reqReason">
                  Reason for Request <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reqReason"
                  placeholder="Specify why you want to modify or cancel this live auction listing..."
                  required
                  rows={3}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="mt-1 text-sm resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRequestModal(false)}>
                  Close
                </Button>
                <Button type="submit" className="flex-1 font-bold" disabled={busy}>
                  {busy && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
