# Project Brief: Moonwell Reward Automation

## Purpose
Moonwell Reward Automation is a system that automates the calculation and distribution of liquidity incentives for the Moonwell protocol across three networks: Moonbeam, Base, and Optimism. The system analyzes market data, computes optimal reward distribution, and generates proposals for governance.

## Core Requirements

1. **Market Data Collection**
   - Fetch current and historical market data from all three blockchain networks (Moonbeam, Base, Optimism)
   - Calculate key metrics like total supply, borrows, exchange rates, prices, and APRs

2. **Reward Calculation**
   - Compute optimal reward speeds for both WELL tokens and native network tokens (GLMR, USDC, OP)
   - Allocate rewards based on configurable ratios and market parameters
   - Support various reward types: market supply rewards, market borrow rewards, safety module rewards, DEX incentives

3. **Output Generation**
   - JSON format for programmatic consumption by blockchain transactions
   - Markdown format for human-readable governance proposals
   - Support for network-specific or multi-network outputs

4. **Network-Specific Logic**
   - Handle differences between the three networks' contracts and parameters
   - Manage different token types and mechanisms specific to each chain

5. **Web Service Deployment**
   - Cloudflare Workers implementation for serverless hosting
   - API endpoints for requesting data with customizable parameters

## Goals

1. **Automation**: Reduce manual effort in calculating and distributing rewards
2. **Transparency**: Generate clear documentation for governance proposals
3. **Accuracy**: Ensure precise calculations for fair reward distribution
4. **Configurability**: Allow for parameter adjustments without code changes
5. **Reliability**: Robust error handling and data validation

## Scope

The system is responsible for:
- Calculating rewards across three blockchain networks
- Generating JSON for automated transactions
- Creating markdown for governance proposals
- Providing a web API for accessing the outputs

The system is NOT responsible for:
- Executing blockchain transactions directly
- Storing historical data
- Processing user accounts or balances
- UI/frontend for interacting with the system
