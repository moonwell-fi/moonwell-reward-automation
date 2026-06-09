# Epoch-Based Automation Server Plan

## Overview

Build an automated system that runs **every 28 days starting from January 23, 2025** using a **Slack Bot** to:
1. Remind team when epoch is approaching
2. Collect manual inputs via Slack modals
3. Generate JSON and MD files with correct MIP-X numbering
4. Open a pull request on `moonwell-fi/moonwell-contracts-v2`

---

## Manual Inputs Required

Each epoch requires the following manual configuration:

| Input | Description |
|-------|-------------|
| **Boost/deboost values** | Multiplier per market (e.g., 1.2x boost, 0.8x deboost) |
| **Enable/disable markets** | Toggle which markets receive rewards |
| **Reserve rebalancing** | Transfer reserves between markets (market → market) |
| **Buyback withdrawals** | Amount of reserves to withdraw for token buybacks per market |

---

## Chosen Approach: Slack Bot

Use Slack's interactive modals and Block Kit to collect inputs directly in Slack, where the team already works.

### Why Slack Bot?

- Team already uses Slack daily
- No new URLs to remember
- Built-in authentication (Slack workspace)
- Mobile-friendly
- Epoch reminders and configuration in the same place

---

## Slack Block Kit Capabilities

| Feature | Limit/Capability |
|---------|------------------|
| Max blocks per modal | 100 blocks |
| Max stacked views | 3 views (can chain modals) |
| Max checkbox options | 10 per group |
| Number input | Supports decimals, min/max values |
| Select dropdowns | Single and multi-select available |
| Dynamic updates | Can update modals via API |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Slack Reminder (2 days before epoch)                   │
│                                                                  │
│  🔔 @channel Epoch #42 starts in 2 days (Feb 20, 2025)         │
│                                                                  │
│  Configure rewards using: /epoch-config                         │
│                                                                  │
│  Current defaults loaded from previous epoch.                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: User types /epoch-config                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Bot responds with network selection                    │
│                                                                  │
│  ⚙️ Configure Epoch #42 (Feb 20, 2025)                          │
│                                                                  │
│  Select a network to configure:                                  │
│  [🌙 Moonbeam] [🔵 Base] [🔴 Optimism]                          │
│                                                                  │
│  Or review all networks:                                         │
│  [📋 Review & Create PR]                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Modal opens for selected network                       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ⚙️ Configure Base Markets                                 │  │
│  │                                                           │  │
│  │ ENABLED MARKETS                                           │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │ Select markets to enable [multi-select ▼]           │  │  │
│  │ │ ☑ ETH  ☑ USDC  ☑ cbBTC  ☐ AERO  ☑ EURC  ☑ WETH   │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │ ─────────────────────────────────────────────────────────│  │
│  │ BOOST/DEBOOST VALUES (1.0 = normal)                      │  │
│  │                                                           │  │
│  │ ETH        USDC       cbBTC      EURC       WETH        │  │
│  │ [1.0]      [1.2]      [1.0]      [0.8]      [1.0]       │  │
│  │                                                           │  │
│  │ ─────────────────────────────────────────────────────────│  │
│  │ BUYBACK WITHDRAWALS (USD value)                          │  │
│  │                                                           │  │
│  │ ETH        USDC       cbBTC      EURC       WETH        │  │
│  │ [$40000]   [$75000]   [$15000]   [$5000]    [$10000]    │  │
│  │                                                           │  │
│  │ ─────────────────────────────────────────────────────────│  │
│  │ RESERVE REBALANCING                                       │  │
│  │                                                           │  │
│  │ Transfer 1:                                               │  │
│  │ From: [cbBTC ▼]  To: [USDC ▼]  Amount: [$10000]         │  │
│  │                                                           │  │
│  │ Transfer 2:                                               │  │
│  │ From: [None ▼]   To: [None ▼]  Amount: [$0]             │  │
│  │                                                           │  │
│  │ Transfer 3:                                               │  │
│  │ From: [None ▼]   To: [None ▼]  Amount: [$0]             │  │
│  │                                                           │  │
│  │                                                           │  │
│  │                              [Cancel] [Save & Continue]   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: Back to network selection (repeat for other networks) │
│                                                                  │
│  ⚙️ Configure Epoch #42 (Feb 20, 2025)                          │
│                                                                  │
│  ✅ Base - 5 markets, $145,000 buybacks                         │
│  ⏳ Moonbeam - Not configured                                   │
│  ⏳ Optimism - Not configured                                   │
│                                                                  │
│  [🌙 Moonbeam] [🔴 Optimism] [📋 Review & Create PR]           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (after all networks configured)
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: Review summary                                          │
│                                                                  │
│  📋 Epoch #42 Configuration Summary                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ MOONBEAM                                                 │    │
│  │ Markets: GLMR, USDC, ETH, DOT, xcDOT (5 enabled)        │    │
│  │ Buybacks: $35,000                                        │    │
│  │ Rebalancing: ETH → USDC ($5,000)                        │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ BASE                                                     │    │
│  │ Markets: ETH, USDC, cbBTC, EURC, WETH (5 enabled)       │    │
│  │ Buybacks: $145,000                                       │    │
│  │ Rebalancing: cbBTC → USDC ($10,000)                     │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ OPTIMISM                                                 │    │
│  │ Markets: ETH, USDC, OP, WBTC (4 enabled)                │    │
│  │ Buybacks: $22,000                                        │    │
│  │ Rebalancing: None                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  TOTAL BUYBACKS: $202,000                                       │
│                                                                  │
│  [✏️ Edit Moonbeam] [✏️ Edit Base] [✏️ Edit Optimism]          │
│                                                                  │
│  [👁️ Preview JSON] [👁️ Preview MD] [🚀 Create PR]             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: PR Created confirmation                                 │
│                                                                  │
│  ✅ PR Created Successfully!                                    │
│                                                                  │
│  MIP-X42: Automated Liquidity Incentive Proposal                │
│  https://github.com/moonwell-fi/moonwell-contracts-v2/pull/567  │
│                                                                  │
│  Files added:                                                    │
│  • proposals/mips/mip-x42/x42.json                              │
│  • proposals/mips/mip-x42/x42.md                                │
│  • proposals/mips/mip-x42/x42.sh                                │
│                                                                  │
│  [👁️ View PR]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SLACK                                      │
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐ │
│  │ Daily Cron  │    │   User      │    │   Modal Interactions        │ │
│  │ Reminder    │    │ /epoch-config    │   (submit, update)          │ │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┬───────────────┘ │
│         │                  │                         │                  │
└─────────┼──────────────────┼─────────────────────────┼──────────────────┘
          │                  │                         │
          ▼                  ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE WORKER                                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ /api/slack/reminder                                              │   │
