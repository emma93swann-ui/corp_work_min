import { addMinutes, format, parse, setHours, setMinutes, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { EventConfig } from "./config";

export type TimeSlot = {
  startIso: string;
  label: string;
};

/** Weekday: 0=Sun … 6=Sat (JS getDay) */
export function isDateAvailable(
  date: Date,
  config: EventConfig,
  timeZone: string,
): boolean {
  const zoned = toZonedTime(date, timeZone);
  const today = toZonedTime(new Date(), timeZone);
  const dayStart = startOfDay(zoned);
  const todayStart = startOfDay(today);

  if (dayStart < todayStart) return false;

  const weekday = zoned.getDay();
  return config.availableWeekdays.includes(weekday);
}

export function getAvailableDatesInMonth(
  year: number,
  monthIndex: number,
  config: EventConfig,
  timeZone: string,
): string[] {
  const days: string[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const localNoon = new Date(year, monthIndex, day, 12, 0, 0);
    const utc = fromZonedTime(localNoon, timeZone);
    if (isDateAvailable(utc, config, timeZone)) {
      days.push(format(localNoon, "yyyy-MM-dd"));
    }
  }

  return days;
}

export function generateSlotsForDate(
  dateStr: string,
  config: EventConfig,
  timeZone: string,
): TimeSlot[] {
  const baseLocal = parse(dateStr, "yyyy-MM-dd", new Date());
  const slots: TimeSlot[] = [];
  const step = config.durationMinutes;
  const now = new Date();

  for (let hour = config.slotStartHour; hour < config.slotEndHour; hour++) {
    for (let minute = 0; minute < 60; minute += step) {
      if (hour === config.slotEndHour - 1 && minute + step > 60) continue;

      const local = setMinutes(setHours(baseLocal, hour), minute);
      const utc = fromZonedTime(local, timeZone);

      if (utc <= now) continue;

      const endUtc = addMinutes(utc, config.durationMinutes);
      const endLocal = toZonedTime(endUtc, timeZone);
      if (endLocal.getHours() > config.slotEndHour) continue;
      if (
        endLocal.getHours() === config.slotEndHour &&
        endLocal.getMinutes() > 0
      ) {
        continue;
      }

      slots.push({
        startIso: utc.toISOString(),
        label: format(local, "HH:mm"),
      });
    }
  }

  return slots;
}

export function formatSlotRange(
  startIso: string,
  durationMinutes: number,
  timeZone: string,
): string {
  const start = toZonedTime(new Date(startIso), timeZone);
  const end = addMinutes(start, durationMinutes);
  return `${format(start, "h:mma").toLowerCase()} - ${format(end, "h:mma").toLowerCase()}, ${format(start, "EEEE, MMMM d, yyyy")}`;
}

export function getTimezoneDisplayName(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "long",
    }).formatToParts(new Date());
    const name = parts.find((p) => p.type === "timeZoneName")?.value;
    return name || timeZone;
  } catch {
    return timeZone;
  }
}

export function getLocalTimeLabel(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    return "";
  }
}
