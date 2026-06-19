"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";

export default function AdminRequestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => (await api.get("/requests?scope=open")).data.data.requests,
  });

  return (
    <div>
      <PageHeader title="Buyer Requests" subtitle="Open 'looking for' requests from buyers" />
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !data?.length ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">No open requests</p>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <div key={r._id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.title}</p>
                <Badge variant="secondary">{r.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                By {r.user?.name} · {r.category?.name?.en}
                {(r.budgetMin || r.budgetMax) > 0 && ` · ${formatTaka(r.budgetMin)}–${formatTaka(r.budgetMax)}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
