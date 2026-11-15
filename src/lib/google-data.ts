/** Google Calendar blocking settings. Safe to import on the client. */

/** Google Calendar's event colours (ids from the Calendar API), with the swatches its app shows. */
export const googleColors = [
  { id: "11", name: "Tomato", hex: "#d50000" },
  { id: "4", name: "Flamingo", hex: "#e67c73" },
  { id: "6", name: "Tangerine", hex: "#f4511e" },
  { id: "5", name: "Banana", hex: "#f6bf26" },
  { id: "2", name: "Sage", hex: "#33b679" },
  { id: "10", name: "Basil", hex: "#0b8043" },
  { id: "7", name: "Peacock", hex: "#039be5" },
  { id: "9", name: "Blueberry", hex: "#3f51b5" },
  { id: "1", name: "Lavender", hex: "#7986cb" },
  { id: "3", name: "Grape", hex: "#8e24aa" },
  { id: "8", name: "Graphite", hex: "#616161" },
] as const;

/** What a calendar contributes to blocked time. */
export type CalendarMode = "colors" | "all" | "off";

export type GoogleCalendarChoice = { id: string; name: string; color: string; mode: CalendarMode };

/** The public part of the settings (no tokens). */
export type GoogleSettings = {
  connected: boolean;
  account: string;
  calendars: GoogleCalendarChoice[];
  /** Event colour ids that block time in "colors" calendars. Tomato (red) by default. */
  colors: string[];
  lastError?: string;
};

export const defaultColors = ["11"];
