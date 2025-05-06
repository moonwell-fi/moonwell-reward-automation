# Technical Context: Moonwell Reward Automation

## Technologies Used

### Core Technologies
- **TypeScript**: The entire application is written in TypeScript, providing strong typing and better maintainability.
- **Cloudflare Workers**: Serverless platform for hosting the API endpoints.
- **viem**: Lightweight Ethereum library for blockchain interactions, used for all RPC calls.
- **BigNumber.js**: Library for precise numeric calculations, essential for blockchain token amounts.

### Blockchain Integration
- **Moonbeam Network Client**: Interface for Moonbeam blockchain (ChainID: 1284).
- **Base Network Client**: Interface for Base blockchain (ChainID: 8453).
- **Optimism Network Client**: Interface for Optimism blockchain (ChainID: 10).
- **Smart Contract ABIs**: Definitions for interacting with on-chain contracts.

### Output Formats
- **JSON**: For programmatic consumption by on-chain governance systems.
- **Markdown**: For human-readable governance proposals.

## Development Setup

### Local Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run tests
npm test

# Deploy to Cloudflare
npm run deploy
```

### Key Development Tools
- **Wrangler**: CLI tool for developing and deploying Cloudflare Workers.
- **Vitest**: Testing framework for unit tests.
- **ESLint/Prettier**: Code linting and formatting.

## Technical Constraints

### Blockchain Limitations
- **Block Time Differences**: Each network has different block times (Moonbeam ~6s, Base ~2s, Optimism ~2s).
- **Contract Interface Variations**: Different reward distribution mechanisms across networks.
- **Token Decimal Precision**: Varying token decimal places require careful handling:
  - WELL: 18 decimals
  - GLMR: 18 decimals
  - OP: 18 decimals
  - USDC (Base): 6 decimals

### Numerical Precision Requirements
- **Token Amounts**: Must handle amounts down to 18 decimal places (or 1e-18).
- **Percentage Calculations**: Ensure fair distribution even with small percentage allocations.
- **Rounding Rules**: Different operations require different rounding strategies.

### API Constraints
- **Request Limits**: Cloudflare Workers have runtime limitations.
- **Response Size**: Large market datasets require efficient data structures.
- **Cross-Chain Data Fetching**: Multiple RPC calls increase potential for failures.

## Dependencies

### Production Dependencies
- **bignumber.js**: Precision numeric calculations for token amounts and rates.
- **viem**: Ethereum library for blockchain interactions.

### Development Dependencies
- **@cloudflare/vitest-pool-workers**: Testing environment for Cloudflare Workers.
- **@cloudflare/workers-types**: TypeScript types for Cloudflare Workers.
- **typescript**: TypeScript compiler and language services.
- **vitest**: Testing framework.
- **wrangler**: Cloudflare Workers CLI and development environment.

## API Structure

### Endpoints
- `/?type=json&timestamp=<UNIX_TIMESTAMP>&network=<NETWORK_NAME>`: Returns JSON for on-chain consumption.
- `/?type=markdown&timestamp=<UNIX_TIMESTAMP>&proposal=<PROPOSAL_NUMBER>&network=<NETWORK_NAME>`: Returns Markdown for governance proposals.

### Request Parameters
- **type**: Output format (`json` or `markdown`).
- **timestamp**: UNIX timestamp for data snapshot.
- **network**: Optional network filter (`Moonbeam`, `Base`, or `Optimism`).
- **proposal**: Optional proposal number for markdown format.

### Response Formats
- **JSON**: Structured for direct consumption by governance systems.
- **Markdown**: Human-readable format with tables and metrics.

## Tool Usage Patterns

### Data Collection Pattern
```typescript
// 1. Get closest block number for timestamp
const blockNumber = await getClosestBlockNumber(client, timestamp, blockTime);

// 2. Use multicall for batched RPC requests
const data = await client.multicall({
  contracts: markets.map(market => ({
    address: market,
    abi: someABI,
    functionName: 'someFunction',
    blockNumber: BigInt(blockNumber),
    args: [arg1, arg2],
  })),
});
```

### Calculation Pattern
```typescript
// Calculate percentage distributions based on TVL
function calculatePercentages(totalSupplyUsd: number[]) {
  const total = totalSupplyUsd.reduce((sum, value) => sum + value, 0);
  return totalSupplyUsd.map(value => value / total);
}

// Calculate rewards based on percentages
const newRewardSpeed = Number(
  (totalRewardsPerEpoch * percentage * ratio) / secondsPerEpoch
);
```

### Output Generation Pattern
```typescript
// JSON output with specific conversion rules
const rewardSpeeds = markets.map(market => ({
  market: market.alias,
  newSupplySpeed: new BigNumber(market.newWellSupplySpeed)
    .shiftedBy(18)
    .integerValue().toNumber(),
  // Additional fields...
}));

// Markdown output with formatting
markdown += `| Total Supply in USD | ${formatUSD(value)} |\n`;
```

## Configuration Management

The system uses a hierarchical configuration structure defined in `config.ts`:

```typescript
// Main configuration defines epoch parameters and global settings
export const mainConfig = {
  totalWellPerEpoch: 50000,     // Total WELL tokens per epoch
  secondsPerEpoch: 604800,      // Epoch duration in seconds (1 week)
  firstEpochTimestamp: 1651881600, // Start of first epoch
  
  // Network-specific configurations
  moonbeam: {
    markets: 0.8,               // 80% to markets
    safetyModule: 0.1,          // 10% to safety module
    dex: 0.1,                   // 10% to DEX incentives
    nativePerEpoch: 100000      // GLMR tokens per epoch
  },
  // Similar configs for Base and Optimism
}

// Market-specific configurations (boosts, ratios, etc.)
export const marketConfigs = {
  1284: [ /* Moonbeam market configs */ ],
  8453: [ /* Base market configs */ ],
  10: [ /* Optimism market configs */ ]
}
```

This configuration structure allows for adjusting reward parameters without code changes.
