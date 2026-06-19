"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";

export default function AdminLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async () => (await api.get("/admin/logs")).data.data.logs,
  });

  return (
    <div>
      <PageHeader title="System Logs" subtitle="Admin action audit trail" />
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !data?.length ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">No logs yet</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr><th className="p-3 font-medium">Action</th><th className="p-3 font-medium">Admin</th><th className="p-3 font-medium">Target</th><th className="p-3 font-medium">Note</th></tr>
            </thead>
            <tbody>
              {data.map((l) => (
                <tr key={l._id} className="border-b border-border last:border-0">
                  <td className="p-3"><Badge variant="muted">{l.action}</Badge></td>
                  <td className="p-3">{l.admin?.name}</td>
                  <td className="p-3 text-muted-foreground">{l.targetType}</td>
                  <td className="p-3 text-muted-foreground">{l.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
