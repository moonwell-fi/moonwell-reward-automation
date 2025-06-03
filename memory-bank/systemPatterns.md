# System Patterns: Moonwell Reward Automation

## System Architecture

The Moonwell Reward Automation system follows a modular, serverless architecture designed to optimize for maintainability, scalability, and cross-chain compatibility. The system is deployed as a Cloudflare Worker providing API endpoints for data retrieval and processing.

```
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Worker (index.ts)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐    │
│  │ Market Data │   │   Reward    │   │     Output      │    │
│  │ Collection  │──►│ Calculation │──►│   Generation    │    │
│  │ (markets.ts)│   │ (markets.ts)│   │(generateJson.ts)│    │
│  └─────────────┘   └─────────────┘   │(generateMd.ts)  │    │
│         │                 ▲          └─────────────────┘    │
│         │                 │                  │              │
│         │     ┌───────────┴─────┐            │              │
│         │     │  Configuration  │            │              │
│         └────►│   (config.ts)   │◄───────────┘              │
│               └─────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

1. **Serverless Deployment**
   - Cloudflare Workers provides a lightweight, scalable runtime
   - No infrastructure management required
   - Global distribution for low-latency access

2. **TypeScript Implementation**
   - Strong typing enhances code quality and maintenance
   - Interface definitions ensure consistency across modules
   - Type safety prevents common errors in calculation logic

3. **Cross-Chain Data Fetching**
   - Direct blockchain RPC interactions via viem library
   - Multi-chain clients for Moonbeam, Base, and Optimism networks
   - Blockchain-specific adapters for different contract interfaces

4. **Dual Output Formats**
   - JSON format for on-chain consumption and automation
   - Markdown format for governance proposals and human readability
   - Consistent data model feeding both output generators

5. **Configurable Parameters**
   - Externalized configuration for reward distribution ratios
   - Adjustable parameters without code changes
   - Network-specific configuration sections

## Design Patterns

### 1. Modular Component Design
Each major function is isolated in its own module with clear responsibilities:
- `markets.ts`: Data collection and calculation engine
- `config.ts`: Configuration management
- `generateJson.ts`: JSON output generation
- `generateMarkdown.ts`: Markdown output generation
- `dex.ts`: DEX-specific data handling
- `safetyModule.ts`: Safety module calculations
- `utils.ts`: Shared utility functions

### 2. Data Flow Pattern
Data flows through the system in a defined pipeline:
1. Raw data collection from on-chain sources
2. Transformation into standardized internal data model
3. Calculation of reward distributions
4. Generation of output formats

### 3. Multi-Chain Adapter Pattern
Each blockchain network requires specific handling:
- Common interface for calling contract functions
- Network-specific implementations for each chain
- Unified data model after collection

### 4. Configuration-Driven Calculation
Calculations are driven by configuration parameters:
- Reward ratios and distribution percentages
- Market-specific boosts or penalties
- Network allocation formulas

## Component Relationships

### Market Data Collection (markets.ts)
- Dependencies: config.ts, utils.ts, constants.ts
- Responsibilities: Fetching on-chain data, price conversion, calculating supply and borrow metrics

### Reward Calculation (markets.ts)
- Dependencies: config.ts, market data
- Responsibilities: Calculating reward speeds, distributing allocations across markets

### JSON Output (generateJson.ts)
- Dependencies: market data, reward calculations
- Responsibilities: Formatting data for on-chain consumption, network-specific JSON structure

### Markdown Output (generateMarkdown.ts)
- Dependencies: market data, reward calculations, dex.ts
- Responsibilities: Creating human-readable governance proposals

### API Coordination (index.ts)
- Dependencies: All other modules
- Responsibilities: Routing requests, parameter validation, response formatting

## Critical Implementation Paths

### Market Data Retrieval Flow
```
1. Request timestamp → getClosestBlockNumber → Get block for each network
2. Fetch market lists → getAllMarkets on each comptroller
3. For each market:
   a. Get market configuration (names, aliases, boosts)
   b. Fetch oracle prices
   c. Retrieve supply, borrow, exchange rate data
   d. Calculate current reward speeds
4. Process data into unified market data structure
```

### Reward Calculation Flow
```
1. Calculate network total values and percentages
2. Determine global allocation between networks
3. For each network:
   a. Allocate between markets, safety module, and DEX
   b. For each market:
      i. Calculate market percentage based on supply/borrow
      ii. Apply supply/borrow ratio splits
      iii. Apply boosts/deboosts from configuration
      iv. Calculate new emission speeds
4. Return complete market data with new reward speeds
```

### Output Generation Flow
```
1. Process market data into network-specific json structures
2. Calculate metrics, reward changes, APRs
3. Format data according to required structure (JSON or Markdown)
4. Apply network-specific formatting and calculations
5. Return formatted output
```

## Error Handling and Edge Cases

1. **Zero Prices Detection**
   - System detects and logs markets with zero prices
   - Prevents division-by-zero errors in calculations

2. **Minimum Reward Speeds**
   - Non-zero minimum speeds (e.g., 1e-18) for active markets
   - Prevents complete removal of rewards unintentionally

3. **Reserves Management**
   - Minimum reserves thresholds by market
   - Only transfer reserves exceeding minimums

4. **Rounding Decisions**
   - Specific rounding rules for different operations:
     - Round up for token transfers to ensure sufficient funds
     - Round down for emissions to prevent overallocation
