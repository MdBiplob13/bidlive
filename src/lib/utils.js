import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\sঀ-৿-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Returns { days, hours, minutes, seconds, total, ended }. */
export function timeLeft(endDate, now = Date.now()) {
  const end = new Date(endDate).getTime();
  const total = end - now;
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, ended: true };
  }
  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
    ended: false,
  };
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function maskPhone(phone = "") {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}