│  │   • Triggered by cron                                            │   │
│  │   • Checks if epoch boundary approaching                         │   │
│  │   • Posts reminder to Slack channel                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ /api/slack/command                                               │   │
│  │   • Handles /epoch-config slash command                          │   │
│  │   • Loads current config from KV                                 │   │
│  │   • Returns network selection message                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ /api/slack/interaction                                           │   │
│  │   • Handles button clicks & modal submissions                    │   │
│  │   • Opens/updates modals                                         │   │
│  │   • Saves config to KV store                                     │   │
│  │   • Triggers PR creation                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ /api/generate                                                    │   │
│  │   • Accepts EpochConfig                                          │   │
│  │   • Generates JSON + Markdown                                    │   │
│  │   • Returns generated content                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ /api/create-pr                                                   │   │
│  │   • Generates JSON + Markdown + Shell script                     │   │
│  │   • Determines next MIP-X number                                 │   │
│  │   • Creates GitHub branch                                        │   │
│  │   • Commits files                                                │   │
│  │   • Opens PR                                                     │   │
│  │   • Returns PR URL                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ KV Store                                                         │   │
│  │   • epoch:{N}:config - Stores in-progress configuration         │   │
│  │   • epoch:latest - Last completed epoch number                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            GITHUB API                                   │
│                                                                         │
│  • Create branch: mip-x{N}                                             │
│  • Create/update files:                                                 │
│      - proposals/mips/mip-x{N}/x{N}.json                               │
│      - proposals/mips/mip-x{N}/x{N}.md                                 │
│      - proposals/mips/mip-x{N}/x{N}.sh                                 │
│      - proposals/mips/mips.json (update registry)                      │
│  • Open PR with description                                            │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Slack Bot Constraints & Workarounds

