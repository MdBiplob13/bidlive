"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Users,
  ShieldCheck,
  Plus,
  Loader2,
  Lock,
  Phone,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PERMISSIONS = [
  { value: "manage_auctions", label: "Manage Auctions & User Change Requests" },
  { value: "manage_wallets", label: "Manage Wallets & Approve Cashflows" },
  { value: "manage_users", label: "Manage Users Directory (Suspend/Ban)" },
  { value: "view_reports", label: "View Financial Ledger Reports" },
  { value: "manage_categories", label: "Manage Categories List" },
];

export default function AdminEmployeesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Fetch employees
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "employees"],
    queryFn: async () => (await api.get("/admin/employees")).data.data,
  });

  const employees = data?.employees || [];

  // Verify only high level Admins can manage employees (as requested)
  const isHighAdmin = user?.role === "admin";

  const createMutation = useMutation({
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["admin", "employees"] });
      toast.success(d.message || "Employee created successfully.");
      setShowCreate(false);
      setName("");
      setPhone("");
      setPassword("");
      setSelectedPermissions([]);
    },
    onError: (err) => toast.error(err.message),
    mutationFn: async (payload) => {
      const res = await api.post("/admin/employees", payload);
      return res.data.data;
    },
  });

  const handleCheckboxChange = (value) => {
    setSelectedPermissions((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  if (isLoading) {
    return (
      <div className="grid place-items-center py-40">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !isHighAdmin) {
    return (
      <div className="py-20 text-center text-destructive flex flex-col items-center gap-2">
        <ShieldAlert className="size-10" />
        <p className="font-bold">Access Denied</p>
        <p className="text-sm text-muted-foreground">
          Only principal administrators can manage employee credentials and security permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-8 text-primary" />
            Employee Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create employee accounts, reset initial passwords, and allocate role permissions.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 size-4" /> Add Employee
        </Button>
      </div>

      {/* Employees Directory List */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h2 className="font-extrabold text-lg flex items-center gap-2">
          <Users className="size-5 text-primary" />
          Active Staff Directory
        </h2>

        {employees.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No employee staff profiles found. Click &quot;Add Employee&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Phone Contact</th>
                  <th className="py-3 px-4">Allocated Security Permissions</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-muted/30">
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <span className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        {emp.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="size-3.5 text-muted-foreground/85" />
                        {emp.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {emp.permissions && emp.permissions.length > 0 ? (
                          emp.permissions.map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-[10px] py-0 px-2">
                              {perm.replace(/_/g, " ")}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="text-[10px] capitalize">
                        {emp.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Employee Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              Register New Employee
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  name,
                  phone,
                  password,
                  permissions: selectedPermissions,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="empName">Full Name</Label>
                <Input
                  id="empName"
                  placeholder="E.g. Tanvir Rahman"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="empPhone">Phone Number</Label>
                <Input
                  id="empPhone"
                  placeholder="017xxxxxxxx"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>

              <div>
                <Label htmlFor="empPassword">Initial Password</Label>
                <Input
                  id="empPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label>Assign Functional Permissions</Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 border border-border p-3 rounded-lg bg-muted/20">
                  {PERMISSIONS.map((p) => (
                    <div key={p.value} className="flex items-start gap-2.5 text-xs">
                      <input
                        type="checkbox"
                        id={`perm-${p.value}`}
                        checked={selectedPermissions.includes(p.value)}
                        onChange={() => handleCheckboxChange(p.value)}
                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`perm-${p.value}`} className="leading-tight text-muted-foreground select-none">
                        {p.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Register
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
