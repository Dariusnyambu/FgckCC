// Turns raw database errors into messages an administrator can act on.
export function friendlyError(message = "") {
  if (/row-level security|violates row/i.test(message)) {
    return "Your account is not set up as an administrator yet. In Supabase, add your user to the profiles table (see the README), then try again.";
  }
  return message;
}
