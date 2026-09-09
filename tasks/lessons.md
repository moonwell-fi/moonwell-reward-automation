# Lessons

## Markdown market visibility (2026-09-09)

Keep configured markets visible in Markdown even when disabled and no reward-speed changes are needed. Explain their unchanged status rather than treating the absence of an action as a reason to hide them.

## Market config invariants (2026-08-10)

**Correction**: I set per-market `supply`/`borrow` ratios that summed to more than 1
(e.g. `supply: 0.336980, borrow: 1.226759`) to back into a target allocation. Luke
rejected this: **`supply + borrow` must equal exactly 1 for every market config.**

**Why it matters**: the reward engine emits `pool × supplyShare_i × ratio` per side.
Only when ratios sum to 1 does the by-speed emission total equal the funded bucket,
keeping the epoch grand total capped at `totalWellPerEpoch` for any live balances.
Ratios summing over 1 silently overspend the bucket as balances drift.

**Pattern to apply**: when backing a target allocation into this config, use ratios
only to split *within* a market (`supply = targetSupply/targetTotal`, `borrow = 1 -
supply`) and use flat USD `boost` values to set each market's *total* share (weight
∝ target total WELL). Avoid `deboost` where possible — a deboost larger than live
supply USD makes the market weight negative. A ratio-sum test now guards this in
`test/config.spec.ts`.
