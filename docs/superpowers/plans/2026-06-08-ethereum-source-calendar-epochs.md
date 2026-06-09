# Ethereum-source migration + calendar-month epochs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the reward automation to calendar-month epochs (15th→15th UTC, variable 28–31 days) and move the WELL bridge source from Moonbeam to Ethereum (foundation multisig holding xWELL), dropping on-chain `bridgeCost`.

**Architecture:** A new `getEpochWindow()` helper computes the proposed epoch's start/end/duration from the calendar. `markets.ts` assigns the variable duration into `config.secondsPerEpoch`, so the 12 existing reward-speed call sites need no change. The stkWELL APY cap is generalized from the `365/28` constant to `secondsPerYear / durationSeconds`. `generateJson.ts` is restructured so an Ethereum (`1`) source block (from `FOUNDATION_MULTISIG`) holds all `transferFrom`/`bridgeToRecipient` actions and Moonbeam becomes a bridged destination.

**Tech Stack:** TypeScript, Cloudflare Workers, viem, bignumber.js, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-08-ethereum-source-calendar-epochs-design.md`

**Branch:** `feat/ethereum-source-calendar-epochs`

---

## File structure

- **Create** `src/epochs.ts` — calendar epoch math (`getEpochWindow`, `EpochWindow`). Single responsibility: turn a query timestamp into the proposed epoch window.
- **Create** `test/epochs.spec.ts` — unit tests for `getEpochWindow`.
- **Modify** `src/markets.ts` — wire `getEpochWindow` in; assign `config.secondsPerEpoch`; set epoch timestamps; remove `getBridgeCost`/`bridgeCost`.
- **Modify** `src/generateJson.ts` — duration-based APY cap; `marketData.totalSeconds` for merkle/rewarder durations; Ethereum-source restructure; drop `nativeValue`.
- **Modify** `src/generateMarkdown.ts` — `marketData.totalSeconds` and dynamic `epochsPerYear`.
- **Modify** `test/generateJson.spec.ts` — assert new source block + Moonbeam-as-destination + cap math.
- **Modify** `src/types/config.ts` — calendar-model epoch helpers (dormant Slack subsystem; consistency only).

---

## Task 1: Calendar epoch helper (`getEpochWindow`)

**Files:**
- Create: `src/epochs.ts`
- Test: `test/epochs.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `test/epochs.spec.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getEpochWindow } from '../src/epochs';

// helper: unix seconds for a given UTC date
const ts = (y: number, m: number, d: number, h = 0) =>
  Math.floor(Date.UTC(y, m, d, h, 0, 0) / 1000);

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- test/epochs.spec.ts`
Expected: FAIL — `Failed to resolve import "../src/epochs"` / `getEpochWindow is not a function`.

- [ ] **Step 3: Implement `src/epochs.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- test/epochs.spec.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/epochs.ts test/epochs.spec.ts
git commit -m "feat: add calendar-month getEpochWindow helper"
```

---

## Task 2: Wire calendar epochs into `markets.ts`, remove bridgeCost

**Files:**
- Modify: `src/markets.ts` (import; `getMarketData` body; remove `getBridgeCost` at 145–152; epoch fields at ~1938–1942; remove `calculateEpochStartTimestamp` at ~1135–1143)

- [ ] **Step 1: Add the import**

In `src/markets.ts`, after the existing `import { ContractCall, ... } from "./utils";` line (line 4), add:

```ts
import { getEpochWindow } from "./epochs";
```

- [ ] **Step 2: Compute the epoch window and set the duration**

In `getMarketData`, find (line ~190):

```ts
  // Apply config overrides to get effective config for this request
  const config = applyConfigOverrides(configOverrides);
```

Immediately after it, add:

```ts
  // Calendar-month epoch (15th→15th UTC). Variable duration drives all
  // per-second reward-speed math, so every `config.secondsPerEpoch` use below
  // automatically reflects the real month length.
  const epochWindow = getEpochWindow(timestamp);
  config.secondsPerEpoch = epochWindow.durationSeconds;
```

- [ ] **Step 3: Remove the obsolete `calculateEpochStartTimestamp` helper**

Delete the helper (lines ~1135–1143):

```ts
  const calculateEpochStartTimestamp = () => {
    let epochStartTimestamp = config.firstEpochTimestamp;

    while (timestamp >= epochStartTimestamp + config.secondsPerEpoch) {
      epochStartTimestamp += config.secondsPerEpoch;
    }

    return epochStartTimestamp;
  };
```

