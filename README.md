# Moonwell Reward Automation

An automated liquidity incentive calculation and distribution system for the Moonwell DeFi protocol. This Cloudflare Workers application calculates optimal reward distributions across three blockchain networks (Moonbeam, Base, and Optimism) and generates outputs for governance proposals and on-chain transactions.

## Overview

The Moonwell protocol distributes WELL tokens and native chain tokens (GLMR, USDC, OP) as liquidity mining incentives to users who supply or borrow assets. This automation system:

- **Fetches** real-time market data from three blockchain networks
- **Calculates** optimal reward speeds based on total value locked (TVL) and configurable parameters
- **Generates** governance proposals in human-readable Markdown format
- **Produces** JSON outputs for automated on-chain governance transactions
- **Supports** multiple reward types: market incentives, safety module rewards, DEX incentives, and MetaMorpho vault campaigns

## Features

- **Multi-Chain Support**: Moonbeam (ChainID 1284), Base (ChainID 8453), Optimism (ChainID 10)
- **Dual Output Formats**: JSON for on-chain consumption, Markdown for governance proposals
- **Configurable Parameters**: Adjust reward ratios, boosts, and allocations without code changes
- **High Precision**: Handles 18-decimal token amounts accurately using BigNumber.js
- **Historical Queries**: Query market data at any past timestamp
- **MetaMorpho Vault Integration**: Weighted TVL-based vault incentives on Base
- **Safety Module APY Cap**: Automatic 10% APY cap for stkWELL rewards
- **Serverless**: Deployed on Cloudflare Workers for global, low-latency access

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Wrangler CLI (installed via npm)

### Installation

```bash
# Clone the repository
git clone https://github.com/moonwell-fi/moonwell-reward-automation.git
cd moonwell-reward-automation

# Install dependencies
npm install

# Start local development server
npm run dev
```

The server will start at `http://localhost:8787/`

## API Documentation

### Endpoints

The application exposes a single endpoint with query parameters:

```
GET /?type={json|markdown}&timestamp={unix_timestamp}[&network={network_name}][&proposal={number}]
```

### Parameters

| Parameter | Required | Values | Description |
|-----------|----------|--------|-------------|
| `type` | Yes | `json`, `markdown` | Output format type |
| `timestamp` | Yes | Unix timestamp | Historical timestamp for data snapshot |
| `network` | No | `Moonbeam`, `Base`, `Optimism` | Filter to specific network (omit for all networks) |
| `proposal` | No | Integer | Proposal number for markdown output (e.g., `123` for MIP-123) |

### Response Formats

#### JSON Output
Returns structured JSON for on-chain governance consumption:
```json
{
  "base": {
    "setRewardSpeeds": [...],
    "transferReserves": [...],
    "merkleCampaigns": [...]
  },
  "optimism": {...},
  "moonbeam": {...}
}
```

#### Markdown Output
Returns human-readable governance proposal with:
- Market overview tables
- Current vs. proposed reward speeds
- APR calculations
- Total reward distributions
- Safety module and DEX incentive allocations

## Usage Examples

### Get JSON for all networks at a specific timestamp
```bash
curl "http://localhost:8787/?type=json&timestamp=1735344000"
```

### Get JSON for Base network only
```bash
curl "http://localhost:8787/?type=json&timestamp=1735344000&network=Base"
```

### Generate markdown proposal for MIP-123
```bash
curl "http://localhost:8787/?type=markdown&timestamp=1735344000&proposal=123"
```

### Get markdown for Optimism only
```bash
curl "http://localhost:8787/?type=markdown&timestamp=1735344000&network=Optimism&proposal=124"
```

## Development

### Project Structure

```
.
├── src/
│   ├── index.ts              # Cloudflare Workers entry point
│   ├── markets.ts            # Market data fetching and reward calculations
│   ├── config.ts             # Configuration and contract definitions
│   ├── generateJson.ts       # JSON output generation
│   ├── generateMarkdown.ts   # Markdown output generation
│   ├── safetyModule.ts       # Safety module calculations
│   ├── dex.ts                # DEX incentive handling
│   ├── utils.ts              # Shared utilities and blockchain clients
│   └── constants.ts          # Contract ABIs and constants
├── test/                     # Vitest test files
├── wrangler.toml            # Cloudflare Workers configuration
├── package.json
└── tsconfig.json
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/markets.spec.ts

# Run tests in watch mode
npm test -- --watch
```

