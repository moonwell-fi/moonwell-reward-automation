export interface EpochWindow {
  /** Unix seconds for the proposed epoch start: the 15th 00:00:00 UTC */
  start: number;
  /** Unix seconds for the proposed epoch end: the following 15th 00:00:00 UTC */
  end: number;
  /** end - start, in seconds (28–31 days) */
  durationSeconds: number;
}

/** Unix seconds for the 15th at 00:00:00 UTC of the given month (month: 0–11). */
function fifteenthOfMonthUTC(year: number, month: number): number {
  return Math.floor(Date.UTC(year, month, 15, 0, 0, 0) / 1000);
}

/**
 * Return the UPCOMING (proposed) epoch window for a query timestamp.
 * Epochs run from the 15th 00:00:00 UTC of one month to the 15th of the next.
 * The proposed epoch is the one AFTER the epoch containing `timestamp`
 * (mirrors the previous "current + 1" behaviour).
 */
export function getEpochWindow(timestamp: number): EpochWindow {
  const d = new Date(timestamp * 1000);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();

  const thisFifteenth = fifteenthOfMonthUTC(year, month);

  // Current epoch's start month: this month if at/after the 15th, else previous month.
  let curYear = year;
  let curMonth = month;
  if (timestamp < thisFifteenth) {
    curMonth -= 1;
    if (curMonth < 0) {
      curMonth = 11;
      curYear -= 1;
    }
  }

  // Proposed epoch starts the month after the current epoch's start.
  let startYear = curYear;
  let startMonth = curMonth + 1;
  if (startMonth > 11) {
    startMonth = 0;
    startYear += 1;
  }

  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth > 11) {
    endMonth = 0;
    endYear += 1;
  }

  const start = fifteenthOfMonthUTC(startYear, startMonth);
  const end = fifteenthOfMonthUTC(endYear, endMonth);
  return { start, end, durationSeconds: end - start };
}