(Remove the whole block. Nothing else references `calculateEpochStartTimestamp` after Step 4.)

- [ ] **Step 4: Set epoch timestamps from the window and drop bridgeCost**

Find the returned snapshot fields (lines ~1938–1942):

```ts
    epochStartTimestamp: calculateEpochStartTimestamp() + config.secondsPerEpoch,
    epochEndTimestamp: calculateEpochStartTimestamp() + config.secondsPerEpoch * 2,
    totalSeconds: config.secondsPerEpoch,
    wellPerEpoch: config.totalWellPerEpoch,
    bridgeCost: (await getBridgeCost()).toString(),
```

Replace with (note `bridgeCost` line removed entirely):

```ts
    epochStartTimestamp: epochWindow.start,
    epochEndTimestamp: epochWindow.end,
    totalSeconds: epochWindow.durationSeconds,
    wellPerEpoch: config.totalWellPerEpoch,
```

- [ ] **Step 5: Remove the now-unused `getBridgeCost` function**

Delete lines ~145–152:

```ts
async function getBridgeCost(): Promise<bigint> {
  const bridgeCost = await moonbeamClient.readContract({
    ...xWellRouterContract,
    functionName: "bridgeCost",
    args: [],
  });
  return bridgeCost as bigint;
}
```

Then remove `xWellRouterContract` from the `./config` import block (it is no longer used — it appears in the import list around line 32). Leave `xWellToken` (still used for the `quote` call and balanceOf).

- [ ] **Step 6: Verify it type-checks and the existing markets test still runs**

Run: `npx tsc --noEmit`
Expected: no errors referencing `markets.ts`.

Run: `npm test -- test/markets.spec.ts`
Expected: PASS (the live RPC test still returns data; `totalSeconds` is now 28–31 days). If RPC is unavailable in the environment, note it and move on — this test hits live chains.

- [ ] **Step 7: Commit**

```bash
git add src/markets.ts
git commit -m "feat: drive epochs from calendar window, remove bridgeCost"
```

---

## Task 3: Generalize the stkWELL APY cap (`generateJson.ts`)

**Files:**
- Modify: `src/generateJson.ts` (const at line 12; `calculateCappedWellHolderBalance` at 15–25; its 4 call sites)
- Test: `test/generateJson.spec.ts`

- [ ] **Step 1: Add a failing assertion to `test/generateJson.spec.ts`**

Append this test inside the top-level `describe('generateJson', ...)` block in `test/generateJson.spec.ts`:

```ts
  describe('stkWELL APY cap scales with epoch duration', () => {
    it('caps wellHolderBalance differently for 28- vs 31-day epochs (Optimism)', async () => {
      const base = {
        "1284": [], "8453": [], "10": [],
        optimism: {
          wellPerEpoch: "0",
          wellPerEpochDex: "0",
          wellPerEpochMarkets: "0",
          wellPerEpochSafetyModule: "0",
          wellHolderBalance: (1_000_000n * 10n ** 18n).toString(),
        },
        optimismStkWELLTotalSupply: (100_000_000n * 10n ** 18n).toString(),
        epochStartTimestamp: 1739577600,
      };

      const make = (durationSeconds: number) => ({
        ...base,
        epochEndTimestamp: 1739577600 + durationSeconds,
        totalSeconds: durationSeconds,
      });

      const r28 = await returnJson(make(28 * 86400), "Optimism");
      const r31 = await returnJson(make(31 * 86400), "Optimism");

      // 10% APY cap over a longer epoch allows a larger per-epoch contribution,
      // so stkWellEmissionsPerSecond for the 31-day epoch should differ from 28-day.
      expect(r31[10].stkWellEmissionsPerSecond).not.toBe(r28[10].stkWellEmissionsPerSecond);
      expect(r31[10].stkWellEmissionsPerSecond).toBeGreaterThan(0);
    });
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- test/generateJson.spec.ts -t "APY cap scales"`
Expected: FAIL — with the fixed `365/28` constant the cap ignores `totalSeconds`, so the two values are equal (or the helper signature lacks duration).

- [ ] **Step 3: Make the cap duration-based**

In `src/generateJson.ts`, replace the constant (line 12):

```ts
const EPOCHS_PER_YEAR = 365 / 28;
```

with:

```ts
const SECONDS_PER_YEAR = 31_536_000;
```

Then change `calculateCappedWellHolderBalance` (lines 15–25) to take the epoch duration:

