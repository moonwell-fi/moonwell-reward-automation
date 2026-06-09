# Design: Ethereum markets as a fourth reward-destination network

**Date:** 2026-06-09
**Repo:** `moonwell-reward-automation`
**Branch:** `feat/ethereum-source-calendar-epochs` (PR #94, by request)
**Status:** Approved design, pending implementation plan

## Problem

Moonwell markets are live on Ethereum mainnet (chainId 1): WETH, USDC, USDT and
cbBTC, with the full v2 stack (Unitroller/Comptroller, MultiRewardDistributor,
Chainlink oracle, Moonwell views). The reward automation already treats
Ethereum as the bridge **source** (PR #94) but not as a reward **destination**.
Ethereum must join Base/Optimism/Moonbeam as a fourth network: market data
fetching, TVL-proportional WELL allocation, MRD speeds, and JSON/markdown
output — with the twist that funds need **no bridging** (the governor executes
natively on Ethereum).

## Decisions captured during brainstorming

- **Splits:** `markets: 1.0, safetyModule: 0, dex: 0` — 100% of Ethereum's
  TVL-share goes to markets. Ethereum stkWELL (`STK_GOVTOKEN_PROXY`) stays
  unfunded for now; no safety-module fetching or output for Ethereum until it
  is funded (its `STAKING_VIEWS_PROXY.getStakingInfo()` is shape-compatible
  when that day comes).
- **Supply/borrow ratio:** supply-only (`supply: 1, borrow: 0`) on all four
  markets; borrowers get the 1-wei minimum sentinel.
- **Funding shape:** direct `transferFrom` `FOUNDATION_MULTISIG → MRD_PROXY`
  (token `xWELL_PROXY`) on chain 1. No bridge, no governor hop.
- **Same branch:** work lands on `feat/ethereum-source-calendar-epochs`.
- **Defaults:** all 4 markets `enabled: true`, boost/deboost 0,
  `minimumReserves: 0`, `reservesEnabled: false`. Ethereum block time 12s.
  No `excludedMarkets` entries for chain 1.

## Reference addresses (from `moonwell-contracts-v2/chains/1.json`)

| Name | Address | Notes |
| --- | --- | --- |
| `MOONWELL_WETH` | `0xb85Ca1decc4971F8094DA7676F8b71002a9590C4` | 18 decimals, nameOverride `ETH` |
| `MOONWELL_USDC` | `0xE655790552C68F2871Eb44B2cFe3dcFE6A63e62E` | 6 decimals |
| `MOONWELL_USDT` | `0xeddC25B67D474EEEcFA4F69227b81D870C467011` | 6 decimals |
| `MOONWELL_cbBTC` | `0x636080eb65F1b665b646f47D31f21901cDAaeE9F` | 8 decimals |
| `UNITROLLER` | `0xdec80bB934397575594E91970b37baf65f5b21bE` | comptroller proxy |
| `MRD_PROXY` | `0x60142B8d76FaC5b88cfB422Ba1aA905d2171851c` | MultiRewardDistributor |
| `CHAINLINK_ORACLE` | `0x599A01297fc181558BdFa1737caFeE513694B654` | getUnderlyingPrice |
| `MOONWELL_VIEWS_PROXY` | `0x2d85b9c48a8c582f0AA244e134e9C6f30Cf7786e` | getMarketInfo |
| `STK_GOVTOKEN_PROXY` | `0xb3a9E0DCf37658a48aa9f018C44f90378ddD4357` | stkWELL (unfunded, out of scope) |

## Section 1 — Config (`config.ts`)

- `mainConfig.ethereum = { nativePerEpoch: 0, markets: 1.0, safetyModule: 0, dex: 0 }`.
- `marketConfigs[1]` with the four markets per the defaults above.
- Contract consts **reusing existing ABIs** (the Ethereum deployment is the
  same v2 contracts; no new ABI blobs):
  - `ethereumComptroller` = `{ address: UNITROLLER, abi: baseComptroller.abi }`
  - `ethereumOracleContract` = `{ address: CHAINLINK_ORACLE, abi: baseOracleContract.abi }`
  - `ethereumMultiRewardDistributor` = `{ address: MRD_PROXY, abi: baseMultiRewardDistributor.abi }`
  - `ethereumViewsContract` = `{ address: MOONWELL_VIEWS_PROXY, abi: baseViewsContract.abi }`
- `validateSplits` gains an `ethereum` row (sums to 1.0; the existing
  0%-disabled escape hatch applies if ever wound down).
- `ConfigOverrides` gains `ethereum?: { markets?, safetyModule?, dex? }`.

## Section 2 — Clients (`utils.ts`)

- `ETHEREUM_RPC_URL` env var; viem `mainnet` chain; `ethereumClient` added to
  `createClients()` and as a default export (matching the three existing
  clients).
- Ops note: add `ETHEREUM_RPC_URL` to `.dev.vars` locally and to the deployed
  worker secrets.

## Section 3 — Data fetching (`markets.ts`)

Fourth copy of the per-network pipeline, consistent with the existing
copy-paste pattern (a registry refactor was considered and rejected as
out-of-scope):

- `getEthereumMarkets()` via `UNITROLLER.getAllMarkets`, filtered by
  `excludedMarkets` (none today).
- Block resolution: `getClosestBlockNumber(ethereumClient, timestamp, 12)`.
- Per-market fetches mirroring Base: prices (Chainlink oracle
  `getUnderlyingPrice`), supplies/borrows/reserves/exchange rates
  (`mTokenv2ABI`), WELL supply/borrow speeds (`MRD.getConfigForMarket` with
  `xWellToken.address`), supply/borrow rates (`views.getMarketInfo`).
- **Native-token speeds are hardcoded zero arrays** — mainnet has no native
  reward token; `nativePerEpoch: 0` gates the markdown rows off.
- Ethereum's `networkTotalUsd` joins the **4-way** `totalMarketPercentage`
  denominator, so all networks' shares rebalance automatically.
- New-speed maps use the same MRD sentinel semantics as Base/Optimism
  (`-1e-18` = no change, `1e-18` = minimum borrow).
- Output: market array keyed `1`, plus an `ethereum: {…}` network-summary
  block (`networkTotalUsd`, `totalMarketPercentage`, `wellPerEpoch`,
  `wellPerEpochMarkets`, `wellPerEpochSafetyModule: 0`, `wellPerEpochDex: 0`)
  and `ethereumBlockNumber`.

## Section 4 — JSON output (`generateJson.ts`)

New `network === "Ethereum"` branch emitting into the **same chain-`1` key**
the bridge-source actions already use; `index.ts`'s deep-merge concatenates
arrays, so the merged chain-1 block carries both source actions (from the
Base/Optimism/Moonbeam runs) and Ethereum's own destination actions:

- `setMRDSpeeds`: WELL-only entries (`emissionToken: "xWELL_PROXY"`,
  `newEndTime` = epoch end), same shape/sentinels as Optimism's.
- `transferFrom`: `FOUNDATION_MULTISIG → MRD_PROXY`, token `xWELL_PROXY`,
  amount = `wellPerEpochMarkets` routed through `toBaseUnits` (so a zeroed
  network emits nothing).
- Empty `withdrawWell`, `merkleCampaigns`, `multiRewarder`.
- **No `bridgeToRecipient`** for Ethereum-as-destination.

## Section 5 — Markdown, routing, tests

- `generateMarkdown.ts`: `Ethereum → '1'` network mapping,
  `ethereumBlockNumber` in the block-number row; safety-APR and native-token
  sections stay off (no `'1'` branch in the safety-APR chain; `nativePerEpoch`
  is 0).
- `index.ts`: networks list becomes `['Base', 'Optimism', 'Moonbeam',
  'Ethereum']` for both JSON and markdown.
- Tests (`test/generateJson.spec.ts`): Ethereum branch — `setMRDSpeeds`
  shape, direct `FOUNDATION_MULTISIG → MRD_PROXY` transfer, no
  `bridgeToRecipient`, and zeroed-Ethereum emits nothing.
- Final verification: run locally with `ETHEREUM_RPC_URL` set, generate the
  full JSON, and re-run the cross-network conservation check (funded =
  bridged + Ethereum direct transfer; each destination's inflow covers its
  outflow).

## Out of scope

- Ethereum safety-module rewards (split is 0; revisit when funded).
- MetaMorpho vaults on Ethereum (none configured).
- `markets.ts` network-registry refactor (rejected during brainstorming —
  blast radius).
- Contracts-side: the `RewardsDistribution` template must accept chain-1
  destination actions (`setMRDSpeeds` + `transferFrom` executing on the
  source chain itself). Tracked with the existing contracts follow-ups
  (`FOUNDATION_MULTISIG` address-book entry, stkWell=0 gate).
