"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, ArrowLeft, Loader2, CheckCheck, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Messenger() {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const { socket, onlineUsers } = useSocket();
  const qc = useQueryClient();
  const params = useSearchParams();
  const [activeId, setActiveId] = useState(params.get("c") || null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);

  const { data: convos } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => (await api.get("/conversations")).data.data.conversations,
    refetchInterval: 15000,
  });

  const { data: messages, isLoading: loadingMsgs } = useQuery({
    queryKey: ["messages", activeId],
    enabled: !!activeId,
    queryFn: async () => (await api.get(`/messages?conversationId=${activeId}`)).data.data.messages,
  });

  const active = convos?.find((c) => c._id === activeId);
  const other = active?.participants?.find((p) => String(p._id) !== String(user?._id));

  // Join conversation room + listen for realtime events
  useEffect(() => {
    if (!socket || !activeId) return;
    socket.emit("conversation:join", activeId);
    if (other) socket.emit("message:read", { conversationId: activeId, recipientId: other._id });

    const onNew = (payload) => {
      if (payload.conversationId === activeId) {
        qc.invalidateQueries({ queryKey: ["messages", activeId] });
      }
      qc.invalidateQueries({ queryKey: ["conversations"] });
    };
    const onTypingStart = ({ conversationId }) => conversationId === activeId && setTyping(true);
    const onTypingStop = ({ conversationId }) => conversationId === activeId && setTyping(false);
    const onRead = ({ conversationId }) => conversationId === activeId && qc.invalidateQueries({ queryKey: ["messages", activeId] });

    socket.on("message:new", onNew);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("message:read", onRead);
    return () => {
      socket.emit("conversation:leave", activeId);
      socket.off("message:new", onNew);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("message:read", onRead);
    };
  }, [socket, activeId, other, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const onType = () => {
    if (!socket || !other) return;
    socket.emit("typing:start", { conversationId: activeId, recipientId: other._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId: activeId, recipientId: other._id });
    }, 1200);
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !other) return;
    setText("");
    try {
      const { data } = await api.post("/messages", {
        conversationId: activeId,
        recipientId: other._id,
        text: body,
      });
      const message = data.data.message;
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      socket?.emit("message:send", { conversationId: activeId, recipientId: other._id, message });
    } catch (err) {
      setText(body);
    }
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-card md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div className={cn("border-r border-border md:block", activeId ? "hidden" : "block")}>
        <div className="border-b border-border p-4 font-bold">{locale === "bn" ? "মেসেজ" : "Messages"}</div>
        <div className="overflow-y-auto">
          {!convos?.length ? (
            <p className="p-4 text-sm text-muted-foreground">{locale === "bn" ? "কোনো কথোপকথন নেই।" : "No conversations."}</p>
          ) : convos.map((c) => {
            const o = c.participants.find((p) => String(p._id) !== String(user?._id));
            return (
              <button key={c._id} onClick={() => setActiveId(c._id)} className={cn("flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-muted", activeId === c._id && "bg-muted")}>
                <div className="relative">
                  <Avatar><AvatarFallback>{o?.name?.[0] || "?"}</AvatarFallback></Avatar>
                  {onlineUsers.has(String(o?._id)) && <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card bg-success" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{o?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.lastMessage || "…"}</p>
                </div>
                {c.unreadForMe > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{c.unreadForMe}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat panel */}
      <div className={cn("flex flex-col", activeId ? "flex" : "hidden md:flex")}>
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare className="size-12" />
            <p>{locale === "bn" ? "একটি কথোপকথন নির্বাচন করুন" : "Select a conversation"}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-border p-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveId(null)}><ArrowLeft className="size-5" /></Button>
              <Avatar><AvatarFallback>{other?.name?.[0] || "?"}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{other?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {onlineUsers.has(String(other?._id)) ? (locale === "bn" ? "অনলাইন" : "Online") : (locale === "bn" ? "অফলাইন" : "Offline")}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-muted/30 p-4">
              {loadingMsgs ? (
                <div className="grid place-items-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
              ) : messages?.map((m) => {
                const mine = String(m.sender) === String(user?._id);
                return (
                  <div key={m._id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm", mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-card border border-border")}>
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      {mine && (
                        <span className="mt-0.5 flex justify-end text-[10px] opacity-80">
                          {m.readAt ? <CheckCheck className="size-3.5" /> : <Check className="size-3.5" />}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
              <Input value={text} onChange={(e) => { setText(e.target.value); onType(); }} placeholder={locale === "bn" ? "মেসেজ লিখুন..." : "Type a message..."} />
              <Button type="submit" size="icon" disabled={!text.trim()}><Send className="size-4" /></Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="grid place-items-center py-40"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <Messenger />
    </Suspense>
  );
}