```ts
// Calculate capped wellHolderBalance to achieve target APY for stkWELL
function calculateCappedWellHolderBalance(
  safetyModuleRewards: number,
  wellHolderBalance: number,
  stkWellTotalSupply: number,
  durationSeconds: number
): { cappedBalance: number; remainingBalance: number } {
  const maxRewardsPerEpoch =
    TARGET_STKWELL_APY * stkWellTotalSupply * (durationSeconds / SECONDS_PER_YEAR);
  const maxWellHolderContribution = Math.max(0, maxRewardsPerEpoch - safetyModuleRewards);
  const cappedBalance = Math.min(wellHolderBalance, maxWellHolderContribution);
  const remainingBalance = wellHolderBalance - cappedBalance;
  return { cappedBalance, remainingBalance };
}
```

- [ ] **Step 4: Pass `marketData.totalSeconds` at all four call sites**

There are four `calculateCappedWellHolderBalance(...)` calls. Add `marketData.totalSeconds` as the new fourth argument to each:

1. Base `withdrawWell` (≈ line 315):
```ts
                const { cappedBalance } = calculateCappedWellHolderBalance(
                  parseFloat(marketData.base.wellPerEpochSafetyModule),
                  parseFloat(marketData.base.wellHolderBalance) / 1e18,
                  parseFloat(marketData.baseStkWELLTotalSupply) / 1e18,
                  marketData.totalSeconds
                );
```
2. Base merkle stkWELL campaign (≈ line 339):
```ts
              const { cappedBalance } = calculateCappedWellHolderBalance(
                safetyModuleRewards,
                parseFloat(marketData.base.wellHolderBalance) / 1e18,
                parseFloat(marketData.baseStkWELLTotalSupply) / 1e18,
                marketData.totalSeconds
              );
```
3. Optimism `stkWellEmissionsPerSecond` (≈ line 471):
```ts
          const { cappedBalance } = calculateCappedWellHolderBalance(
            safetyModuleRewards,
            parseFloat(marketData.optimism.wellHolderBalance) / 1e18,
            parseFloat(marketData.optimismStkWELLTotalSupply) / 1e18,
            marketData.totalSeconds
          );
```
4. Optimism `withdrawWell` (≈ line 522):
```ts
          const { cappedBalance } = calculateCappedWellHolderBalance(
            parseFloat(marketData.optimism.wellPerEpochSafetyModule),
            parseFloat(marketData.optimism.wellHolderBalance) / 1e18,
            parseFloat(marketData.optimismStkWELLTotalSupply) / 1e18,
            marketData.totalSeconds
          );
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- test/generateJson.spec.ts -t "APY cap scales"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/generateJson.ts test/generateJson.spec.ts
git commit -m "feat: make stkWELL APY cap scale with epoch duration"
```

---

## Task 4: Replace fixed-epoch durations in outputs

**Files:**
- Modify: `src/generateJson.ts` (six `mainConfig.secondsPerEpoch` → `marketData.totalSeconds`)
- Modify: `src/generateMarkdown.ts` (`mainConfig.secondsPerEpoch` → `marketData.totalSeconds`; `epochsPerYear = 365/28` → `31536000 / marketData.totalSeconds`)

- [ ] **Step 1: `generateJson.ts` merkle/rewarder durations**

Replace every `duration: mainConfig.secondsPerEpoch,` (six occurrences — five merkle campaigns ≈ lines 352, 363, 374, 385, 396 and the Optimism multiRewarder ≈ line 542) with:

```ts
            duration: marketData.totalSeconds,
```

After this, keep the `mainConfig` import (still used: `mainConfig.initSale`, `mainConfig.optimism.rewarderNames`).

- [ ] **Step 2: `generateMarkdown.ts` — secondsPerEpoch**

Replace every `mainConfig.secondsPerEpoch` (lines 66, 70, 87, 95, 104, 124, 137, 152) with `marketData.totalSeconds`. Example at line 66:

```ts
        totalWellBySpeed: prev.totalWellBySpeed + (curr.newWellSupplySpeed * marketData.totalSeconds) + (curr.newWellBorrowSpeed * marketData.totalSeconds),
```

Apply the same `mainConfig.secondsPerEpoch` → `marketData.totalSeconds` substitution at every listed line.

- [ ] **Step 3: `generateMarkdown.ts` — dynamic epochsPerYear**

Replace every `const epochsPerYear = 365 / 28;` (lines 113, 145, 192, 220, 243, 282, 317) with:

```ts
          const epochsPerYear = 31536000 / marketData.totalSeconds;
```

