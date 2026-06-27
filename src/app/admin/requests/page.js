"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  Info,
  Loader2,
  User,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const REJECTION_REASONS = [
  "Suspicious listing activity / Policy violation",
  "Inconsistent pricing modifications requested",
  "Inappropriate or invalid duration adjustment",
  "Requested changes could impact active bidders unfairly",
];

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("seller"); // seller, kyc, withdraw

  // Review modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReasonType, setRejectReasonType] = useState(REJECTION_REASONS[0]);
  const [customRejectReason, setCustomRejectReason] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Check operator permissions (avoid hardcoded role checks)
  const isAuthorized =
    user?.role === "admin" ||
    user?.permissions?.includes("manage_auctions") ||
    user?.permissions?.includes("manage_wallets");

  // Fetch Seller Auction Requests
  const { data: sellerRequests, isLoading: loadingSeller } = useQuery({
    queryKey: ["admin", "seller-requests"],
    queryFn: async () => (await api.get("/admin/auction-requests")).data.data.requests,
    enabled: activeTab === "seller" && isAuthorized,
  });

  // Fetch KYC Requests
  const { data: kycRequests, isLoading: loadingKyc } = useQuery({
    queryKey: ["admin", "kyc-requests"],
    queryFn: async () => (await api.get("/admin/kyc-requests")).data.data.requests,
    enabled: activeTab === "kyc" && isAuthorized,
  });

  // Fetch pending withdrawal requests from admin wallet transactions
  const { data: withdrawRequests, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ["admin", "withdraw-requests"],
    queryFn: async () => {
      const res = await api.get("/admin/wallets");
      return res.data.data.transactions.filter((txn) => txn.type === "withdrawal" && txn.status === "pending");
    },
    enabled: activeTab === "withdraw" && isAuthorized,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ requestId, payload, type }) => {
      if (type === "kyc") {
        return (await api.patch("/admin/users", payload)).data.data;
      }
      if (type === "withdraw") {
        return (await api.post(`/admin/transactions/${requestId}`, payload)).data.data;
      }
      const res = await api.post(`/admin/auction-requests/${requestId}`, payload);
      return res.data.data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["admin", "seller-requests"] });
      qc.invalidateQueries({ queryKey: ["admin", "kyc-requests"] });
      qc.invalidateQueries({ queryKey: ["admin", "withdraw-requests"] });
      toast.success(d.message || "Request resolved successfully.");
      setSelectedRequest(null);
      setAdminNote("");
      setCustomRejectReason("");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthorized) {
    return (
      <div className="py-20 text-center text-destructive flex flex-col items-center gap-2">
        <AlertCircle className="size-10" />
        <p className="font-bold">Access Denied</p>
        <p className="text-sm text-muted-foreground">
          You do not have the required permissions to review pending admin requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="size-8 text-primary" />
            Requests Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Review auction modification/cancellation requests, pending KYC verifications, and withdrawal approvals.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-muted p-1 border border-border shrink-0 self-start">
          <button
            onClick={() => setActiveTab("seller")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "seller"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Auction Requests
          </button>
          <button
            onClick={() => setActiveTab("kyc")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "kyc"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            KYC Requests
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === "withdraw"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Withdrawal Requests
          </button>
        </div>
      </div>

      {activeTab === "seller" ? (
        <div className="space-y-4">
          <PageHeader
            title="Auction Requests"
            subtitle="Change or cancellation requests submitted on approved, active auctions."
          />
          {loadingSeller ? (
            <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : !sellerRequests?.length ? (
            <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground text-sm">
              No pending auction requests found.
            </p>
          ) : (
            <div className="space-y-3">
              {sellerRequests.map((r) => (
                <div
                  key={r._id}
                  className="rounded-xl border border-border bg-card p-5 shadow-card flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.type === "cancel" ? "destructive" : "warning"} className="text-[10px] capitalize">
                        {r.type} Request
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">#{r._id.slice(-6)}</span>
                    </div>
                    <p className="font-bold text-foreground text-base leading-tight">
                      Auction: {r.auction?.title}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      Seller: {r.user?.name} ({r.user?.phone})
                    </p>
                    <p className="text-xs text-muted-foreground italic max-w-xl">
                      Reason: {r.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    <Badge
                      variant={
                        r.status === "approved"
                          ? "success"
                          : r.status === "rejected"
                          ? "destructive"
                          : "warning"
                      }
                      className="capitalize"
                    >
                      {r.status}
                    </Badge>
                    {r.status === "pending" && (
                      <Button size="sm" onClick={() => setSelectedRequest({ ...r, requestType: "auction" })}>
                        Review Request <ChevronRight className="ml-1 size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "kyc" ? (
        <div className="space-y-4">
          <PageHeader
            title="KYC Requests"
            subtitle="Users who submitted NID verification and are awaiting approval."
          />
          {loadingKyc ? (
            <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : !kycRequests?.length ? (
            <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground text-sm">
              No pending KYC requests found.
            </p>
          ) : (
            <div className="space-y-3">
              {kycRequests.map((u) => (
                <div key={u._id} className="rounded-xl border border-border bg-card p-5 shadow-card flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="text-[10px] capitalize">
                        KYC Request
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">#{u._id.slice(-6)}</span>
                    </div>
                    <p className="font-bold text-foreground text-base leading-tight">{u.name}</p>
                    <p className="text-xs font-medium text-muted-foreground">{u.phone}</p>
                    <p className="text-xs text-muted-foreground">{u.city || "City not provided"}</p>
                    <p className="text-xs text-muted-foreground italic max-w-xl">{u.address || "No address provided."}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    <Badge variant="warning" className="capitalize">pending</Badge>
                    <Button size="sm" onClick={() => setSelectedRequest({ ...u, requestType: "kyc" })}>
                      Review Request <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <PageHeader
            title="Withdrawal Requests"
            subtitle="Pending withdrawal approvals that need admin review."
          />
          {loadingWithdrawals ? (
            <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
          ) : !withdrawRequests?.length ? (
            <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground text-sm">
              No pending withdrawal requests found.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawRequests.map((txn) => (
                <div
                  key={txn._id}
                  className="rounded-xl border border-border bg-card p-5 shadow-card flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px] capitalize">
                        Withdrawal Request
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">#{txn._id.slice(-6)}</span>
                    </div>
                    <p className="font-bold text-foreground text-base leading-tight">{txn.user?.name || "Unknown user"}</p>
                    <p className="text-xs font-medium text-muted-foreground">{txn.user?.phone || "No phone"}</p>
                    <p className="text-xs text-muted-foreground">Amount: {formatTaka(txn.amount)}</p>
                    <p className="text-xs text-muted-foreground italic max-w-xl">Method: {txn.paymentGateway || "Manual"}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    <Badge variant="warning" className="capitalize">pending</Badge>
                    <Button size="sm" onClick={() => setSelectedRequest({ ...txn, requestType: "withdraw" })}>
                      Review Request <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Request Dialog Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold tracking-tight">
                Review {selectedRequest.requestType === "kyc" ? "KYC" : selectedRequest.requestType === "withdraw" ? "Withdrawal" : selectedRequest.type === "cancel" ? "Cancellation" : "Modification"} Request
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="size-5" />
              </button>
            </div>

            {selectedRequest.requestType === "auction" ? (
              <div className="space-y-1 bg-muted/40 p-4 rounded-xl border border-border text-xs">
                <p className="font-bold">Auction Details</p>
                <p>Title: <strong className="text-foreground">{selectedRequest.auction?.title}</strong></p>
                <p>Current Price: <strong className="text-foreground">{formatTaka(selectedRequest.auction?.currentBid)}</strong></p>
                <p>Highest Bidder: <strong className="text-foreground">{selectedRequest.auction?.highestBidder ? "Yes" : "None"}</strong></p>
                <p className="pt-2">Seller Reason for request: <span className="italic">&quot;{selectedRequest.reason}&quot;</span></p>
              </div>
            ) : selectedRequest.requestType === "kyc" ? (
              <div className="space-y-2 bg-muted/40 p-4 rounded-xl border border-border text-xs">
                <p className="font-bold">KYC Verification Details</p>
                <p>Name: <strong className="text-foreground">{selectedRequest.kycName || selectedRequest.name}</strong></p>
                <p>ID Number: <strong className="text-foreground">{selectedRequest.kycIdNumber || "Not provided"}</strong></p>
                <p>City: <strong className="text-foreground">{selectedRequest.city || "Not provided"}</strong></p>
                <p>Address: <strong className="text-foreground">{selectedRequest.address || "Not provided"}</strong></p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {selectedRequest.avatar && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Profile Photo</span>
                      <img src={selectedRequest.avatar} alt="Profile Photo" className="h-24 w-full rounded object-cover border border-border" />
                    </div>
                  )}
                  {selectedRequest.kycDocumentFront && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">NID Front</span>
                      <img src={selectedRequest.kycDocumentFront} alt="NID Front" className="h-24 w-full rounded object-cover border border-border" />
                    </div>
                  )}
                  {selectedRequest.kycDocumentBack && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">NID Back</span>
                      <img src={selectedRequest.kycDocumentBack} alt="NID Back" className="h-24 w-full rounded object-cover border border-border" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-muted/40 p-4 rounded-xl border border-border text-xs">
                <p className="font-bold">Withdrawal Request Details</p>
                <p>User: <strong className="text-foreground">{selectedRequest.user?.name || "Unknown"}</strong></p>
                <p>Phone: <strong className="text-foreground">{selectedRequest.user?.phone || "N/A"}</strong></p>
                <p>Amount: <strong className="text-foreground">{formatTaka(selectedRequest.amount)}</strong></p>
                <p>Method: <strong className="text-foreground">{selectedRequest.paymentGateway || "Manual"}</strong></p>
                <p>Description: <span className="italic">{selectedRequest.description || "No description provided."}</span></p>
              </div>
            )}

            {selectedRequest.requestType === "auction" && selectedRequest.type === "change" && selectedRequest.requestedChanges && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Requested Modifications</p>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border text-xs">
                  <div className="grid grid-cols-2 bg-muted/40 p-2 font-semibold">
                    <span>Field</span>
                    <span>Requested Value</span>
                  </div>
                  {Object.entries(selectedRequest.requestedChanges).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 p-2 font-mono">
                      <span className="capitalize">{key}</span>
                      <span className="text-primary font-bold">
                        {key === "endDate" ? new Date(val).toLocaleString() : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest.requestType === "auction" && selectedRequest.type === "cancel" && selectedRequest.auction?.highestBidder && (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-3.5 text-xs text-warning/90 flex gap-2">
                <Info className="size-4 shrink-0" />
                <p>
                  Note: Approving this cancellation will refund BDT {formatTaka(selectedRequest.auction?.currentBid)} lock back to the highest bidder.
                </p>
              </div>
            )}

            {/* Rejection / Notes controls */}
            <div className="space-y-3.5 border-t border-border pt-4">
              <div>
                <Label className="text-xs font-semibold">Predefined Rejection Reason (If rejecting)</Label>
                <select
                  value={rejectReasonType}
                  onChange={(e) => setRejectReasonType(e.target.value)}
                  className="w-full h-8 rounded border border-input bg-background px-3 py-1.5 text-xs mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="custom">Custom Reason...</option>
                </select>
              </div>

              {rejectReasonType === "custom" && (
                <div>
                  <Label htmlFor="customReason" className="text-xs">Custom Rejection Reason</Label>
                  <Input
                    id="customReason"
                    placeholder="Enter custom rejection reason..."
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-xs">Approval / Rejection Message to Seller</Label>
                <Textarea
                  id="notes"
                  placeholder="E.g. Approved modifications applied / Request rejected due to policy..."
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="text-xs resize-none mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="destructive"
                className="flex-1 font-bold h-9"
                onClick={() =>
                  resolveMutation.mutate({
                    requestId: selectedRequest._id,
                    type: selectedRequest.requestType,
                    payload:
                      selectedRequest.requestType === "kyc"
                        ? {
                            userId: selectedRequest._id,
                            action: "rejectKyc",
                            reason: adminNote || (rejectReasonType === "custom" ? customRejectReason : rejectReasonType),
                          }
                        : {
                            action: "reject",
                            adminNote: adminNote || (rejectReasonType === "custom" ? customRejectReason : rejectReasonType),
                          },
                  })
                }
                disabled={resolveMutation.isPending}
              >
                Reject Request
              </Button>
              <Button
                className="flex-1 bg-success hover:bg-success/90 text-white font-bold h-9"
                onClick={() =>
                  resolveMutation.mutate({
                    requestId: selectedRequest._id,
                    type: selectedRequest.requestType,
                    payload:
                      selectedRequest.requestType === "kyc"
                        ? {
                            userId: selectedRequest._id,
                            action: "approveKyc",
                            reason: adminNote || "KYC approved",
                          }
                        : {
                            action: "approve",
                            adminNote: adminNote || "Approved",
                          },
                  })
                }
                disabled={resolveMutation.isPending}
              >
                {resolveMutation.isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : <CheckCircle className="mr-1 size-4" />}
                Approve Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
