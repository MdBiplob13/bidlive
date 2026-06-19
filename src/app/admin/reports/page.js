"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";
import api from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

export default function AdminReportsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("open");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports", status],
    queryFn: async () => (await api.get(`/admin/reports?status=${status}`)).data.data.reports,
  });

  const action = useMutation({
    mutationFn: async ({ reportId, status }) => api.patch("/admin/reports", { reportId, status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "reports"] }); toast.success("Updated"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Reports"
        action={<Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">{["open", "reviewing", "resolved", "dismissed", "all"].map((s) => <option key={s} value={s}>{s}</option>)}</Select>} />
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !data?.length ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">No reports</p>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <div key={r._id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{r.reason}</Badge>
                  <Badge variant="muted">{r.targetType}</Badge>
                  <Badge variant="secondary">{r.status}</Badge>
                </div>
                {r.status === "open" && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => action.mutate({ reportId: r._id, status: "resolved" })}><Check className="size-4" /> Resolve</Button>
                    <Button size="sm" variant="outline" onClick={() => action.mutate({ reportId: r._id, status: "dismissed" })}><X className="size-4" /></Button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">By {r.reporter?.name} · </span>
                {r.targetAuction ? `Auction: ${r.targetAuction.title}` : `User: ${r.targetUser?.name}`}
              </p>
              {r.details && <p className="mt-1 text-sm text-muted-foreground">“{r.details}”</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
