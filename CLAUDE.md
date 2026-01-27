# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Moonwell Reward Automation is a Cloudflare Workers application that automates the calculation and distribution of liquidity incentives for the Moonwell DeFi protocol across three blockchain networks: Moonbeam (ChainID 1284), Base (ChainID 8453), and Optimism (ChainID 10). The system fetches on-chain market data, computes optimal reward distributions for WELL tokens and native network tokens (GLMR, USDC, OP), and generates outputs in both JSON (for on-chain governance transactions) and Markdown (for human-readable proposals).

## Commands

### Development
```bash
npm run dev          # Start local Cloudflare Workers dev server at http://localhost:8787/
npm run start        # Alias for npm run dev
npm test             # Run Vitest tests
npm run deploy       # Deploy to Cloudflare Workers
npm run cf-typegen   # Generate TypeScript types for Cloudflare Workers bindings
```

### Testing
```bash
npm test                           # Run all tests
npm test -- src/markets.spec.ts    # Run specific test file
npm test -- --watch                # Run tests in watch mode
```

## Architecture

### Core Data Flow
1. **Data Collection** (`markets.ts`): Fetches on-chain data via RPC calls using viem, including market states, prices, supply/borrow amounts, and current reward speeds
2. **Reward Calculation** (`markets.ts`): Computes new reward speeds based on market TVL percentages, configured ratios, and boost/deboost multipliers
3. **Output Generation**: Formats results as JSON (`generateJson.ts`) for governance transactions or Markdown (`generateMarkdown.ts`) for proposals

### Key Modules

- **`index.ts`**: Cloudflare Workers entry point that handles HTTP requests, validates parameters, and routes to JSON or Markdown generation
- **`markets.ts`**: Core engine for fetching market data from all three chains and calculating reward distributions. Contains the `getMarketData()` function which is the main orchestrator
- **`config.ts`**: Centralized configuration including epoch parameters, network allocations, market-specific settings, contract addresses, and ABIs. Modify this file to adjust reward ratios or market boosts without code changes
- **`generateJson.ts`**: Transforms market data into JSON format for on-chain consumption, including Merkle campaign data for MetaMorpho vaults on Base
- **`generateMarkdown.ts`**: Creates human-readable governance proposals with tables showing market metrics, reward changes, and APR calculations
- **`safetyModule.ts`**: Handles safety module (stkWELL) reward calculations across all networks
- **`dex.ts`**: Manages DEX-specific reward data (currently Aerodrome on Base)
- **`utils.ts`**: Shared utilities including blockchain clients, block number resolution, and contract call batching
- **`constants.ts`**: Contract ABIs and other constant values

### Multi-Chain Architecture

Each blockchain network requires network-specific handling:
- Different comptroller contracts and addresses for each chain
- Different block times (Moonbeam ~6s, Base/Optimism ~2s) affect reward calculations
- Network-specific token types and decimals (WELL/GLMR/OP have 18 decimals, USDC has 6)
- Base has MetaMorpho vault campaigns with weighted TVL multipliers
- Optimism has multi-rewarder contracts for additional native token incentives

The system uses `viem` for all RPC interactions with separate client instances per chain. The `createClients()` function in `utils.ts` can accept custom RPC URLs via environment variables (MOONBEAM_RPC, BASE_RPC, OPTIMISM_RPC).

### Configuration-Driven Calculations

The `config.ts` file controls all reward distribution logic:
- **`mainConfig`**: Defines total WELL per epoch, epoch duration (4 weeks), and network-level allocation percentages (markets, safety module, DEX, vaults)
- **`marketConfigs`**: Array of market-specific configurations indexed by chain ID, including market addresses, names, aliases, boost/deboost multipliers, supply/borrow ratios, and minimum reserves
- **Boost/Deboost**: Markets can have multipliers applied (e.g., `boost: 1.5` increases rewards by 50%, `deboost: 0.5` reduces by 50%)
- **Supply/Borrow Ratios**: Control how rewards split between suppliers and borrowers (e.g., `supplyRatio: 0.7, borrowRatio: 0.3`)
- **Vault Weight Multipliers**: On Base, MetaMorpho vaults receive weighted WELL allocations (stablecoins get 2x multiplier)

### Numerical Precision