### Environment Variables

The application can use custom RPC endpoints via environment variables:

```bash
export MOONBEAM_RPC="https://your-moonbeam-rpc.com"
export BASE_RPC="https://your-base-rpc.com"
export OPTIMISM_RPC="https://your-optimism-rpc.com"
```

If not set, the system uses default public RPC endpoints.

## Configuration

All reward distribution parameters are configured in `src/config.ts`:

### Global Configuration (`mainConfig`)

- **Total WELL per epoch**: Currently ~13.14M WELL per 4-week epoch
- **Epoch duration**: 4 weeks (2,419,200 seconds)
- **Network allocations**: Percentage split between markets, safety module, DEX, and vaults

### Network-Specific Settings

#### Moonbeam
- 48% to markets, 47% to safety module, 5% to DEX
- 187,500 GLMR per epoch for native token incentives

#### Base
- 47.6% to markets, 20.4% to safety module, 32% to MetaMorpho vaults
- Vault weight multipliers: 2x for stablecoins (USDC, EURC), 1x for non-stablecoins (WETH, cbBTC)

#### Optimism
- 85% to markets, 5% to safety module, 5% to DEX, 5% to vaults
- OP token incentives distributed via multi-rewarder contracts

### Market-Specific Settings (`marketConfigs`)

Each market can be configured with:
- **Boost/Deboost multipliers**: Increase or decrease rewards (e.g., `boost: 1.5` = +50%)
- **Supply/Borrow ratios**: Split rewards between suppliers and borrowers
- **Minimum reserves**: Threshold before reserves are transferred
- **Enabled flag**: Turn market rewards on/off

## Deployment

### Deploy to Cloudflare Workers

```bash
# Deploy to production
npm run deploy

# Deploy to specific environment
wrangler deploy --env production
```

### Cloudflare Workers Configuration

The `wrangler.toml` file configures the Cloudflare Workers deployment:
- Node.js compatibility enabled
- TypeScript support
- Environment variables for RPC endpoints (if needed)

## How It Works

### 1. Data Collection
- Converts timestamp to block numbers for each chain
- Fetches market data via RPC calls using viem multicall
- Retrieves prices from oracle contracts
- Gets current reward speeds and market states

### 2. Reward Calculation
- Calculates each market's TVL percentage
- Allocates WELL tokens based on TVL and configured ratios
- Applies boost/deboost multipliers
- Splits between supply and borrow rewards
- Calculates new reward speeds (tokens per second)

### 3. Output Generation
- Converts to JSON format with precise integer values (18 decimals)
- Generates Merkle campaign data for vaults
- Creates markdown tables with APR calculations
- Includes safety module and DEX distributions

## Key Concepts

### Reward Speeds
Reward speeds are denominated in tokens per second with 18-decimal precision. For example:
- `1000000000000000000` = 1 token per second
- `1` = 1e-18 tokens per second (minimum non-zero value)

### Epochs
The system operates on 4-week epochs. Each epoch receives a fixed allocation of WELL tokens distributed across all markets, safety modules, and incentive programs.

### TVL-Based Distribution
Markets with higher TVL (total value locked) receive proportionally more rewards, ensuring liquidity is efficiently incentivized across the protocol.

### Boost/Deboost Multipliers
Strategic markets can receive boosted rewards to encourage specific behaviors (e.g., borrowing stablecoins, supplying volatile assets), while oversupplied markets can be deboosted.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Maintain TypeScript strict mode compliance
- Add tests for new features
- Update configuration documentation when adding new parameters
- Verify calculations with known market data
- Test all three networks independently

## License

This project is part of the Moonwell protocol. Please refer to the main Moonwell repository for license information.

## Links

- [Moonwell Protocol](https://moonwell.fi)
- [Moonwell Governance](https://governance.moonwell.fi)
- [Moonwell Documentation](https://docs.moonwell.fi)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## Support

For questions or issues:
- Open an issue on GitHub
- Join the [Moonwell Discord](https://discord.gg/moonwell)
- Visit the [Moonwell Forum](https://forum.moonwell.fi)
