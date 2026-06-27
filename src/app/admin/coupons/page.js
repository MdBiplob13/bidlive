"use client";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Ticket, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => (await api.get("/admin/coupons")).data.data.coupons,
  });

  const createCoupon = useMutation({
    mutationFn: async (payload) => api.post("/admin/coupons", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon created successfully.");
      setCode("");
      setAmount("");
      setMaxUses("");
      setExpiresAt("");
      setDescription("");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleCoupon = useMutation({
    mutationFn: async ({ couponId, active }) => api.patch(`/admin/coupons/${couponId}`, { active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon updated.");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (couponId) => api.delete(`/admin/coupons/${couponId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      toast.success("Coupon deleted.");
    },
    onError: (e) => toast.error(e.message),
  });

  const summary = useMemo(() => {
    const list = data || [];
    return {
      total: list.length,
      active: list.filter((c) => c.active).length,
      expired: list.filter((c) => c.expiresAt && new Date(c.expiresAt) < new Date()).length,
    };
  }, [data]);

  const handleCreate = (e) => {
    e.preventDefault();
    createCoupon.mutate({
      code: code.trim().toUpperCase(),
      amount: Number(amount),
      maxUses: maxUses === "" ? 0 : Number(maxUses),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      description: description.trim(),
    });
  };

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Create and manage wallet coupons for the marketplace" />

      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Ticket className="size-4" /> Create a new coupon
          </div>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="code">Coupon code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME50" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input id="amount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxUses">Max uses</Label>
              <Input id="maxUses" type="number" min="0" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="0 for unlimited" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Expiry date</Label>
              <Input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Summer bonus coupon" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={createCoupon.isPending}>
                <Plus className="mr-2 size-4" /> {createCoupon.isPending ? "Creating..." : "Create coupon"}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">Overview</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2">
              <span>Total coupons</span><span className="font-semibold text-foreground">{summary.total}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2">
              <span>Active</span><span className="font-semibold text-foreground">{summary.active}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2">
              <span>Expired</span><span className="font-semibold text-foreground">{summary.expired}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Uses</th>
              <th className="p-3 font-medium">Expiry</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading coupons…</td></tr>
            ) : !data?.length ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No coupons yet.</td></tr>
            ) : data.map((coupon) => (
              <tr key={coupon._id} className="border-b border-border last:border-0">
                <td className="p-3 font-semibold">{coupon.code}</td>
                <td className="p-3">৳{coupon.amount}</td>
                <td className="p-3">{coupon.usedBy?.length ?? 0}/{coupon.maxUses || "∞"}</td>
                <td className="p-3">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "No expiry"}</td>
                <td className="p-3"><Badge variant={coupon.active ? "success" : "muted"}>{coupon.active ? "Active" : "Inactive"}</Badge></td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleCoupon.mutate({ couponId: coupon._id, active: !coupon.active })}>
                      {coupon.active ? <ToggleLeft className="size-4" /> : <ToggleRight className="size-4" />}
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteCoupon.mutate(coupon._id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
