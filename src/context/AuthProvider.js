"use client";
import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

const AuthContext = createContext(null);

async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data?.data?.user ?? null;
}

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 60000,
    retry: false,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["me"] });
  const setUser = (u) => qc.setQueryData(["me"], u);

  const logout = async () => {
    await api.post("/auth/logout");
    qc.setQueryData(["me"], null);
    qc.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthed: !!user,
        isAdmin: user?.role === "admin",
        refresh,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