| Constraint | Impact | Workaround |
|------------|--------|------------|
| 10 checkbox limit | Can't list all markets in one checkbox group | Use **multi-select dropdown** instead |
| 100 block limit | ~30 blocks per network | Use **one modal per network** (not all at once) |
| 3 second response | Must respond to interactions quickly | Use **response_url** for async updates |
| No dynamic rows | Can't add/remove rebalancing rows | Use **fixed 3 slots** for rebalancing transfers |
| Modal size | Can feel cramped with many inputs | Group inputs logically, use clear labels |

---

## Data Structures

### EpochConfig (stored in KV)

```typescript
interface EpochConfig {
  epochNumber: number;
  epochDate: string;  // ISO date
  networks: {
    "1284": NetworkConfig;  // Moonbeam
    "8453": NetworkConfig;  // Base
    "10": NetworkConfig;    // Optimism
  };
  createdBy: string;  // Slack user ID
  createdAt: string;  // ISO timestamp
  status: "draft" | "submitted";
}

interface NetworkConfig {
  markets: {
    [marketAddress: string]: MarketConfig;
  };
  reserveRebalancing: RebalanceTransfer[];
}

interface MarketConfig {
  enabled: boolean;
  boost: number;        // 1.0 = normal, 1.2 = 20% boost, 0.8 = 20% deboost
  buybackWithdrawal: string;  // Amount in USD
}

interface RebalanceTransfer {
  fromMarket: string;   // Market address or "none"
  toMarket: string;     // Market address or "none"
  amount: string;       // Amount in USD
}
```

### Slack Modal Payload (example for Base network)

```typescript
const baseConfigModal = {
  type: "modal",
  callback_id: "network_config_8453",
  title: { type: "plain_text", text: "Configure Base" },
  submit: { type: "plain_text", text: "Save & Continue" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    // Multi-select for enabled markets
    {
      type: "input",
      block_id: "enabled_markets",
      label: { type: "plain_text", text: "Enabled Markets" },
      element: {
        type: "multi_static_select",
        action_id: "markets_select",
        placeholder: { type: "plain_text", text: "Select markets" },
        initial_options: [...],  // Pre-selected markets
        options: [
          { text: { type: "plain_text", text: "ETH" }, value: "0x..." },
          { text: { type: "plain_text", text: "USDC" }, value: "0x..." },
          // ... more markets
        ]
      }
    },
    { type: "divider" },
    // Section header for boost values
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Boost/Deboost Values* (1.0 = normal)" }
    },
    // Number inputs for each market boost
    {
      type: "input",
      block_id: "boost_eth",
      label: { type: "plain_text", text: "ETH Boost" },
      element: {
        type: "number_input",
        action_id: "boost_value",
        is_decimal_allowed: true,
        initial_value: "1.0",
        min_value: "0.1",
        max_value: "3.0"
      }
    },
    // ... more boost inputs
    { type: "divider" },
    // Buyback withdrawals section
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Buyback Withdrawals* (USD)" }
    },
    // Number inputs for buyback amounts
    // ...
    { type: "divider" },
    // Reserve rebalancing section (3 fixed slots)
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Reserve Rebalancing*" }
    },
    // Transfer 1
    {
      type: "input",
      block_id: "rebalance_1_from",
      label: { type: "plain_text", text: "Transfer 1 - From" },
      element: {
        type: "static_select",
        action_id: "from_market",
        options: [
          { text: { type: "plain_text", text: "None" }, value: "none" },
          { text: { type: "plain_text", text: "ETH" }, value: "0x..." },
          // ... markets
        ]
      }
    },
    // ... to market, amount, and 2 more transfer slots
  ]
};
```

---

## Implementation Plan

### Phase 1: Slack App Setup

1. **Create Slack App**
   - Go to api.slack.com/apps
   - Create new app "Moonwell Epoch Config"
   - Add to workspace

2. **Configure Slash Command**
   - Command: `/epoch-config`
   - Request URL: `https://rewards.moonwell.workers.dev/api/slack/command`
   - Description: "Configure epoch reward parameters"

3. **Configure Interactivity**
   - Request URL: `https://rewards.moonwell.workers.dev/api/slack/interaction`
   - Enable for modals and messages

4. **Add Bot Permissions**
   - `commands` - Slash commands
   - `chat:write` - Post messages
   - `chat:write.public` - Post to channels

