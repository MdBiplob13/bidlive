import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { messageSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { ok, created, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/messages?conversationId=...  — message history (marks read)
export const GET = handler(async (req) => {
  const user = await requireUser();
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) return fail("conversationId required", 400);
  await connectDB();

  const convo = await Conversation.findById(conversationId);
  if (!convo || !convo.participants.some((p) => String(p) === String(user._id)))
    return fail("Conversation not found", 404);

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  // mark incoming as read + clear unread counter
  await Message.updateMany(
    { conversation: conversationId, recipient: user._id, readAt: null },
    { readAt: new Date() }
  );
  convo.unread.set(String(user._id), 0);
  await convo.save();

  return ok({ messages: messages.map((m) => ({ ...m, _id: String(m._id) })) });
});

// POST /api/messages — persist a message (socket handles instant delivery)
export const POST = handler(async (req) => {
  const user = await requireUser();
  const data = messageSchema.parse(await req.json());
  await connectDB();

  let convo;
  if (data.conversationId) {
    convo = await Conversation.findById(data.conversationId);
  } else {
    convo = await Conversation.findOne({
      participants: { $all: [user._id, data.recipientId], $size: 2 },
    });
    if (!convo) {
      convo = await Conversation.create({
        participants: [user._id, data.recipientId],
        auction: data.auction || null,
      });
    }
  }
  if (!convo) return fail("Conversation not found", 404);

  const message = await Message.create({
    conversation: convo._id,
    sender: user._id,
    recipient: data.recipientId,
    text: data.text,
    deliveredAt: new Date(),
  });

  convo.lastMessage = data.text.slice(0, 120);
  convo.lastMessageAt = new Date();
  convo.lastSender = user._id;
  const prev = convo.unread.get(String(data.recipientId)) || 0;
  convo.unread.set(String(data.recipientId), prev + 1);
  await convo.save();

  notify({
    user: data.recipientId,
    type: "message",
    title: { en: "New message", bn: "নতুন মেসেজ" },
    body: { en: `${user.name}: ${data.text.slice(0, 60)}`, bn: `${user.name}: ${data.text.slice(0, 60)}` },
    link: `/dashboard/messages?c=${convo._id}`,
  }).catch(() => {});

  return created({
    message: { ...message.toObject(), _id: String(message._id) },
    conversationId: String(convo._id),
  });
});
