"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import PageHeader from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function DashboardRankingsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("weekly");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["rankings", period, page],
    queryFn: async () => (await api.get(`/rankings?period=${period}&page=${page}&limit=10`)).data.data,
  });

  const currentUserEntry = useMemo(() => {
    if (!data?.userEntry) return null;
    return data.userEntry;
  }, [data]);

  return (
    <div>
      <PageHeader title="Rankings" subtitle="Track your spending rank and position" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
        <div>
          <p className="text-sm font-semibold text-foreground">Ranking period</p>
          <p className="text-sm text-muted-foreground">Switch between weekly, monthly, and yearly rankings.</p>
        </div>
        <Select value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1); }} className="w-40">
          {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </Select>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <Trophy className="size-5 text-primary" /> Your current position
        </div>
        {currentUserEntry ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-xl font-extrabold">#{currentUserEntry.rank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-xl font-extrabold">{currentUserEntry.points}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm text-muted-foreground">Auction spend</p>
                <p className="font-semibold">৳{currentUserEntry.auctionSpend}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm text-muted-foreground">Wallet spend</p>
                <p className="font-semibold">৳{currentUserEntry.walletSpend}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You have no ranking activity yet for this period.</p>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Rank</th>
              <th className="p-3 font-medium">User</th>
              <th className="p-3 font-medium">Auction Spend</th>
              <th className="p-3 font-medium">Wallet Spend</th>
              <th className="p-3 font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading rankings…</td></tr>
            ) : !data?.items?.length ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No rankings available yet.</td></tr>
            ) : data.items.map((entry) => {
              const isCurrent = String(entry.user) === String(user?._id);
              return (
                <tr key={entry._id} className={isCurrent ? "bg-primary/5" : ""}>
                  <td className="p-3 font-semibold">#{entry.rank}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{entry.name || "User"}</span>
                      {isCurrent && <Badge variant="accent">You</Badge>}
                    </div>
                  </td>
                  <td className="p-3">৳{entry.auctionSpend}</td>
                  <td className="p-3">৳{entry.walletSpend}</td>
                  <td className="p-3 font-semibold">{entry.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data?.total > 10 && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button variant="outline" size="sm" disabled={page * 10 >= data.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
