import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns';

export function parseDate(dateInput: string | Date): Date {
  if (typeof dateInput === 'string') {
    return parseISO(dateInput);
  }
  return dateInput;
}

/**
 * Formats reported time matching the Inzar design:
 * Today: "14:23"
 * Yesterday: "Yesterday"
 * Current year: "Nov 6"
 * Past years: "Oct 12, 2025"
 */
export function formatReportedTime(dateInput: string | Date): string {
  try {
    const d = parseDate(dateInput);
    if (isNaN(d.getTime())) return '-';

    if (isToday(d)) {
      return format(d, 'HH:mm');
    }
    if (isYesterday(d)) {
      return 'Yesterday';
    }
    const currentYear = new Date().getFullYear();
    if (d.getFullYear() === currentYear) {
      return format(d, 'MMM d');
    }
    return format(d, 'MMM d, yyyy');
  } catch {
    return '-';
  }
}

/**
 * Formats concise relative age matching the Inzar design:
 * "2 min", "12 min", "21 h", "3 d", "27 d"
 */
export function formatAge(dateInput: string | Date): string {
  try {
    const d = parseDate(dateInput);
    if (isNaN(d.getTime())) return '-';

    const distance = formatDistanceToNowStrict(d, { addSuffix: false });
    // Convert "2 minutes" -> "2 min", "3 hours" -> "3 h", "4 days" -> "4 d", "5 seconds" -> "5 s"
    return distance
      .replace(' seconds', 's')
      .replace(' second', 's')
      .replace(' minutes', ' min')
      .replace(' minute', ' min')
      .replace(' hours', ' h')
      .replace(' hour', ' h')
      .replace(' days', ' d')
      .replace(' day', ' d')
      .replace(' months', ' mo')
      .replace(' month', ' mo')
      .replace(' years', ' y')
      .replace(' year', ' y');
  } catch {
    return '-';
  }
}

/**
 * Formats full UTC timestamp for tooltips:
 * "2026-11-08 14:23:00 UTC"
 */
export function formatUtcTooltip(dateInput: string | Date): string {
  try {
    const d = parseDate(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return '';
  }
}
