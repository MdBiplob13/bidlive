export const COOKIE_NAME = process.env.COOKIE_NAME || "bidlive_token";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function buildAuthCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    },
  };
}

export function buildClearCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    },
  };
}