(Match the existing indentation at each site.) The downstream `maxRewardsPerEpoch = (targetAPY * stkWellTotalSupply) / epochsPerYear` stays correct: `epochsPerYear = year/duration` ⇒ `maxRewardsPerEpoch = targetAPY * supply * duration / year`.

Keep the `mainConfig` import (still used: `mainConfig.base.dexRelayerAmount` at line 177).

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors. (`marketData` is in scope in both files: `generateMarkdown(marketData, ...)` param, and `returnJson(marketData, ...)` param.)

- [ ] **Step 5: Commit**

```bash
git add src/generateJson.ts src/generateMarkdown.ts
git commit -m "feat: use actual epoch duration in JSON and markdown outputs"
```

---

## Task 5: Add Ethereum-source addresses to config

**Files:**
- Modify: `src/config.ts` (add named-address exports near the other address consts ≈ line 13293)

These are emitted only as *names* in the JSON, but we add constants for documentation/consistency with the existing pattern (`baseWellHolder`, etc.). The `FOUNDATION_MULTISIG` literal address is unknown to the automation (added to contracts `chains/1.json` separately).

- [ ] **Step 1: Add Ethereum source constants**

After `export const optimismUSDCRewarder = ...` (line ~13293) add:

```ts
// --- Ethereum (chainId 1) governance hub: bridge source ---
// xWELL is held by FOUNDATION_MULTISIG on Ethereum and bridged out via Wormhole.
// These names must exist in moonwell-contracts-v2 chains/1.json so the
// RewardsDistribution template can resolve them.
export const ethereumChainId = 1;
export const ethereumGovernor = "MULTICHAIN_GOVERNOR_V2_PROXY"; // 0x8769B70ac7c93AF0e75de0D69877709B66d75838
export const ethereumFoundationMultisig = "FOUNDATION_MULTISIG"; // address added to chains/1.json separately
export const ethereumXWell = "xWELL_PROXY"; // 0xA88594D404727625A9437C3f886C7643872296AE
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: add Ethereum bridge-source address names"
```

---

## Task 6: Restructure `generateJson.ts` — Ethereum source block

**Files:**
- Modify: `src/generateJson.ts` (Moonbeam branch ≈ 109–207; Base branch source block ≈ 213–253; Optimism branch source block ≈ 412–448)
- Test: `test/generateJson.spec.ts`

**Design:** Each network branch emits its slice of the shared `1` (Ethereum) source block; `index.ts`'s deep-merge concatenates the `transferFrom` and `bridgeToRecipient` arrays. Each network contributes:
- one `transferFrom`: `from FOUNDATION_MULTISIG → MULTICHAIN_GOVERNOR_V2_PROXY`, `token xWELL_PROXY`, amount = that network's total bridged WELL;
- one `bridgeToRecipient`: `network = <destChainId>`, `target = TEMPORAL_GOVERNOR`, **no `nativeValue`**.

Moonbeam moves from source to a bridged destination: its `1284` block keeps `addRewardInfo`/`setRewardSpeed`/`stkWellEmissionsPerSecond`/reserves, but its `transferFrom`s are funded `from TEMPORAL_GOVERNOR` instead of `MGLIMMER_MULTISIG`.

> **Contracts-side coordination (out of automation scope):** Moonbeam markets distribute native WELL via the comptroller but now receive xWELL by bridge — an xWELL→WELL unwrap on Moonbeam feeds `UNITROLLER`. The automation emits the most-likely shape below; `RewardsDistribution.sol` resolves the token/unwrap. The `token` fields below keep their current values; adjust only if the contracts team specifies otherwise.

- [ ] **Step 1: Write failing tests for the new source block**

Add to `test/generateJson.spec.ts` inside the top-level describe:

```ts
  describe('Ethereum bridge source', () => {
    const baseMarketData = () => ({
      "1284": [], "8453": [], "10": [],
      moonbeam: {
        wellPerEpoch: "30000",
        wellPerEpochDex: "1000",
        wellPerEpochMarkets: "20000",
        wellPerEpochSafetyModule: "9000",
      },
      base: {
        wellPerEpoch: "50000",
        wellPerEpochDex: "0",
        wellPerEpochMarkets: "40000",
        wellPerEpochSafetyModule: "5000",
        wellHolderBalance: "0",
        vaultAmounts: { USDC: "0", WETH: "0", EURC: "0", cbBTC: "0", meUSDC: "0" },
      },
      optimism: {
        wellPerEpoch: "20000",
        wellPerEpochDex: "0",
        wellPerEpochMarkets: "18000",
        wellPerEpochSafetyModule: "2000",
        wellHolderBalance: "0",
        optimismUSDCVaultWellRewardAmount: 0,
      },
      baseStkWELLTotalSupply: "0",
      optimismStkWELLTotalSupply: "0",
      epochStartTimestamp: 1739577600,
      epochEndTimestamp: 1739577600 + 28 * 86400,
      totalSeconds: 28 * 86400,
    });

    it('Base emits an Ethereum (1) source block from FOUNDATION_MULTISIG with no nativeValue', async () => {
      const r = await returnJson(baseMarketData(), "Base");
      expect(r[1]).toBeDefined();
      expect(r[1].transferFrom[0].from).toBe("FOUNDATION_MULTISIG");
      expect(r[1].transferFrom[0].to).toBe("MULTICHAIN_GOVERNOR_V2_PROXY");
      expect(r[1].transferFrom[0].token).toBe("xWELL_PROXY");
      expect(r[1].bridgeToRecipient[0].network).toBe(8453);
      expect(r[1].bridgeToRecipient[0].target).toBe("TEMPORAL_GOVERNOR");
      expect(r[1].bridgeToRecipient[0]).not.toHaveProperty("nativeValue");
      // legacy Moonbeam source key must NOT carry the bridge anymore
      expect(r[1284]).toBeUndefined();
    });

    it('Moonbeam becomes a destination funded from TEMPORAL_GOVERNOR and bridged from Ethereum', async () => {
      const r = await returnJson(baseMarketData(), "Moonbeam");
      // Ethereum source carries the bridge to Moonbeam
      expect(r[1].bridgeToRecipient[0].network).toBe(1284);
      expect(r[1].transferFrom[0].from).toBe("FOUNDATION_MULTISIG");
      // Moonbeam destination block funds from TEMPORAL_GOVERNOR, not MGLIMMER
      const froms = r[1284].transferFrom.map((t: any) => t.from);
      expect(froms.every((f: string) => f === "TEMPORAL_GOVERNOR")).toBe(true);
      expect(froms).not.toContain("MGLIMMER_MULTISIG");
    });
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- test/generateJson.spec.ts -t "Ethereum bridge source"`
Expected: FAIL — `r[1]` is undefined; current code emits `r[1284]` with `MGLIMMER_MULTISIG`.

- [ ] **Step 3: Rewrite the Moonbeam branch (`network === "Moonbeam"`)**

Replace the entire `result` object in the Moonbeam branch (the `1284:` block plus surrounding, lines ~113–205) with the following. The market/dex/safety/reserve actions stay under `1284`; the source `transferFrom` + `bridgeToRecipient` move to a new `1` block; Moonbeam destination transfers are funded from `TEMPORAL_GOVERNOR`.

