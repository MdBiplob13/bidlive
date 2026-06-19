/**
 * Bangladeshi Taka (৳) formatting using the Indian/Bengali numbering system
 * (lakh / crore grouping: 1,20,000 ; 1,00,00,000).
 * The platform uses ৳ ONLY — never USD.
 */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(str) {
  return String(str).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** Group an integer with the BD lakh/crore comma system. */
function groupBD(intStr) {
  if (intStr.length <= 3) return intStr;
  const last3 = intStr.slice(-3);
  const rest = intStr.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

/**
 * Format an amount in Taka.
 * @param {number} amount
 * @param {object} opts { locale: 'bn'|'en', symbol: boolean, decimals: number }
 */
export function formatTaka(amount, opts = {}) {
  const { locale = "en", symbol = true, decimals = 0 } = opts;
  if (amount == null || isNaN(amount)) amount = 0;

  const fixed = Number(amount).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  let grouped = groupBD(intPart);
  if (decPart) grouped += "." + decPart;

  let out = `৳${grouped}`;
  if (!symbol) out = grouped;
  if (locale === "bn") out = toBanglaDigits(out);
  return out;
}

/** Short form like ৳1.2L, ৳3.5Cr — handy for stats badges. */
export function formatTakaShort(amount, locale = "en") {
  if (amount == null || isNaN(amount)) amount = 0;
  let out;
  if (amount >= 1e7) out = `৳${(amount / 1e7).toFixed(amount % 1e7 === 0 ? 0 : 1)}Cr`;
  else if (amount >= 1e5) out = `৳${(amount / 1e5).toFixed(amount % 1e5 === 0 ? 0 : 1)}L`;
  else if (amount >= 1e3) out = `৳${(amount / 1e3).toFixed(amount % 1e3 === 0 ? 0 : 1)}K`;
  else out = `৳${amount}`;
  return locale === "bn" ? toBanglaDigits(out) : out;
}

/**
 * Minimum next-bid increment based on current price tier (in Taka).
 * Mirrors typical eBay-style step laddering, tuned for BDT.
 */
export function bidIncrement(current) {
  if (current < 1000) return 50;
  if (current < 5000) return 100;
  if (current < 20000) return 250;
  if (current < 100000) return 500;
  if (current < 500000) return 2000;
  return 5000;
}