5. **Store Credentials**
   - Add to Cloudflare Worker secrets:
     - `SLACK_SIGNING_SECRET`
     - `SLACK_BOT_TOKEN`

### Phase 2: Core API Endpoints

1. **Update `src/index.ts`** - Add new routes:
   ```typescript
   // Slack endpoints
   POST /api/slack/command      → handleSlackCommand()
   POST /api/slack/interaction  → handleSlackInteraction()
   GET  /api/slack/reminder     → handleEpochReminder() (cron)

   // Generation endpoints
   POST /api/generate           → generateFromConfig()
   POST /api/create-pr          → createPullRequest()
   ```

2. **Create `src/slack/` module**:
   - `command.ts` - Handle `/epoch-config`
   - `interaction.ts` - Handle modal submissions & button clicks
   - `modals.ts` - Build modal payloads
   - `messages.ts` - Build message payloads
   - `verify.ts` - Verify Slack request signatures

3. **Create `src/github.ts`**:
   - `createBranch()` - Create new branch
   - `commitFiles()` - Commit generated files
   - `createPR()` - Open pull request
   - `getNextMipNumber()` - Parse mips.json for next number

4. **Update generation logic**:
   - `src/generateJson.ts` - Accept config overrides
   - `src/generateMarkdown.ts` - Accept config overrides
   - Add `src/generateShellScript.ts` - Generate deployment script

### Phase 3: Slack Bot Implementation

1. **Slash Command Handler**
   ```typescript
   // POST /api/slack/command
   async function handleSlackCommand(request: Request, env: Env) {
     // Verify Slack signature
     // Calculate current/next epoch
     // Load existing config from KV (or create new)
     // Return network selection message with buttons
   }
   ```

2. **Interaction Handler**
   ```typescript
   // POST /api/slack/interaction
   async function handleSlackInteraction(request: Request, env: Env) {
     const payload = await parseSlackPayload(request);

     switch (payload.type) {
       case "block_actions":
         // Handle button clicks (network selection, edit, preview, create PR)
         if (payload.actions[0].action_id === "select_network") {
           return openNetworkModal(payload);
         }
         if (payload.actions[0].action_id === "create_pr") {
           return createPRFromConfig(payload);
         }
         break;

       case "view_submission":
         // Handle modal submit
         return saveNetworkConfig(payload);
     }
   }
   ```

3. **Modal Builders**
   ```typescript
   // src/slack/modals.ts
   function buildNetworkModal(chainId: string, config: NetworkConfig) {
     // Build modal with current values pre-filled
     // Include: enabled markets, boost values, buyback amounts, rebalancing
   }

   function buildSummaryMessage(config: EpochConfig) {
     // Build summary with edit buttons and create PR button
   }
   ```

