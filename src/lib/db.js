import { CONTRACT } from "../data/schemaContract";

/**
 * Keep only columns that exist in the schema contract and drop empty values, so a form can never
 * send a column the database does not have, or overwrite a NOT NULL column with null.
 * - "" and undefined are removed (database defaults apply on insert, existing values stay on update)
 * - pass `nullable: [...]` for columns where clearing the value should write NULL
 */
export function pickColumns(table, values, { nullable = [] } = {}) {
  const allowed = new Set(CONTRACT[table] || []);
  const out = {};
  for (const [key, value] of Object.entries(values)) {
    if (!allowed.has(key)) continue;
    if (value === undefined) continue;
    if (value === "" || value === null) {
      if (nullable.includes(key)) out[key] = null;
      continue;
    }
    out[key] = value;
  }
  return out;
}

// "17:45:00" or "17:45" -> "17:45" (what <input type="time"> expects)
export const toTimeInput = (t) => (t ? String(t).slice(0, 5) : "");

// "17:45" -> "5:45 PM"
export function formatTime(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}
