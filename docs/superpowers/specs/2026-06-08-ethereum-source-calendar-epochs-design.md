# Design: Ethereum-source migration + calendar-month epochs

**Date:** 2026-06-08
**Repo:** `moonwell-reward-automation`
**Status:** Approved design, pending implementation plan

## Problem

The Moonwell governor is now live on Ethereum (`MultichainGovernorV2`, proxy
`0x8769B70ac7c93AF0e75de0D69877709B66d75838`). The reward automation still
treats Moonbeam as the bridge source for WELL and uses fixed 28-day epochs.
Three changes are required:

1. **Move the WELL bridge source from Moonbeam to Ethereum.** A foundation
   multisig on Ethereum holds **xWELL** and bridges it out via the Wormhole
   bridge adapter to Moonbeam, Base, and Optimism.
2. **Variable epoch length** matching the calendar month (28–31 days) instead
   of a fixed 28-day (`2,419,200s`) period.
3. **Epoch start anchored to the 15th** of each month (00:00:00 UTC).

## Decisions captured during brainstorming

- The Ethereum foundation multisig holds **xWELL** (not WELL), so **no
  WELL→xWELL router/lockbox conversion** is involved on the source side.
- **`bridgeCost` is dropped.** The on-chain Wormhole quoter resolves bridge
  cost at execution time, so the automation no longer fetches `bridgeCost` or
  emits a `nativeValue` field.
- **No new contracts template.** The existing `RewardsDistribution.sol`
  template is reused (contracts side will re-point the source key; out of scope
  for the automation).
- **No config-driven address abstraction.** Addresses are emitted as named
  strings exactly as today; the foundation multisig is emitted as the name
  `FOUNDATION_MULTISIG` (its literal address is added to the contracts
  `chains/1.json` separately — the automation never needs the raw address).
- **Moonbeam becomes a destination.** Ethereum bridges xWELL to all three of
  Moonbeam, Base, and Optimism. The old `MGLIMMER_MULTISIG → MULTICHAIN_GOVERNOR`
  source flow is removed entirely.
- **`totalWellPerEpoch` stays ≈ 13.14M per epoch** (annual emission drops from
  ~13× to ~12× — accepted). Per-second speed = budget ÷ actual month seconds.
- **Epoch boundary = 15th 00:00:00 UTC → 15th 00:00:00 UTC** of the next month.

## Scope & phasing

Two workstreams, both shipped in this effort:

- **A. Calendar-month epochs (changes 2 + 3)** — self-contained, no external
  dependency, testable against live data immediately.
- **B. Ethereum bridge source (change 1)** — restructures `generateJson.ts`.
  Depends on contracts-side work landing separately:
  - address-book entries: `FOUNDATION_MULTISIG` (Ethereum), Moonbeam
    `TEMPORAL_GOVERNOR`;
  - a source-key change in `RewardsDistribution.sol` so it reads source actions
    from the Ethereum key.

These dependencies are contracts-side; the automation emits the new shape
regardless. There is **no feature flag / config switch** — the new output shape
is emitted directly (per the "no config drive" decision).

## Section 2 — Calendar-month epoch model

**Rule:** an epoch runs from the **15th 00:00:00 UTC** of one month to the
**15th 00:00:00 UTC** of the next month. Duration is whatever the calendar
gives (28–31 days). The fixed `secondsPerEpoch = 2,419,200` constant and the
`firstEpochTimestamp` anchor become obsolete.

### New helper

`getEpochWindow(timestamp) → { start, end, durationSeconds }`, in `config.ts`
(or a small dedicated `epochs.ts`). Computed with `Date.UTC` for the relevant
15ths. It returns the **upcoming** epoch (the one being proposed), preserving
today's "configure current + 1" semantics.

Reference semantics (mirrors current behaviour):
- `currentEpochStart` = 15th 00:00 UTC of the month containing `timestamp` if
  `timestamp ≥` that 15th, else the 15th of the previous month.
- `start` (proposed epoch) = the 15th of the month **after** `currentEpochStart`'s
  month.
- `end` = the 15th of the month after `start`.
- `durationSeconds = end - start`.

### Call-site changes

- `markets.ts`: replace `calculateEpochStartTimestamp()` with `getEpochWindow()`.
  Every reward-speed calculation that divides by `config.secondsPerEpoch`
  instead divides by the proposed epoch's `durationSeconds`. The returned
  snapshot's `totalSeconds`, `epochStartTimestamp`, and `epochEndTimestamp`
  come from `getEpochWindow()`.
- `generateJson.ts` / `generateMarkdown.ts`: every `mainConfig.secondsPerEpoch`
  reference uses `marketData.totalSeconds` instead.
- `types/config.ts` (the dormant Slack bot's `FIRST_EPOCH_TIMESTAMP`,
  `SECONDS_PER_EPOCH`, `DAYS_PER_EPOCH`, `getEpochNumber`,
  `getEpochStartTimestamp`, `getDaysUntilNextEpoch`, `formatEpochDate`) updated
  to the calendar model for consistency. Low-risk: this subsystem is not wired
  into `index.ts`.

`totalWellPerEpoch` stays ≈ 13.14M. Because speed = budget ÷ `durationSeconds`,
a longer month simply spreads the same per-epoch budget over more seconds.

