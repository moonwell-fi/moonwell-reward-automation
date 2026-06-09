import { describe, it, expect } from 'vitest';
import { getEpochWindow } from '../src/epochs';

// helper: unix seconds for a given UTC date
const ts = (y: number, m: number, d: number, h = 0) => Math.floor(Date.UTC(y, m, d, h, 0, 0) / 1000);

describe('getEpochWindow', () => {
	it('after the 15th proposes next-month 15th→following 15th', () => {
		// Jan 20 2025 -> propose Feb 15 -> Mar 15 (28 days)
		const w = getEpochWindow(ts(2025, 0, 20));
		expect(w.start).toBe(ts(2025, 1, 15));
		expect(w.end).toBe(ts(2025, 2, 15));
		expect(w.durationSeconds).toBe(ts(2025, 2, 15) - ts(2025, 1, 15));
		expect(w.durationSeconds).toBe(28 * 86400);
	});

	it('before the 15th proposes this-month 15th→next 15th', () => {
		// Jan 10 2025 -> current epoch started Dec 15 -> propose Jan 15 -> Feb 15 (31 days)
		const w = getEpochWindow(ts(2025, 0, 10));
		expect(w.start).toBe(ts(2025, 0, 15));
		expect(w.end).toBe(ts(2025, 1, 15));
		expect(w.durationSeconds).toBe(31 * 86400);
	});

	it('exactly on the 15th at 00:00 UTC counts as on/after the 15th', () => {
		// Mar 15 00:00 -> current epoch = Mar 15 -> propose Apr 15 -> May 15 (30 days)
		const w = getEpochWindow(ts(2025, 2, 15));
		expect(w.start).toBe(ts(2025, 3, 15));
		expect(w.end).toBe(ts(2025, 4, 15));
		expect(w.durationSeconds).toBe(30 * 86400);
	});

	it('one second before the 15th still belongs to the previous epoch', () => {
		// Mar 14 23:59:59 -> current epoch = Feb 15 -> propose Mar 15 -> Apr 15 (31 days)
		const w = getEpochWindow(ts(2025, 2, 15) - 1);
		expect(w.start).toBe(ts(2025, 2, 15));
		expect(w.end).toBe(ts(2025, 3, 15));
		expect(w.durationSeconds).toBe(31 * 86400);
	});

	it('handles December -> January rollover', () => {
		// Dec 20 2025 -> propose Jan 15 2026 -> Feb 15 2026 (31 days)
		const w = getEpochWindow(ts(2025, 11, 20));
		expect(w.start).toBe(ts(2026, 0, 15));
		expect(w.end).toBe(ts(2026, 1, 15));
		expect(w.durationSeconds).toBe(31 * 86400);
	});

	it('handles February in a non-leap year (28 days)', () => {
		// Feb 10 2025 -> propose Feb 15 -> Mar 15 (28 days)
		const w = getEpochWindow(ts(2025, 1, 10));
		expect(w.start).toBe(ts(2025, 1, 15));
		expect(w.end).toBe(ts(2025, 2, 15));
		expect(w.durationSeconds).toBe(28 * 86400);
	});

	it('handles February in a leap year (29 days)', () => {
		// Feb 10 2024 -> propose Feb 15 -> Mar 15 (29 days, 2024 leap)
		const w = getEpochWindow(ts(2024, 1, 10));
		expect(w.start).toBe(ts(2024, 1, 15));
		expect(w.end).toBe(ts(2024, 2, 15));
		expect(w.durationSeconds).toBe(29 * 86400);
	});
});
