"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import api from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const PERIODS = ["weekly", "monthly", "yearly"];

export default function AdminRankingsPage() {
  const qc = useQueryClient();
  const [period, setPeriod] = useState("weekly");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "rankings", period],
    queryFn: async () => (await api.get(`/admin/rankings?period=${period}`)).data.data,
  });

  const refreshRankings = async () => {
    await api.post("/admin/rankings", { periodType: period });
    qc.invalidateQueries({ queryKey: ["admin", "rankings", period] });
  };

  return (
    <div>
      <PageHeader title="Ranking Management" subtitle="Review user rankings by period" />

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-48">
          {PERIODS.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
        </Select>
        <Button variant="outline" onClick={refreshRankings}>
          <RefreshCcw className="mr-2 size-4" /> Refresh rankings
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Rank</th>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Auction Spend</th>
              <th className="p-3 font-medium">Wallet Spend</th>
              <th className="p-3 font-medium">Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading rankings…</td></tr>
            ) : !data?.items?.length ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No ranking data available yet.</td></tr>
            ) : data.items.map((entry) => (
              <tr key={entry._id} className="border-b border-border last:border-0">
                <td className="p-3 font-semibold">#{entry.rank}</td>
                <td className="p-3">{entry.name || "User"}</td>
                <td className="p-3">৳{entry.auctionSpend}</td>
                <td className="p-3">৳{entry.walletSpend}</td>
                <td className="p-3">৳{entry.totalSpend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
