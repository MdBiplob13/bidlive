"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

/**
 * Connects to the messaging socket server once the user is authenticated.
 * Returns { socket, connected, onlineUsers }.
 */
export function useSocket() {
  const { isAuthed } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!isAuthed) return;
    let active = true;

    (async () => {
      try {
        const { data } = await api.get("/auth/socket-token");
        if (!active) return;
        const socket = io(SOCKET_URL, {
          auth: { token: data.data.token },
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("presence:list", ({ online }) => setOnlineUsers(new Set(online)));
        socket.on("presence:update", ({ userId, online }) => {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            if (online) next.add(userId);
            else next.delete(userId);
            return next;
          });
        });
      } catch {
        /* socket server may be offline — chat still works via REST */
      }
    })();

    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthed]);

  return { socket: socketRef.current, connected, onlineUsers };
}