All token amounts use 18 decimal precision internally. The system uses `bignumber.js` for precise calculations to avoid floating point errors:
- Raw token amounts are converted using `formatUnits(value, decimals)` from viem
- Reward speeds are calculated per second, then multiplied by seconds per epoch
- Final JSON output converts speeds back to integer values using `.shiftedBy(18).integerValue()`
- Minimum reward speeds prevent complete removal: use `1` (1e-18) for borrow speeds, `0` for supply speeds when disabled

### API Endpoints

**Query Parameters:**
- `type` (required): `json` or `markdown`
- `timestamp` (required): UNIX timestamp for data snapshot (determines which block to query)
- `network` (optional): Filter to specific network (`Moonbeam`, `Base`, or `Optimism`)
- `proposal` (optional): Proposal number for markdown output (e.g., `MIP-123`)

**Examples:**
```
/?type=json&timestamp=1735344000&network=Base
/?type=markdown&timestamp=1735344000&proposal=123
/?type=markdown&timestamp=1735344000  (all networks)
```

### Block Number Resolution

The system uses `getClosestBlockNumber()` to convert timestamps to block numbers for historical queries. This is critical because blockchain state queries require block numbers. The function performs binary search on block timestamps to find the closest block to the requested time.

### Error Handling Patterns

1. **Zero Price Detection**: Markets with zero oracle prices are detected and logged as warnings to prevent division errors
2. **Minimum Reserves**: Markets have configurable minimum reserve thresholds; only excess reserves are transferred
3. **Excluded Markets**: Some markets are excluded from reward calculations (defined in `excludedMarkets` array)
4. **Multicall Batching**: All RPC calls use viem's multicall to batch requests and handle partial failures

### MetaMorpho Vault Integration (Base Only)

Base network includes MetaMorpho vault incentives distributed via Merkle campaigns:
- Vault addresses and weight multipliers defined in `mainConfig.base.vaultAddresses` and `vaultWeightMultipliers`
- WELL rewards allocated based on weighted TVL (stablecoins USDC/EURC get 2x weight)
- Campaign data encoded in `merkleCampaignDatas` object with vault addresses and parameters
- Vault campaigns use campaign type 56 (MORPHO_VAULT_CAMPAIGN) in JSON output
- stkWELL uses campaign type 18 (TOKEN_HOLDING_CAMPAIGN) with 10% APY cap

### Safety Module APY Cap

The system caps stkWELL APY at 10% to prevent excessive rewards:
- `calculateCappedWellHolderBalance()` in `generateJson.ts` computes maximum WELL holder contribution
- If safety module rewards would exceed 10% APY, excess is returned to the WELL holder balance
- This ensures sustainable reward distribution while maintaining competitive staking incentives

## Development Notes

### When Modifying Reward Logic

1. Always read `config.ts` first to understand current parameters
2. Test changes with a specific timestamp that has known market conditions
3. Verify both JSON and Markdown outputs produce expected results
4. Check all three networks independently, as they have different configurations
5. Be careful with decimal precision when converting between token amounts and speeds

### When Adding New Markets

1. Add market configuration to appropriate network in `marketConfigs` array in `config.ts`
2. Include address, name, alias, digits, boost/deboost, supply/borrow ratios, enabled flag, and minimum reserves
3. Ensure the market is not in the `excludedMarkets` array
4. Verify the comptroller contract returns the market in `getAllMarkets()` call

### When Debugging Calculations

- The `getMarketData()` function returns a complete snapshot of all market data including calculated rewards
- Compare `currentWellSupplySpeed` vs `newWellSupplySpeed` to see reward changes
- Check `percentage` field to see each market's share of total TVL
- Verify `totalSupplyUSD` and `totalBorrowsUSD` values are reasonable (non-zero prices)
- Review boost/deboost multipliers and supply/borrow ratios in config for unexpected values

### Testing Strategy

Tests use Vitest with Cloudflare Workers pool configuration. Mock data is used for blockchain calls to avoid RPC dependencies. When writing tests:
- Test numerical precision edge cases (very small/large values)
- Verify boost/deboost multipliers apply correctly
- Check supply/borrow ratio splits
- Validate JSON output structure matches governance contract expectations
- Test network filtering (single network vs all networks)
