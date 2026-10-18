/** Compare calendar dates in the event's local timezone, including the full event day. */
export function isUpcomingEvent(
  event: { status: "upcoming" | "past"; date: Date; dateConfirmed: boolean },
  now = new Date(),
) {
  if (event.status !== "upcoming" || !event.dateConfirmed) return false;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return event.date.toISOString().slice(0, 10) >= today;
}
export function eventAnnouncementLabel(
  status: "confirmed" | "save-the-date" | "planned",
) {
  return status === "save-the-date"
    ? "Save the date"
    : status === "planned"
      ? "Planned"
      : "Upcoming";
}
