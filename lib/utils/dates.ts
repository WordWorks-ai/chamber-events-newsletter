import { format, isValid, parse, parseISO, subHours } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const INPUT_FORMATS = [
  "MMMM d, yyyy h:mm a",
  "MMMM d, yyyy h:mma",
  "MMM d, yyyy h:mm a",
  "MMM d, yyyy h:mma",
  "MMMM d, yyyy",
  "MMM d, yyyy",
  "EEEE, MMMM d, yyyy h:mm a",
  "EEEE, MMM d, yyyy h:mm a",
  "EEE, MMM d, yyyy h:mm a",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd"
];

function parseWithFormats(value: string): Date | null {
  for (const formatString of INPUT_FORMATS) {
    const parsed = parse(value, formatString, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function parseInputDate(value: string, timezone: string): Date | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const isoCandidate = parseISO(trimmed);
  if (isValid(isoCandidate)) {
    return isoCandidate;
  }

  const looksTimeZoned = /(z|utc|gmt|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  if (looksTimeZoned) {
    const nativeParsed = new Date(trimmed);
    if (isValid(nativeParsed)) {
      return nativeParsed;
    }
  }

  const formatParsed = parseWithFormats(trimmed);
  if (formatParsed) {
    return fromZonedTime(formatParsed, timezone);
  }

  const nativeParsed = new Date(trimmed);
  if (isValid(nativeParsed)) {
    return fromZonedTime(nativeParsed, timezone);
  }

  return null;
}

export function isStaleEvent(startAt: string, endAt: string | null, now: Date): boolean {
  const reference = endAt ? new Date(endAt) : new Date(startAt);
  return reference.getTime() < subHours(now, 24).getTime();
}

export function formatEventDateLabel(startAt: string, timezone: string, isAllDay: boolean): string {
  const datePattern = "EEEE, MMMM d";
  const timePattern = "h:mm a zzz";

  if (isAllDay) {
    return formatInTimeZone(startAt, timezone, datePattern);
  }

  return `${formatInTimeZone(startAt, timezone, datePattern)} at ${formatInTimeZone(
    startAt,
    timezone,
    timePattern
  )}`;
}

export function formatGeneratedDateLabel(now: Date, timezone: string): string {
  return formatInTimeZone(now, timezone, "MMMM d, yyyy 'at' h:mm a zzz");
}

export function groupKeyForDate(startAt: string, timezone: string): string {
  return formatInTimeZone(startAt, timezone, "yyyy-MM-dd");
}

export function groupLabelForDate(startAt: string, timezone: string): string {
  return formatInTimeZone(startAt, timezone, "EEEE, MMMM d, yyyy");
}

export function toIsoString(date: Date): string {
  return date.toISOString();
}

export function formatShortDate(value: string, timezone: string): string {
  return formatInTimeZone(value, timezone, "MMM d, yyyy");
}

export function formatTimeRange(startAt: string, endAt: string | null, timezone: string, isAllDay: boolean): string {
  if (isAllDay) {
    return "All day";
  }

  const startLabel = formatInTimeZone(startAt, timezone, "h:mm a");
  if (!endAt) {
    return `${startLabel} ${formatInTimeZone(startAt, timezone, "zzz")}`;
  }

  return `${startLabel} - ${formatInTimeZone(endAt, timezone, "h:mm a zzz")}`;
}

export function formatDisplayDate(startAt: string, timezone: string): string {
  return formatInTimeZone(startAt, timezone, "MMMM d, yyyy");
}

export function formatIsoDay(value: string): string {
  return format(new Date(value), "yyyy-MM-dd");
}