```ts
    const result: any = {
      1: {
        // Fund the Ethereum governor with xWELL for the Moonbeam bridge, then bridge to Moonbeam.
        transferFrom: [
          {
            amount: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e17)
              .toFixed(0)),
            from: "FOUNDATION_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_V2_PROXY",
            token: "xWELL_PROXY",
          },
        ].filter((transfer) => transfer.amount > 0),
        bridgeToRecipient: [
          {
            // On-chain Wormhole quoter resolves bridge cost at execution time (no nativeValue).
            amount: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e16)
              .toFixed(0)),
            network: 1284,
            target: "TEMPORAL_GOVERNOR",
          },
        ].filter((bridge) => bridge.amount > 0),
      },
      1284: {
        addRewardInfo: {
          amount: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
            .shiftedBy(18)
            .decimalPlaces(0, BigNumber.ROUND_CEIL)
            .plus(1e16)
            .toFixed(0)),
          endTimestamp: marketData.epochEndTimestamp,
          pid: 15,
          rewardPerSec: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
            .div(BigNumber(marketData.totalSeconds))
            .shiftedBy(18)
            .decimalPlaces(0, BigNumber.ROUND_FLOOR)
            .toFixed(0)),
          target: "STELLASWAP_REWARDER",
        },
        ...(hasReservesEnabled ? {
          initSale: {
            ...mainConfig.initSale,
            reserveAutomationContracts: marketData["1284"]
              .filter((market: MarketType) => {
                if (!market.reservesEnabled) return false;
                const reserves = market.reserves;
                const minimumReserves = market.minimumReserves;
                const amount = new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toNumber();
                return amount > 0;
              })
              .map((market: MarketType) => `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`)
          }
        } : {}),
        setRewardSpeed: moonbeamSetRewardSpeeds,
        stkWellEmissionsPerSecond: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochSafetyModule))
          .div(marketData.totalSeconds)
          .shiftedBy(18)
          .integerValue().toFixed(0)),
        transferFrom: [
          { // StellaSwap DEX incentives: from the bridged funds at the Temporal Governor to the governor
            amount: Number(BigNumber(parseFloat(marketData.moonbeam.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e16)
              .toFixed(0)),
            from: "TEMPORAL_GOVERNOR",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
          { // Market rewards: from the Temporal Governor to the Unitroller proxy
            amount: Number(BigNumber(marketData.moonbeam.wellPerEpochMarkets)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .toFixed(0)),
            from: "TEMPORAL_GOVERNOR",
            to: "UNITROLLER",
            token: "GOVTOKEN",
          },
          { // Safety Module rewards: from the Temporal Governor to the Ecosystem Reserve proxy
            amount: Number(BigNumber(marketData.moonbeam.wellPerEpochSafetyModule)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .toFixed(0)),
            from: "TEMPORAL_GOVERNOR",
            to: "ECOSYSTEM_RESERVE_PROXY",
            token: "GOVTOKEN",
          },
        ].filter(transfer => transfer.amount > 0),
        ...(hasReservesEnabled ? {
          transferReserves: marketData["1284"]
            .filter((market: MarketType) => market.reservesEnabled)
            .map((market: MarketType) => {
              const reserves = market.reserves;
              const minimumReserves = market.minimumReserves;
              return {
                amount: Number(new BigNumber(reserves)
                  .minus(new BigNumber(minimumReserves))
                  .shiftedBy(market.digits)
                  .decimalPlaces(0, BigNumber.ROUND_FLOOR)
                  .toFixed(0)),
                market: market.alias,
                to: `RESERVE_AUTOMATION_${market.alias.split('_')[1]}`
              };
            })
            .filter((item: { amount: number; market: string; to: string }) => item.amount > 0)
        } : {}),
        withdrawWell: [],
      },
      endTimeSTamp: marketData.epochEndTimestamp,
      startTimeStamp: marketData.epochStartTimestamp,
    };

    return result;
```

- [ ] **Step 4: Rewrite the Base branch source block (`network === "Base"`)**

In the Base branch, replace the `1284:` source block (lines ~213–253: the `bridgeToRecipient` + `transferFrom` object keyed `1284`) with a `1:` block. Replace:

```ts
      1284: {
        bridgeToRecipient: [
          {
            // Send all Base incentives (markets + safety module + vaults - dex) to Base Temporal Governor
            // Add extra padding (1e17) to cover rounding differences in 6 merkle campaigns + MRD transfer
            amount: Number(new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.base.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e17) // increased padding for merkle campaign rounding
              .toFixed(0)),
            nativeValue: Number(new BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 8453,
            target: "TEMPORAL_GOVERNOR",
          },
          /* commented out until we exhaust the funds in F-AERO on Base
          { // Send Base DEX incentives to DEX Relayer
            amount: Number(new BigNumber(marketData.base.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toFixed(0)),
              nativeValue: Number(new BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 8453,
            target: "DEX_RELAYER"
          }, */
        ],
        transferFrom: [
          {
            // Transfer all Base incentives (markets + safety module + vaults) from F-GLMR-LM to Multichain Governor for bridging
            amount: Number(new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e17)
              .toFixed(0)),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
        ].filter((transfer) => transfer.amount > 0),
      },
```

with:

```ts
      1: {
        bridgeToRecipient: [
          {
            // Send all Base incentives (markets + safety module + vaults - dex) to Base Temporal Governor.
            // On-chain Wormhole quoter resolves bridge cost at execution time (no nativeValue).
            // Extra padding (1e17) covers rounding across 6 merkle campaigns + the MRD transfer.
            amount: Number(new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.base.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e17)
              .toFixed(0)),
            network: 8453,
            target: "TEMPORAL_GOVERNOR",
          },
        ],
        transferFrom: [
          {
            // Fund the Ethereum governor with xWELL for the Base bridge.
            amount: Number(new BigNumber(parseFloat(marketData.base.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e17)
              .toFixed(0)),
            from: "FOUNDATION_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_V2_PROXY",
            token: "xWELL_PROXY",
          },
        ].filter((transfer) => transfer.amount > 0),
      },
```

