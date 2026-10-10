import InboxManager, { PRAYER_ACTIONS, MESSAGE_ACTIONS } from "./InboxManager";

export function AdminPrayerRequests() {
  return <InboxManager title="Prayer Requests" subtitle="Requests submitted by visitors. Keep them private and pray over them." table="prayer_requests" statuses={["new", "read", "prayed_for", "archived"]} actions={PRAYER_ACTIONS} />;
}

export function AdminContactMessages() {
  return <InboxManager title="Contact Messages" subtitle="Messages sent through the website contact form." table="contact_messages" statuses={["unread", "read", "archived"]} actions={MESSAGE_ACTIONS} />;
}
