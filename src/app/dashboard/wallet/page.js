"use client";
import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  CreditCard,
  History,
  Coins,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function UserWalletPage() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  // Dialog / action states
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Form states
  const [depositAmount, setDepositAmount] = useState("");
  const [depositProvider, setDepositProvider] = useState("sslcommerz"); // sslcommerz, card, manual_bkash, manual_nagad
  const [manualTxnId, setManualTxnId] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bkash"); // bkash, nagad, bank
  const [withdrawAccount, setWithdrawAccount] = useState("");

  // Check URL query parameters for simulated gateway status
  const isMockGateway = searchParams.get("mockGateway") === "true";
  const mockProvider = searchParams.get("provider");
  const mockTxnId = searchParams.get("txnId");
  const mockAmount = searchParams.get("amount");

  // Fetch wallet and transactions
  const { data: walletData, isLoading, error } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => (await api.get("/wallet")).data.data,
  });

  const wallet = walletData?.wallet;
  const transactions = walletData?.transactions || [];

  // Mutations
  const depositMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/wallet/deposit", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      if (data.gatewayUrl) {
        // Redirect to simulated gateway page
        window.location.href = data.gatewayUrl;
      } else {
        toast.success(data.message || "Manual deposit request submitted.");
        setShowDeposit(false);
        setDepositAmount("");
        setManualTxnId("");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const withdrawMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/wallet/withdraw", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      toast.success(data.message || "Withdrawal request submitted.");
      setShowWithdraw(false);
      setWithdrawAmount("");
      setWithdrawAccount("");
    },
    onError: (err) => toast.error(err.message),
  });

  // Simulated Webhook triggers
  const handleSimulatePayment = (status) => {
    const gatewayTxnId = `${mockProvider === "sslcommerz" ? "SSLC" : "CARD"}-SIM-${mockTxnId}-${Date.now().toString().slice(-4)}`;
    window.location.href = `/api/payments/webhook?status=${status}&txnId=${mockTxnId}&amount=${mockAmount}&provider=${mockProvider}&gatewayTxnId=${gatewayTxnId}`;
  };

  if (isMockGateway) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <span className="inline-grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              {mockProvider === "sslcommerz" ? <Coins className="size-8" /> : <CreditCard className="size-8" />}
            </span>
            <h1 className="mt-4 text-2xl font-black capitalize tracking-tight">
              {mockProvider === "sslcommerz" ? "SSLCommerz Checkout" : "Card Payment Gateway"}
            </h1>
            <p className="text-sm text-muted-foreground">Simulating Secure Payment Integration</p>
          </div>

          <div className="mt-8 space-y-4 rounded-2xl bg-muted/40 p-4 border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono font-semibold">{mockTxnId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-semibold capitalize">{mockProvider}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold">Total Amount</span>
              <span className="text-xl font-extrabold text-primary">{formatTaka(mockAmount, { locale })}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              className="w-full bg-success hover:bg-success/90 text-white font-bold"
              size="lg"
              onClick={() => handleSimulatePayment("success")}
            >
              <CheckCircle2 className="mr-2 size-5" />
              Simulate Successful Payment
            </Button>
            <Button
              variant="destructive"
              className="w-full font-bold"
              size="lg"
              onClick={() => handleSimulatePayment("fail")}
            >
              <XCircle className="mr-2 size-5" />
              Simulate Failed Payment
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            No real money is charged. This gateway executes the full verify-and-credit webhook integration loop.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid place-items-center py-40">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-destructive flex flex-col items-center gap-2">
        <AlertCircle className="size-10" />
        <p className="font-bold">Failed to load wallet</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <WalletIcon className="size-8 text-primary" />
            {t("wallet.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "bn" ? "আপনার জমা ও খরচ দেখুন এবং ওয়ালেট টপ-আপ করুন" : "Manage your funds, locked balances and logs."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowDeposit(true)} className="flex-1 md:flex-initial">
            <ArrowDownLeft className="mr-1.5 size-4" /> {t("wallet.deposit")}
          </Button>
          <Button onClick={() => setShowWithdraw(true)} variant="outline" className="flex-1 md:flex-initial">
            <ArrowUpRight className="mr-1.5 size-4" /> {t("wallet.withdraw")}
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Available Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t("wallet.available")}</span>
            <span className="grid size-9 place-items-center rounded-xl bg-success/10 text-success">
              <Coins className="size-5" />
            </span>
          </div>
          <h3 className="mt-4 text-3xl font-black text-foreground">{formatTaka(wallet?.available || 0, { locale })}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "bn" ? "নিলামে বিড করতে বা উইথড্র করতে প্রস্তুত" : "Ready to bid on auctions or withdraw"}
          </p>
        </div>

        {/* Locked Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t("wallet.locked")}</span>
            <span className="grid size-9 place-items-center rounded-xl bg-warning/10 text-warning">
              <Lock className="size-5" />
            </span>
          </div>
          <h3 className="mt-4 text-3xl font-black text-foreground">{formatTaka(wallet?.locked || 0, { locale })}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "bn" ? "চলমান বিড অথবা পেন্ডিং উইথড্রয়াল ফান্ড" : "Funds held in active bids or pending withdrawals"}
          </p>
        </div>

        {/* Total Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t("wallet.balance")}</span>
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <WalletIcon className="size-5" />
            </span>
          </div>
          <h3 className="mt-4 text-3xl font-black text-foreground">{formatTaka(wallet?.balance || 0, { locale })}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "bn" ? "মোট ফান্ড (ব্যবহারযোগ্য + লকড)" : "Total assets (Available + Locked)"}
          </p>
        </div>
      </div>

      {/* Demo Controls / Quick Top-up */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-extrabold text-lg mb-2">
          <Coins className="size-5 text-success animate-pulse" />
          {locale === "bn" ? "ওয়ান-ক্লিক ডেমো ব্যালেন্স বুস্ট" : "One-Click Demo Balance Boost"}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          {locale === "bn" ? "যেহেতু ওয়েবসাইটটি ডেমো মোডে আছে, তাই আপনি একটি ক্লিকেই আপনার ওয়ালেটে যত খুশি টাকা যোগ করতে পারেন।" : "Since the website is in Demo Mode, you can add mock funds instantly with a single click."}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {[5000, 10000, 50000, 100000, 500000].map((amt) => (
            <Button
              key={amt}
              variant="outline"
              className="font-bold border-success/30 text-success hover:bg-success/10 hover:text-success"
              onClick={() => {
                depositMutation.mutate({
                  amount: amt,
                  provider: "sslcommerz", // completes instantly on backend
                });
              }}
              disabled={depositMutation.isPending}
            >
              {depositMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                "+"
              )}
              {formatTaka(amt, { locale })}
            </Button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-extrabold text-lg mb-4">
          <History className="size-5 text-primary" />
          {t("wallet.recentTransactions")}
        </h2>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Coins className="mx-auto size-8 mb-2 opacity-50" />
            <p className="text-sm">
              {locale === "bn" ? "এখনো কোনো লেনদেন হয়নি।" : "No transaction ledger history found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">{t("wallet.date")}</th>
                  <th className="py-3 px-4">{t("wallet.type")}</th>
                  <th className="py-3 px-4">{t("wallet.amount")}</th>
                  <th className="py-3 px-4">{t("wallet.reference")}</th>
                  <th className="py-3 px-4">{t("wallet.status")}</th>
                  <th className="py-3 px-4">{locale === "bn" ? "বিস্তারিত" : "Details"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((txn) => {
                  const isCredit = txn.amount > 0;
                  const dateStr = new Date(txn.createdAt).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={txn._id} className="hover:bg-muted/30">
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">{dateStr}</td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className="flex items-center gap-1.5 capitalize">
                          {txn.type.includes("lock") && <Lock className="size-3.5 text-warning" />}
                          {txn.type.includes("release") && <Unlock className="size-3.5 text-muted-foreground" />}
                          {txn.type.includes("deposit") && <ArrowDownLeft className="size-3.5 text-success" />}
                          {txn.type.includes("withdraw") && <ArrowUpRight className="size-3.5 text-destructive" />}
                          {txn.type.includes("deduction") && <XCircle className="size-3.5 text-destructive" />}
                          {txn.type.includes("received") && <CheckCircle2 className="size-3.5 text-success" />}
                          {txn.type.includes("commission") && <Coins className="size-3.5 text-primary" />}
                          {txn.type.includes("adjustment") && <AlertCircle className="size-3.5 text-accent" />}
                          {txn.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-bold whitespace-nowrap ${isCredit ? "text-success" : "text-destructive"}`}>
                        {isCredit ? "+" : ""}{formatTaka(txn.amount, { locale })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {txn.referenceType && txn.referenceId ? (
                          <Link
                            href={
                              txn.referenceType === "Auction"
                                ? `/auctions/${txn.referenceId}`
                                : `/dashboard/orders/${txn.referenceId}`
                            }
                            className="font-medium text-primary hover:underline"
                          >
                            {txn.referenceType} #{txn.referenceId.slice(-6)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            txn.status === "completed"
                              ? "success"
                              : txn.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="capitalize text-[11px]"
                        >
                          {txn.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate" title={txn.description}>
                        {txn.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <ArrowDownLeft className="size-5 text-success" />
              {t("wallet.deposit")}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const isManual = depositProvider.startsWith("manual_");
                depositMutation.mutate({
                  amount: Number(depositAmount),
                  provider: isManual ? "manual" : depositProvider,
                  method: isManual ? depositProvider.split("_")[1] : undefined,
                  gatewayTxnId: isManual ? manualTxnId : undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="depositAmount">{locale === "bn" ? "টাকার পরিমাণ" : "Amount (৳)"}</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="5000"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="font-bold text-lg mt-1"
                />
              </div>

              <div>
                <Label htmlFor="provider">{locale === "bn" ? "পেমেন্ট মাধ্যম" : "Payment Method"}</Label>
                <select
                  id="provider"
                  value={depositProvider}
                  onChange={(e) => setDepositProvider(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="sslcommerz">SSLCommerz (Simulated Visa/Mastercard/MFS)</option>
                  <option value="card">Simulated Direct Card Payment</option>
                  <option value="manual_bkash">Manual bKash Send Money</option>
                  <option value="manual_nagad">Manual Nagad Send Money</option>
                </select>
              </div>

              {depositProvider.startsWith("manual_") && (
                <div className="rounded-xl bg-muted p-4 border border-border space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Instructions: Please send money to our personal MFS number: <strong className="text-foreground">01799999999</strong>, then paste the Transaction ID (TxnID) below for admin confirmation.
                  </p>
                  <div>
                    <Label htmlFor="txnId">{t("wallet.txnId")}</Label>
                    <Input
                      id="txnId"
                      placeholder="BK10293021"
                      required
                      value={manualTxnId}
                      onChange={(e) => setManualTxnId(e.target.value)}
                      className="font-mono mt-1"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDeposit(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" className="flex-1" disabled={depositMutation.isPending}>
                  {depositMutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  {t("common.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <ArrowUpRight className="size-5 text-destructive" />
              {t("wallet.withdraw")}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                withdrawMutation.mutate({
                  amount: Number(withdrawAmount),
                  method: withdrawMethod,
                  accountDetails: withdrawAccount,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="withdrawAmount">{locale === "bn" ? "টাকার পরিমাণ" : "Amount (৳)"}</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="2000"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="font-bold text-lg mt-1"
                />
              </div>

              <div>
                <Label htmlFor="withdrawMethod">{locale === "bn" ? "উইথড্র মাধ্যম" : "Transfer Method"}</Label>
                <select
                  id="withdrawMethod"
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="bkash">bKash Personal</option>
                  <option value="nagad">Nagad Personal</option>
                  <option value="bank">Bank Transfer (Dhaka Bank / City Bank)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="accountDetails">
                  {withdrawMethod === "bank"
                    ? (locale === "bn" ? "ব্যাংক অ্যাকাউন্ট ও রাউটিং নম্বর" : "Account Number & Routing Details")
                    : (locale === "bn" ? "মোবাইল নম্বর" : "MFS Phone Number")}
                </Label>
                <Input
                  id="accountDetails"
                  placeholder={withdrawMethod === "bank" ? "AC: 123456789, City Bank, Banani" : "017xxxxxxxx"}
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowWithdraw(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" className="flex-1" disabled={withdrawMutation.isPending}>
                  {withdrawMutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  {t("common.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