4. **Epoch Reminder (Cron)**
   ```typescript
   // Triggered daily by Cloudflare cron
   async function handleEpochReminder(env: Env) {
     const nextEpoch = calculateNextEpoch();
     const daysUntil = getDaysUntilEpoch(nextEpoch);

     if (daysUntil <= 3 && daysUntil > 0) {
       await postSlackMessage(env.SLACK_CHANNEL, {
         text: `🔔 Epoch #${nextEpoch.number} starts in ${daysUntil} days`,
         blocks: [/* reminder with /epoch-config button */]
       });
     }
   }
   ```

### Phase 4: GitHub Integration

1. **PR Creation Flow**
   ```typescript
   async function createPullRequest(config: EpochConfig, env: Env) {
     // 1. Get next MIP number from mips.json
     const mipNumber = await getNextMipNumber(env);

     // 2. Generate files
     const json = await generateJson(config);
     const markdown = await generateMarkdown(config, mipNumber);
     const shell = generateShellScript(mipNumber);

     // 3. Create branch
     const branch = `mip-x${mipNumber}`;
     await createBranch(branch, env);

     // 4. Commit files
     await commitFiles(branch, [
       { path: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.json`, content: json },
       { path: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.md`, content: markdown },
       { path: `proposals/mips/mip-x${mipNumber}/x${mipNumber}.sh`, content: shell },
     ], env);

     // 5. Update mips.json
     await updateMipsRegistry(branch, mipNumber, env);

     // 6. Create PR
     const prUrl = await createPR({
       title: `MIP-X${mipNumber}: Automated Liquidity Incentive Proposal`,
       body: generatePRDescription(config, mipNumber),
       head: branch,
       base: "main"
     }, env);

     return prUrl;
   }
   ```

### Phase 5: Cloudflare Configuration

1. **Update `wrangler.toml`**:
   ```toml
   name = "moonwell-rewards"

   [vars]
   SLACK_CHANNEL = "#moonwell-rewards"
   GITHUB_REPO = "moonwell-fi/moonwell-contracts-v2"

   # Cron trigger for daily reminder check
   [triggers]
   crons = ["0 12 * * *"]  # Noon UTC daily

   # KV namespace for storing configs
   [[kv_namespaces]]
   binding = "EPOCH_CONFIG"
   id = "xxx"
   ```

2. **Add Secrets**:
   ```bash
   wrangler secret put SLACK_SIGNING_SECRET
   wrangler secret put SLACK_BOT_TOKEN
   wrangler secret put GITHUB_TOKEN
   ```

### Phase 6: Testing & Deployment

1. **Local Testing**
   - Use `wrangler dev` for local development
   - Use Slack's request builder to test modal interactions
   - Mock GitHub API calls

2. **Staging**
   - Deploy to staging worker
   - Test with private Slack channel
   - Create PRs on fork/test repo

3. **Production**
   - Deploy to production worker
   - Configure production Slack channel
   - Monitor first epoch

---

## Epoch Schedule Reference

Starting from **January 23, 2025**, epochs occur every 28 days:

| Epoch | Date | Reminder Date |
|-------|------|---------------|
| 1 | Jan 23, 2025 | Jan 21, 2025 |
| 2 | Feb 20, 2025 | Feb 18, 2025 |
| 3 | Mar 20, 2025 | Mar 18, 2025 |
| 4 | Apr 17, 2025 | Apr 15, 2025 |
| 5 | May 15, 2025 | May 13, 2025 |
| 6 | Jun 12, 2025 | Jun 10, 2025 |
| 7 | Jul 10, 2025 | Jul 08, 2025 |
| 8 | Aug 07, 2025 | Aug 05, 2025 |
| 9 | Sep 04, 2025 | Sep 02, 2025 |
| 10 | Oct 02, 2025 | Sep 30, 2025 |
| 11 | Oct 30, 2025 | Oct 28, 2025 |
| 12 | Nov 27, 2025 | Nov 25, 2025 |
| 13 | Dec 25, 2025 | Dec 23, 2025 |

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/slack/command.ts` | Handle `/epoch-config` slash command |
| `src/slack/interaction.ts` | Handle modal submissions & button clicks |
| `src/slack/modals.ts` | Build Slack modal payloads |
| `src/slack/messages.ts` | Build Slack message payloads |
| `src/slack/verify.ts` | Verify Slack request signatures |
| `src/slack/reminder.ts` | Epoch reminder cron logic |
| `src/github.ts` | GitHub API integration for PR creation |
| `src/generateShellScript.ts` | Generate deployment shell script |
| `src/types/slack.ts` | Slack API types |
| `src/types/config.ts` | EpochConfig types |

### Modified Files

| File | Changes |
|------|---------|
| `src/index.ts` | Add new API routes, cron handler |
| `src/generateJson.ts` | Accept config overrides |
| `src/generateMarkdown.ts` | Accept config overrides |
| `wrangler.toml` | Add KV binding, cron trigger, env vars |

---

## Environment Variables & Secrets

| Variable | Type | Description |
|----------|------|-------------|
| `SLACK_SIGNING_SECRET` | Secret | Slack app signing secret |
| `SLACK_BOT_TOKEN` | Secret | Slack bot OAuth token |
| `GITHUB_TOKEN` | Secret | GitHub PAT with repo access |
| `SLACK_CHANNEL` | Env var | Channel ID for reminders |
| `GITHUB_REPO` | Env var | Target repo (moonwell-fi/moonwell-contracts-v2) |

---

## Next Steps

1. [ ] Create Slack App and configure commands/interactivity
2. [ ] Set up KV namespace for config storage
3. [ ] Implement Slack command handler
4. [ ] Implement network configuration modals
5. [ ] Implement interaction handler (save config)
6. [ ] Implement summary view with PR creation
7. [ ] Implement GitHub PR creation
8. [ ] Add epoch reminder cron
9. [ ] Test full flow in staging
10. [ ] Deploy to production
11. [ ] Monitor first epoch execution