- [ ] **Step 5: Rewrite the Optimism branch source block (`network === "Optimism"`)**

In the Optimism branch, replace the `1284:` source block (lines ~412–448) — the one containing `bridgeToRecipient` (Temporal Governor + conditional DEX_RELAYER) and the `transferFrom` from `MGLIMMER_MULTISIG`. Replace:

```ts
      1284: {
        bridgeToRecipient: [
          { // Send total well per epoch - the DEX incentives to Optimism Temporal Governor
            amount: Number(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.optimism.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toFixed(0)),
              nativeValue: Number(BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 10,
            target: "TEMPORAL_GOVERNOR"
          },
          ...(parseFloat(marketData.optimism.wellPerEpochDex) > 0 ? [{ // Send Optimism DEX incentives to DEX Relayer
            amount: Number(BigNumber(marketData.optimism.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e16)
              .toFixed(0)),
              nativeValue: Number(BigNumber(marketData.bridgeCost * 5).toFixed(0)), // pad bridgeCost by 5x in case of price fluctuations
            network: 10,
            target: "DEX_RELAYER"
          }] : []),
        ],
        transferFrom: [
          { // Transfer all Optimism incentives to the Multichain Governor for bridging
            amount: Number(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL) // always round up
              .plus(1e17)
              .toFixed(0)),
            from: "MGLIMMER_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_PROXY",
            token: "GOVTOKEN",
          },
        ].filter(transfer => transfer.amount > 0),
      },
```

with:

```ts
      1: {
        bridgeToRecipient: [
          { // Send total WELL per epoch minus DEX incentives to the Optimism Temporal Governor.
            // On-chain Wormhole quoter resolves bridge cost at execution time (no nativeValue).
            amount: Number(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .minus(parseFloat(marketData.optimism.wellPerEpochDex).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e16)
              .toFixed(0)),
            network: 10,
            target: "TEMPORAL_GOVERNOR"
          },
          ...(parseFloat(marketData.optimism.wellPerEpochDex) > 0 ? [{ // Optimism DEX incentives to DEX Relayer
            amount: Number(BigNumber(marketData.optimism.wellPerEpochDex)
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e16)
              .toFixed(0)),
            network: 10,
            target: "DEX_RELAYER"
          }] : []),
        ],
        transferFrom: [
          { // Fund the Ethereum governor with xWELL for the Optimism bridge.
            amount: Number(BigNumber(parseFloat(marketData.optimism.wellPerEpoch).toFixed(18))
              .shiftedBy(18)
              .decimalPlaces(0, BigNumber.ROUND_CEIL)
              .plus(1e17)
              .toFixed(0)),
            from: "FOUNDATION_MULTISIG",
            to: "MULTICHAIN_GOVERNOR_V2_PROXY",
            token: "xWELL_PROXY",
          },
        ].filter(transfer => transfer.amount > 0),
      },
```

- [ ] **Step 6: Run the new source-block tests**

Run: `npm test -- test/generateJson.spec.ts -t "Ethereum bridge source"`
Expected: PASS (both tests).

- [ ] **Step 7: Run the full generateJson suite (regression)**

Run: `npm test -- test/generateJson.spec.ts`
Expected: PASS. The pre-existing Moonbeam/Base/Optimism `initSale`/`transferReserves` tests assert keys under `1284`/`8453`/`10` destination blocks — those still exist. The old assertions did not check the source `1284` bridge block, so they remain valid.

- [ ] **Step 8: Commit**

```bash
git add src/generateJson.ts test/generateJson.spec.ts
git commit -m "feat: emit Ethereum (1) bridge-source block, Moonbeam as destination"
```

---

## Task 7: Update dormant Slack epoch helpers (`types/config.ts`)

**Files:**
- Modify: `src/types/config.ts` (lines 16–19 constants; 92–119 helper functions)
- Test: none new (subsystem not wired into `index.ts`); covered by type-check.

- [ ] **Step 1: Replace the fixed-epoch constants**

Replace lines 16–19:

```ts
// Epoch timing constants
export const FIRST_EPOCH_TIMESTAMP = 1737590400; // Jan 23, 2025 00:00:00 UTC
export const SECONDS_PER_EPOCH = 2419200; // 28 days in seconds
export const DAYS_PER_EPOCH = 28;
```

with:

