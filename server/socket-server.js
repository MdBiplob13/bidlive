/**
 * Standalone Socket.io server — REALTIME IS USED ONLY FOR MESSAGING
 * (chat delivery, presence, typing indicators, read receipts).
 *
 * Bidding is intentionally NOT realtime (per product spec). This server does
 * not touch the database; persistence is handled by Next.js API routes. The
 * server simply relays events between authenticated, connected clients.
 *
 * Run with:  npm run socket   (default port 4000)
 */
import express from "express";
import http from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const PORT = process.env.PORT || process.env.SOCKET_PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "bidlive-socket" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true, methods: ["GET", "POST"] },
});

// userId -> Set of socket ids (a user may have multiple tabs/devices)
const online = new Map();

function setOnline(userId, socketId) {
  if (!online.has(userId)) online.set(userId, new Set());
  online.get(userId).add(socketId);
}
function setOffline(userId, socketId) {
  const set = online.get(userId);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    online.delete(userId);
    return true; // fully offline
  }
  return false;
}

// Auth handshake: client sends its JWT (from cookie value) in auth.token
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No auth token"));
    const payload = jwt.verify(token, JWT_SECRET);
    socket.userId = payload.id;
    next();
  } catch {
    next(new Error("Invalid auth token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  const fresh = !online.has(userId);
  setOnline(userId, socket.id);

  // Personal room for direct delivery regardless of which conversation is open
  socket.join(`user:${userId}`);

  if (fresh) socket.broadcast.emit("presence:update", { userId, online: true });

  // Let the newcomer know who's online
  socket.emit("presence:list", { online: Array.from(online.keys()) });

  socket.on("presence:check", (id, cb) => {
    if (typeof cb === "function") cb({ online: online.has(id) });
  });

  // Join a conversation room
  socket.on("conversation:join", (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });
  socket.on("conversation:leave", (conversationId) => {
    socket.leave(`conv:${conversationId}`);
  });

  // Relay a message (already persisted by the API) to the recipient instantly
  socket.on("message:send", (msg) => {
    // msg: { conversationId, recipientId, message }
    io.to(`user:${msg.recipientId}`).emit("message:new", msg);
    socket.to(`conv:${msg.conversationId}`).emit("message:new", msg);
  });

  // Typing indicator
  socket.on("typing:start", ({ conversationId, recipientId }) => {
    io.to(`user:${recipientId}`).emit("typing:start", { conversationId, userId });
  });
  socket.on("typing:stop", ({ conversationId, recipientId }) => {
    io.to(`user:${recipientId}`).emit("typing:stop", { conversationId, userId });
  });

  // Read receipts
  socket.on("message:read", ({ conversationId, recipientId }) => {
    io.to(`user:${recipientId}`).emit("message:read", { conversationId, byUserId: userId });
  });

  socket.on("disconnect", () => {
    const fullyOffline = setOffline(userId, socket.id);
    if (fullyOffline) {
      socket.broadcast.emit("presence:update", { userId, online: false, lastSeen: Date.now() });
    }
  });
});

server.listen(PORT, () => {
  console.log(`⚡ BidLive socket server running on http://localhost:${PORT}`);
  console.log(`   Allowing client origin: ${CLIENT_ORIGIN}`);
});
