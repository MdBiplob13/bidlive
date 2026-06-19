import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export function ok(data, init = {}) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function created(data) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function fail(message, status = 400, extra = {}) {
  return NextResponse.json(
    { success: false, message, ...extra },
    { status }
  );
}

/**
 * Wrap a route handler so thrown AuthErrors / ZodErrors / generic errors
 * become consistent JSON responses. Keeps handlers clean.
 */
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof AuthError) {
        return fail(err.message, err.status);
      }
      if (err?.name === "ZodError") {
        return fail("Validation failed", 422, { errors: err.flatten?.() ?? err.issues });
      }
      if (err?.code === 11000) {
        return fail("This value is already in use", 409, { keyValue: err.keyValue });
      }
      console.error("[API ERROR]", err);
      return fail("Internal server error", 500);
    }
  };
}
