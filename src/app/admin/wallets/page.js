"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Wallet as WalletIcon,
  Search,
  CheckCircle,
  XCircle,
  Coins,
  ShieldAlert,
  Sliders,
  History,
  Lock,
  Loader2,
  Phone,
  User,
  Filter,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { formatTaka } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function AdminWalletsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Filters for complete transaction history
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all"); // all, today, month, year

  // Adjustment Modal state
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState("adjustment_credit"); // adjustment_credit, adjustment_debit
  const [adjustDesc, setAdjustDesc] = useState("");

  // Fetch admin data
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "wallets"],
    queryFn: async () => (await api.get("/admin/wallets")).data.data,
  });

  const wallets = data?.wallets || [];
  const transactions = data?.transactions || [];

  // Check operator permissions (avoid hardcoded role checks)
  const isAuthorized =
    user?.role === "admin" ||
    user?.permissions?.includes("manage_wallets") ||
    user?.permissions?.includes("view_reports");

  // Mutations
  const approveRejectMutation = useMutation({
    mutationFn: async ({ txnId, action }) => {
      const res = await api.post(`/admin/transactions/${txnId}`, { action });
      return res.data.data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["admin", "wallets"] });
      toast.success(d.message || "Request processed successfully.");
    },
    onError: (err) => toast.error(err.message),
  });

  const adjustMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/admin/wallets/adjust", payload);
      return res.data.data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["admin", "wallets"] });
      toast.success(d.message || "Wallet adjusted successfully.");
      setSelectedWallet(null);
      setAdjustAmount("");
      setAdjustDesc("");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center py-40">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !isAuthorized) {
    return (
      <div className="py-20 text-center text-destructive flex flex-col items-center gap-2">
        <ShieldAlert className="size-10" />
        <p className="font-bold">Access Denied</p>
        <p className="text-sm text-muted-foreground">
          You do not have the required permissions (`manage_wallets` or `view_reports`) to view this section.
        </p>
      </div>
    );
  }

  // --- Financial Statistics Calculation ---
  const adminWallet = wallets.find((w) => w.user?.role === "admin") || { balance: 0 };
  const userBalances = wallets
    .filter((w) => w.user?.role !== "admin")
    .reduce((sum, w) => sum + (w.balance || 0), 0);
  const totalLocked = wallets.reduce((sum, w) => sum + (w.locked || 0), 0);

  // Aggregated totals from transactions
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCommission = transactions
    .filter((t) => t.type === "commission" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const siteRevenue = totalCommission; // Site commission constitutes primary revenue

  // --- Daily, Monthly, and Yearly Reports ---
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

  const getReportStats = (sinceTime) => {
    const txs = transactions.filter((t) => new Date(t.createdAt).getTime() >= sinceTime && t.status === "completed");
    return {
      deposits: txs.filter((t) => t.type === "deposit").reduce((sum, t) => sum + Math.abs(t.amount), 0),
      withdrawals: txs.filter((t) => t.type === "withdrawal").reduce((sum, t) => sum + Math.abs(t.amount), 0),
      commission: txs.filter((t) => t.type === "commission").reduce((sum, t) => sum + Math.abs(t.amount), 0),
    };
  };

  const dailyReport = getReportStats(todayStart);
  const monthlyReport = getReportStats(monthStart);
  const yearlyReport = getReportStats(yearStart);

  // --- Filtering User Wallets Directory ---
  const filteredWallets = wallets.filter(
    (w) =>
      w.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.user?.phone?.includes(searchTerm)
  );

  const pendingRequests = transactions.filter((t) => t.status === "pending");

  // --- Filtering Ledger Transactions ---
  const filteredTransactions = transactions.filter((t) => {
    // 1. User search filter
    if (filterUser) {
      const uName = t.user?.name?.toLowerCase() || "";
      const uPhone = t.user?.phone || "";
      const query = filterUser.toLowerCase();
      if (!uName.includes(query) && !uPhone.includes(query)) return false;
    }
    // 2. Type filter
    if (filterType !== "all" && t.type !== filterType) return false;
    // 3. Status filter
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    // 4. Date range filter
    if (filterDateRange !== "all") {
      const txnTime = new Date(t.createdAt).getTime();
      if (filterDateRange === "today" && txnTime < todayStart) return false;
      if (filterDateRange === "month" && txnTime < monthStart) return false;
      if (filterDateRange === "year" && txnTime < yearStart) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <WalletIcon className="size-8 text-accent" />
            Financial Dashboard & Audits
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor platform liquidity, audit system ledgers, and manage client deposit/withdrawal requests.
          </p>
        </div>
      </div>

      {/* Main Financial Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Admin/System Wallet */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card bg-accent/5 border-accent/25">
          <span className="text-xs font-semibold uppercase text-accent">Admin / System Wallet</span>
          <h3 className="mt-2 text-2xl font-black text-foreground">{formatTaka(adminWallet.balance)}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Total platform earnings collected</p>
        </div>

        {/* User Balances */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Total Client Balances</span>
          <h3 className="mt-2 text-2xl font-black text-foreground">{formatTaka(userBalances)}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Sum of client wallets (available + locked)</p>
        </div>

        {/* Total Locked */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Total Escrow Locked</span>
          <h3 className="mt-2 text-2xl font-black text-warning">{formatTaka(totalLocked)}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Active bids & withdrawal reserves</p>
        </div>

        {/* Website Revenue */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card bg-success/5 border-success/20">
          <span className="text-xs font-semibold uppercase text-success">Total Website Revenue</span>
          <h3 className="mt-2 text-2xl font-black text-success">{formatTaka(siteRevenue)}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Net generated commissions (5% rate)</p>
        </div>
      </div>

      {/* Cash Flow Summaries */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Deposits */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-success/10 text-success shrink-0">
            <ArrowDownLeft className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Total Completed Deposits</p>
            <p className="text-lg font-extrabold text-foreground">{formatTaka(totalDeposits)}</p>
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive shrink-0">
            <ArrowUpRight className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Total Dispatched Withdrawals</p>
            <p className="text-lg font-extrabold text-foreground">{formatTaka(totalWithdrawals)}</p>
          </div>
        </div>

        {/* Net Commission */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Coins className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Total Commission Collected</p>
            <p className="text-lg font-extrabold text-foreground">{formatTaka(totalCommission)}</p>
          </div>
        </div>
      </div>

      {/* Periodic Financial Reports */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h2 className="font-extrabold text-lg flex items-center gap-2">
          <Calendar className="size-5 text-accent" />
          Periodic Financial Performance Reports
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Daily */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
            <Badge variant="secondary" className="font-bold">Daily Report (Today)</Badge>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span>Deposits:</span><span className="font-bold text-success">+{formatTaka(dailyReport.deposits)}</span></div>
              <div className="flex justify-between"><span>Withdrawals:</span><span className="font-bold text-destructive">-{formatTaka(dailyReport.withdrawals)}</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold"><span>Commission Earning:</span><span className="text-primary">{formatTaka(dailyReport.commission)}</span></div>
            </div>
          </div>

          {/* Monthly */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
            <Badge variant="secondary" className="font-bold">Monthly Report (This Month)</Badge>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span>Deposits:</span><span className="font-bold text-success">+{formatTaka(monthlyReport.deposits)}</span></div>
              <div className="flex justify-between"><span>Withdrawals:</span><span className="font-bold text-destructive">-{formatTaka(monthlyReport.withdrawals)}</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold"><span>Commission Earning:</span><span className="text-primary">{formatTaka(monthlyReport.commission)}</span></div>
            </div>
          </div>

          {/* Yearly */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
            <Badge variant="secondary" className="font-bold">Yearly Report (This Year)</Badge>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span>Deposits:</span><span className="font-bold text-success">+{formatTaka(yearlyReport.deposits)}</span></div>
              <div className="flex justify-between"><span>Withdrawals:</span><span className="font-bold text-destructive">-{formatTaka(yearlyReport.withdrawals)}</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold"><span>Commission Earning:</span><span className="text-primary">{formatTaka(yearlyReport.commission)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Request Queues */}
      {user?.permissions?.includes("manage_wallets") || user?.role === "admin" ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h2 className="font-extrabold text-lg flex items-center gap-2">
            <Sliders className="size-5 text-accent" />
            Moderation Request Queue (Deposits / Withdrawals)
          </h2>
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No pending manual deposit or withdrawal requests.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingRequests.map((txn) => {
                const isDeposit = txn.type === "deposit";
                const details = txn.metadata;
                return (
                  <div key={txn._id} className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isDeposit ? "success" : "destructive"} className="text-[10px] capitalize">
                          {txn.type}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">#{txn._id.slice(-6)}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">User: {txn.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{txn.description}</p>
                      {details && (
                        <p className="text-[11px] font-mono bg-card px-2 py-1 rounded border border-border inline-block mt-1">
                          {isDeposit ? "MFS:" : "Pay to:"} {details.method} | Ref: {details.gatewayTxnId || details.accountDetails}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-border/60 pt-3">
                      <span className="text-lg font-black">{formatTaka(Math.abs(txn.amount))}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-white font-bold h-7 text-xs px-2.5"
                          onClick={() => approveRejectMutation.mutate({ txnId: txn._id, action: "approve" })}
                          disabled={approveRejectMutation.isPending}
                        >
                          {isDeposit ? "Approve" : "Mark as Sent"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="font-bold h-7 text-xs px-2.5"
                          onClick={() => approveRejectMutation.mutate({ txnId: txn._id, action: "reject" })}
                          disabled={approveRejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Directory & Ledger Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* User Wallet Directory */}
        {user?.permissions?.includes("manage_wallets") || user?.role === "admin" ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-extrabold text-lg flex items-center gap-2">
                <Coins className="size-5 text-accent" />
                Wallet Directory
              </h2>
              <div className="relative w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2">
              {filteredWallets.map((w) => (
                <div key={w._id} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      {w.user?.name}
                      {w.user?.role === "employee" && <Badge className="text-[8px] py-0 px-1">staff</Badge>}
                    </p>
                    <p className="text-muted-foreground font-mono text-[10px]">{w.user?.phone}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground mt-1">
                      <span>Avail: <strong className="text-success">{formatTaka(w.available)}</strong></span>
                      <span>Lock: <strong className="text-warning">{formatTaka(w.locked)}</strong></span>
                    </div>
                  </div>
                  <div className="text-right space-y-1.5">
                    <p className="font-bold">{formatTaka(w.balance)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] px-2 font-semibold"
                      onClick={() => setSelectedWallet(w)}
                    >
                      Adjust
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Complete Transaction History with Filters */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
          <h2 className="font-extrabold text-lg flex items-center gap-2">
            <History className="size-5 text-accent" />
            Complete Transaction Ledger History
          </h2>

          {/* Filtering Controls */}
          <div className="grid gap-2.5 grid-cols-2 md:grid-cols-4 p-3 rounded-xl bg-muted/40 border border-border/80 text-xs">
            {/* User */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">User Search</Label>
              <Input
                placeholder="Name / phone"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="h-7 text-xs px-2"
              />
            </div>
            {/* Type */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Action Type</Label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="bid_lock">Bid Lock</option>
                <option value="bid_release">Bid Release</option>
                <option value="payment_deduction">Deduction</option>
                <option value="payment_received">Payment Received</option>
                <option value="commission">Commission</option>
                <option value="adjustment_credit">Adjustment Credit</option>
                <option value="adjustment_debit">Adjustment Debit</option>
              </select>
            </div>
            {/* Status */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Status</Label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {/* Date range */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Date Period</Label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Filtered Table */}
          <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No matching transaction ledger records found.
              </div>
            ) : (
              filteredTransactions.map((txn) => {
                const isCredit = txn.amount > 0;
                return (
                  <div key={txn._id} className="p-3 rounded-xl border border-border/80 bg-muted/10 flex items-start justify-between text-xs hover:bg-muted/20 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-foreground">{txn.user?.name || "System"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({txn.user?.phone || "sys"})</span>
                        <Badge variant="outline" className="text-[9px] py-0 px-1 capitalize tracking-tight font-normal">
                          {txn.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]" title={txn.description}>{txn.description}</p>
                      <p className="text-[9px] text-muted-foreground/80 font-mono">
                        {new Date(txn.createdAt).toLocaleString()} · Status:{" "}
                        <span className={txn.status === "completed" ? "text-success font-semibold" : "text-warning font-semibold"}>{txn.status}</span>
                      </p>
                    </div>
                    <span className={`font-extrabold whitespace-nowrap text-sm ${isCredit ? "text-success" : "text-destructive"}`}>
                      {isCredit ? "+" : ""}{formatTaka(txn.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Adjustment Dialog Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <Sliders className="size-5 text-accent" />
              Adjust Wallet Balance
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Modifying wallet for user: <strong className="text-foreground">{selectedWallet.user?.name}</strong>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustMutation.mutate({
                  userId: selectedWallet.user?._id || selectedWallet.user,
                  amount: Number(adjustAmount),
                  type: adjustType,
                  description: adjustDesc,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="adjustAmount">Amount (৳)</Label>
                <Input
                  id="adjustAmount"
                  type="number"
                  placeholder="1000"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="font-bold text-lg mt-1"
                />
              </div>

              <div>
                <Label htmlFor="adjustType">Adjustment Type</Label>
                <select
                  id="adjustType"
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="adjustment_credit">Credit (Add funds to available balance)</option>
                  <option value="adjustment_debit">Debit (Deduct funds from available balance)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="adjustDesc">Reason for Audit Log</Label>
                <Input
                  id="adjustDesc"
                  placeholder="E.g. Refunded for shipping delay / Campaign bonus"
                  required
                  value={adjustDesc}
                  onChange={(e) => setAdjustDesc(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedWallet(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={adjustMutation.isPending}>
                  {adjustMutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Adjust
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