## Section 3 — APY-cap generalization

The 10% stkWELL APY cap currently hardcodes `EPOCHS_PER_YEAR = 365 / 28` in
`generateJson.ts` and repeats `365 / 28` several times in
`generateMarkdown.ts`. With variable months this is wrong. Replace with a
duration-based form:

```
maxRewardsPerEpoch = TARGET_STKWELL_APY * stkWellTotalSupply * (durationSeconds / SECONDS_PER_YEAR)
```

- `TARGET_STKWELL_APY = 0.10`
- `SECONDS_PER_YEAR = 31_536_000`
- `durationSeconds` = the proposed epoch's actual length

This keeps the cap exactly correct for any month length and removes the
duplicated magic number from both files.

## Section 4 — Ethereum bridge source (`generateJson.ts` restructure)

Today each network's `returnJson()` emits a Moonbeam (`1284`) source block (its
`transferFrom` from `MGLIMMER_MULTISIG` plus a `bridgeToRecipient`), and
`index.ts` deep-merges the per-network results.

### New model

**Source block keyed `1` (Ethereum)**, aggregated across networks via the same
deep-merge:

- `transferFrom`: `from: FOUNDATION_MULTISIG → to: MULTICHAIN_GOVERNOR_V2_PROXY`,
  `token: xWELL_PROXY` (replaces `MGLIMMER_MULTISIG → MULTICHAIN_GOVERNOR_PROXY`
  / `GOVTOKEN`).
- `bridgeToRecipient`: one entry per destination (`1284`, `8453`, `10`) →
  `TEMPORAL_GOVERNOR`. **No `nativeValue` / `bridgeCost`** — the on-chain
  Wormhole quoter resolves cost at execution time.

**Moonbeam (`1284`) becomes a destination** like Base/Optimism:

- Drop its `bridgeToRecipient` and `MGLIMMER_MULTISIG` transfers.
- Keep `setRewardSpeed` (comptroller), `addRewardInfo` (StellaSwap),
  `stkWellEmissionsPerSecond`.
- Fund via `transferFrom` from Moonbeam `TEMPORAL_GOVERNOR`.

**Base / Optimism** destination blocks are largely unchanged (already
`TEMPORAL_GOVERNOR`-funded), minus any `bridgeCost` / `nativeValue` references.

### Code removals

- `getBridgeCost()` and the `xWellRouterContract` `bridgeCost` read in
  `markets.ts`.
- The `bridgeCost` field in the returned snapshot.
- All `nativeValue` fields in `bridgeToRecipient` entries in `generateJson.ts`.

### Flagged coordination point (contracts-side, not automation)

Moonbeam markets distribute **native WELL** via the comptroller, but now
receive **xWELL** by bridge — so an xWELL→WELL unwrap on Moonbeam is needed
before funding `UNITROLLER`. The automation emits the Moonbeam destination
block in the most likely shape (`transferFrom TEMPORAL_GOVERNOR → UNITROLLER`),
and the token/unwrap handling is resolved by `RewardsDistribution.sol` on the
contracts side. This is explicitly out of scope for the automation but noted so
the contracts work is coordinated.

## Section 5 — Testing

- **Unit tests for `getEpochWindow()`:** 15th-boundary cases, month rollover
  (Dec→Jan), February (28 and 29 days), 30- vs 31-day months, a timestamp
  exactly on the 15th 00:00 UTC, and just before / after midnight UTC.
- **Extend `generateJson.spec.ts`:** assert the `1` source block
  (`FOUNDATION_MULTISIG` transferFrom + `bridgeToRecipient` with no
  `nativeValue`), Moonbeam-as-destination shape, and APY-cap math across a
  28-day and a 31-day epoch.
- **Manual verification:** run `?type=json` and `?type=markdown` for a known
  timestamp; eyeball the `1` source block, epoch durations, and APRs.

## Out of scope

- Contracts-repo changes (`RewardsDistribution.sol` source-key re-point,
  `chains/1.json` `FOUNDATION_MULTISIG` / Moonbeam `TEMPORAL_GOVERNOR` entries,
  Moonbeam xWELL→WELL unwrap mechanics).
- The Slack bot wiring (remains dormant; `types/config.ts` is updated only for
  internal consistency).
- Any change to `totalWellPerEpoch` or the network allocation splits.

## Reference addresses (from `moonwell-contracts-v2`)

| Name | Chain | Address |
| --- | --- | --- |
| `MULTICHAIN_GOVERNOR_V2_PROXY` | Ethereum (1) | `0x8769B70ac7c93AF0e75de0D69877709B66d75838` |
| `xWELL_PROXY` | Ethereum (1) | `0xA88594D404727625A9437C3f886C7643872296AE` |
| `WORMHOLE_BRIDGE_ADAPTER_PROXY` | Ethereum (1) | `0x734AbBCe07679C9A6B4Fe3bC16325e028fA6DbB7` |
| `FOUNDATION_MULTISIG` | Ethereum (1) | _to be added to `chains/1.json`_ |
| `MGLIMMER_MULTISIG` (old source) | Moonbeam (1284) | `0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451` |
