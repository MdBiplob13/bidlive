import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import { requireUser } from "@/lib/auth";
import { ok, created, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/conversations — list current user's conversations
export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const convos = await Conversation.find({ participants: user._id })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name avatar lastSeen")
    .populate("auction", "title images")
    .lean();
  return ok({
    conversations: convos.map((c) => ({
      ...c,
      _id: String(c._id),
      unreadForMe: c.unread?.[String(user._id)] || 0,
    })),
  });
});

// POST /api/conversations { recipientId, auction? } — find or create
export const POST = handler(async (req) => {
  const user = await requireUser();
  const { recipientId, auction } = await req.json();
  if (!recipientId || recipientId === String(user._id))
    return fail("Invalid recipient", 400);
  await connectDB();

  let convo = await Conversation.findOne({
    participants: { $all: [user._id, recipientId], $size: 2 },
  });
  if (!convo) {
    convo = await Conversation.create({
      participants: [user._id, recipientId],
      auction: auction || null,
    });
    convo = await convo.populate("participants", "name avatar lastSeen");
    return created({ conversation: { ...convo.toObject(), _id: String(convo._id) } });
  }
  await convo.populate("participants", "name avatar lastSeen");
  return ok({ conversation: { ...convo.toObject(), _id: String(convo._id) } });
});
