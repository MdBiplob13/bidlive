import Notification from "@/models/Notification";

/**
 * Create a notification. Bilingual title/body objects ({ en, bn }).
 * Best-effort: never throws into the caller's critical path.
 */
export async function notify({ user, type, title, body, link = "", meta = {} }) {
  try {
    return await Notification.create({ user, type, title, body, link, meta });
  } catch (e) {
    console.error("[notify] failed", e.message);
    return null;
  }
}

export async function notifyMany(users, payload) {
  return Promise.all(users.map((user) => notify({ ...payload, user })));
}