```ts
// Epochs are calendar months running 15th 00:00:00 UTC -> next 15th (variable 28-31 days).
// Epoch numbering is anchored to the first day-15 epoch.
export const FIRST_EPOCH_YEAR = 2025;
export const FIRST_EPOCH_MONTH = 0; // January (0-indexed); epoch 1 starts 2025-01-15 UTC
```

- [ ] **Step 2: Rewrite the epoch helper functions**

Replace the helper block (lines 92–119: `getEpochNumber`, `getEpochStartTimestamp`, `getDaysUntilNextEpoch`) with calendar-based versions:

```ts
/** 15th at 00:00:00 UTC of a given year/month (month 0-indexed), in unix seconds. */
function fifteenthUTC(year: number, month: number): number {
  return Math.floor(Date.UTC(year, month, 15, 0, 0, 0) / 1000);
}

/**
 * Epoch number from a timestamp. Epoch 1 starts on FIRST_EPOCH_YEAR/MONTH the 15th.
 * Counts whole month-epochs elapsed since the anchor.
 */
export function getEpochNumber(timestamp: number = Date.now() / 1000): number {
  const d = new Date(timestamp * 1000);
  let year = d.getUTCFullYear();
  let month = d.getUTCMonth();
  // Before the 15th, we are still in the previous month's epoch.
  if (timestamp < fifteenthUTC(year, month)) {
    month -= 1;
    if (month < 0) { month = 11; year -= 1; }
  }
  const monthsElapsed = (year - FIRST_EPOCH_YEAR) * 12 + (month - FIRST_EPOCH_MONTH);
  return monthsElapsed + 1;
}

/** Start timestamp (15th 00:00 UTC) of a given epoch number. */
export function getEpochStartTimestamp(epochNumber: number): number {
  const monthsFromAnchor = epochNumber - 1;
  const totalMonths = FIRST_EPOCH_MONTH + monthsFromAnchor;
  const year = FIRST_EPOCH_YEAR + Math.floor(totalMonths / 12);
  const month = ((totalMonths % 12) + 12) % 12;
  return fifteenthUTC(year, month);
}

/** Days until the next epoch starts. */
export function getDaysUntilNextEpoch(timestamp: number = Date.now() / 1000): number {
  const currentEpoch = getEpochNumber(timestamp);
  const nextEpochStart = getEpochStartTimestamp(currentEpoch + 1);
  return Math.ceil((nextEpochStart - timestamp) / 86400);
}
```

`formatEpochDate` (line 116) is unchanged — it calls `getEpochStartTimestamp` and formats the date, which still works.

- [ ] **Step 3: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors. (Check `command.ts`/`reminder.ts` still compile — they import these helpers and the signatures are unchanged.)

- [ ] **Step 4: Commit**

```bash
git add src/types/config.ts
git commit -m "feat: calendar-month epoch helpers for Slack subsystem"
```

---

## Task 8: Full verification pass

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: clean (no new errors vs. baseline).

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: `epochs.spec.ts` and `generateJson.spec.ts` PASS. `markets.spec.ts` / `index.spec.ts` hit live RPC — they PASS if RPC reachable; if not, record the skip reason (not a code failure).

- [ ] **Step 3: Manual smoke test (optional, requires RPC)**

Run: `npm run dev` then in another shell:

```bash
curl -s "http://localhost:8787/?type=json&timestamp=1739577600" | python3 -m json.tool | head -60
```

Verify: a top-level `"1"` key exists with `transferFrom` (from `FOUNDATION_MULTISIG`, token `xWELL_PROXY`) and `bridgeToRecipient` entries with **no** `nativeValue`; `startTimeStamp`/`endTimeSTamp` align to the 15th; no `bridgeCost` field anywhere.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "test: verification fixes for ethereum-source + calendar epochs"
```

---

## Self-review notes (author)

- **Spec coverage:** §2 calendar epochs → Tasks 1, 2, 7. §3 APY cap → Task 3. §4 source restructure + drop bridgeCost/nativeValue → Tasks 2 (bridgeCost), 4–6. §5 testing → Tasks 1, 3, 6, 8. All sections mapped.
- **Type consistency:** `getEpochWindow`/`EpochWindow` used identically in Tasks 1–2. `calculateCappedWellHolderBalance` 4-arg signature consistent across Task 3 sites. Named strings `FOUNDATION_MULTISIG`/`MULTICHAIN_GOVERNOR_V2_PROXY`/`xWELL_PROXY` consistent across Tasks 5–6.
- **Flagged dependency:** Moonbeam-as-destination token/unwrap is contracts-side; emitted shape is the documented best guess (Task 6 note).
