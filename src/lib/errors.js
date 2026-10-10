// Turns raw database errors into messages an administrator can act on,
// and records them so the Admin Dashboard can show what is wrong.
const listeners = new Set();
const recent = [];

export function friendlyError(message = "") {
  const m = String(message);
  if (/row-level security|violates row/i.test(m)) {
    return "Your account is not set up as an administrator yet. In Supabase, add your user to the profiles table (see supabase/README.md), then try again.";
  }
  const cache = m.match(/Could not find the '([^']+)' column of '([^']+)'/i);
  if (cache) {
    return `The database is missing the column "${cache[1]}" on "${cache[2]}". Run the SQL migrations in supabase/migrations (see supabase/README.md), then reload the page.`;
  }
  const noCol = m.match(/column ([\w."]+) does not exist/i);
  if (noCol) {
    return `The website asked for a database column that does not exist (${noCol[1].replace(/"/g, "")}). Run the SQL migrations in supabase/migrations, then reload the page.`;
  }
  const noTable = m.match(/Could not find the table '([^']+)'|relation "([^"]+)" does not exist/i);
  if (noTable) {
    return `The database table "${(noTable[1] || noTable[2]).replace("public.", "")}" does not exist yet. Run the SQL migrations in supabase/migrations.`;
  }
  if (/null value in column "([^"]+)"/i.test(m)) {
    return `"${m.match(/null value in column "([^"]+)"/i)[1].replace(/_/g, " ")}" is required. Please fill it in.`;
  }
  if (/duplicate key value/i.test(m)) return "That entry already exists. Change the name or details and try again.";
  if (/violates check constraint/i.test(m)) return "One of the values is not allowed. Please check the form and try again.";
  if (/invalid input syntax/i.test(m)) return "One of the fields has a value in the wrong format. Please check the form and try again.";
  if (/JWT expired|not authenticated|Invalid Refresh Token/i.test(m)) return "Your session has expired. Please sign in again.";
  return m;
}

/** Log a database error (never swallowed) and remember it for the dashboard. */
export function reportDbError(where, error) {
  const message = error?.message || String(error);
  // eslint-disable-next-line no-console
  console.error(`[FGCK] ${where}:`, message);
  recent.unshift({ where, message, friendly: friendlyError(message), at: new Date().toISOString() });
  recent.length = Math.min(recent.length, 20);
  listeners.forEach((fn) => fn([...recent]));
}

export function subscribeDbErrors(fn) {
  listeners.add(fn);
  fn([...recent]);
  return () => listeners.delete(fn);
}
