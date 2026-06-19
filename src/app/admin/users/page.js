"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Search, Ban, UserCheck, Trash2, Shield } from "lucide-react";
import api from "@/lib/api";
import { maskPhone } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

const STATUS_VARIANT = { active: "success", suspended: "muted", banned: "destructive" };

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", q, status, page],
    queryFn: async () => (await api.get(`/admin/users?q=${encodeURIComponent(q)}&status=${status}&page=${page}`)).data.data,
  });

  const action = useMutation({
    mutationFn: async ({ userId, action, reason }) => api.patch("/admin/users", { userId, action, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Done"); },
    onError: (e) => toast.error(e.message),
  });

  const doAction = (u, act) => {
    if (act === "delete" && !confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    let reason = "";
    if (act === "ban") reason = prompt("Ban reason?") || "";
    action.mutate({ userId: u._id, action: act, reason });
  };

  return (
    <div>
      <PageHeader title="Users" subtitle={`${data?.total ?? "…"} total`} />
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name or phone" className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="all">All</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
            ) : !data?.users?.length ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No users found</td></tr>
            ) : data.users.map((u) => (
              <tr key={u._id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted-foreground">{maskPhone(u.phone)}</td>
                <td className="p-3">{u.role === "admin" ? <Badge variant="accent">admin</Badge> : "user"}</td>
                <td className="p-3"><Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge></td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {u.status !== "active" ? (
                      <Button size="sm" variant="outline" onClick={() => doAction(u, "activate")} title="Activate"><UserCheck className="size-4" /></Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => doAction(u, "suspend")} title="Suspend"><Shield className="size-4" /></Button>
                    )}
                    {u.status !== "banned" && <Button size="sm" variant="outline" onClick={() => doAction(u, "ban")} title="Ban" className="text-destructive"><Ban className="size-4" /></Button>}
                    <Button size="sm" variant="outline" onClick={() => doAction(u, "delete")} title="Delete" className="text-destructive"><Trash2 className="size-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">{page} / {data.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
