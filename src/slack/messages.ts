/**
 * Slack message builders for epoch configuration
 */

import type {
  SlackBlock,
  SlackMessage,
  SlackButtonElement,
  SlackOption,
} from '../types/slack';
import type { ChainId, EpochConfig, NetworkConfig } from '../types/config';
import { CHAIN_NAMES, formatEpochDate, getEpochNumber, getDaysUntilNextEpoch } from '../types/config';

/**
 * Build the network selection message shown after /epoch-config
 */
export function buildNetworkSelectionMessage(
  epochNumber: number,
  config?: EpochConfig
): SlackMessage {
  const epochDate = formatEpochDate(epochNumber);
  const daysUntil = getDaysUntilNextEpoch();

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Configure Epoch #${epochNumber}`,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Epoch Date:* ${epochDate} | *Days until epoch:* ${daysUntil}`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Select a network to configure:*',
      },
    },
  ];

  // Add network status and buttons
  const networkButtons: SlackButtonElement[] = [];

  for (const chainId of ['1284', '8453', '10'] as ChainId[]) {
    const chainName = CHAIN_NAMES[chainId];
    const networkConfig = config?.networks[chainId];
    const isConfigured = networkConfig && Object.keys(networkConfig.markets).length > 0;

    // Add status line
    const enabledCount = networkConfig
      ? Object.values(networkConfig.markets).filter(m => m.enabled).length
      : 0;
    const buybackTotal = networkConfig
      ? Object.values(networkConfig.markets).reduce(
          (sum, m) => sum + parseFloat(m.buybackWithdrawal || '0'),
          0
        )
      : 0;

    const statusEmoji = isConfigured ? '✅' : '⏳';
    const statusText = isConfigured
      ? `${enabledCount} markets, $${buybackTotal.toLocaleString()} buybacks`
      : 'Not configured';

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${statusEmoji} *${chainName}* - ${statusText}`,
      },
    });

    // Add button for this network
    const emoji = chainId === '1284' ? '🌙' : chainId === '8453' ? '🔵' : '🔴';
    networkButtons.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: `${emoji} ${chainName}`,
        emoji: true,
      },
      action_id: `select_network_${chainId}`,
      value: chainId,
    });
  }

  // Add network selection buttons
  blocks.push({
    type: 'actions',
    block_id: 'network_selection',
    elements: networkButtons,
  });

  blocks.push({
    type: 'divider',
  });

  // Add review button
  blocks.push({
    type: 'actions',
    block_id: 'review_actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '📋 Review & Create PR',
          emoji: true,
        },
        action_id: 'review_config',
        style: 'primary',
      },
    ],
  });

  return {
    text: `Configure Epoch #${epochNumber}`,
    blocks,
  };
}

/**
 * Build the summary message for reviewing configuration
 */
export function buildSummaryMessage(config: EpochConfig): SlackMessage {
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📋 Epoch #${config.epochNumber} Configuration Summary`,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Epoch Date:* ${config.epochDate} | *Created by:* <@${config.createdBy}>`,
        },
      ],
    },
    {
      type: 'divider',
    },
  ];

  let totalBuybacks = 0;

  // Add each network's summary
  for (const chainId of ['1284', '8453', '10'] as ChainId[]) {
    const chainName = CHAIN_NAMES[chainId];
    const networkConfig = config.networks[chainId];

    if (!networkConfig) continue;

    const enabledMarkets = Object.entries(networkConfig.markets)
      .filter(([_, m]) => m.enabled)
      .map(([addr, _]) => addr);

    const buybackTotal = Object.values(networkConfig.markets).reduce(
      (sum, m) => sum + parseFloat(m.buybackWithdrawal || '0'),
      0
    );
    totalBuybacks += buybackTotal;

    const rebalancing = networkConfig.reserveRebalancing
      .filter(r => r.fromMarket !== 'none' && r.toMarket !== 'none' && parseFloat(r.amount) > 0)
      .map(r => `${r.fromMarket.slice(0, 8)}... → ${r.toMarket.slice(0, 8)}... ($${parseFloat(r.amount).toLocaleString()})`)
      .join(', ') || 'None';

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${chainName}*\n` +
          `• Markets: ${enabledMarkets.length} enabled\n` +
          `• Buybacks: $${buybackTotal.toLocaleString()}\n` +
          `• Rebalancing: ${rebalancing}`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '✏️ Edit',
          emoji: true,
        },
        action_id: `edit_network_${chainId}`,
        value: chainId,
      },
    });
  }

  blocks.push({
    type: 'divider',
  });

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Total Buybacks:* $${totalBuybacks.toLocaleString()}`,
    },
  });

  blocks.push({
    type: 'divider',
  });

  // Add action buttons
  blocks.push({
    type: 'actions',
    block_id: 'summary_actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '👁️ Preview JSON',
          emoji: true,
        },
        action_id: 'preview_json',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '👁️ Preview MD',
          emoji: true,
        },
        action_id: 'preview_markdown',
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '🚀 Create PR',
          emoji: true,
        },
        action_id: 'create_pr',
        style: 'primary',
      },
    ],
  });

  return {
    text: `Epoch #${config.epochNumber} Configuration Summary`,
    blocks,
  };
}

/**
 * Build the PR created confirmation message
 */
export function buildPRCreatedMessage(
  epochNumber: number,
  mipNumber: number,
  prUrl: string
): SlackMessage {
  return {
    text: `PR Created: MIP-X${mipNumber}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✅ PR Created Successfully!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*MIP-X${mipNumber}: Automated Liquidity Incentive Proposal*\n\n${prUrl}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Files added:*\n' +
            `• \`proposals/mips/mip-x${mipNumber}/x${mipNumber}.json\`\n` +
            `• \`proposals/mips/mip-x${mipNumber}/x${mipNumber}.md\`\n` +
            `• \`proposals/mips/mip-x${mipNumber}/x${mipNumber}.sh\``,
        },
      },
      {
        type: 'actions',
        block_id: 'pr_actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '👁️ View PR',
              emoji: true,
            },
            action_id: 'view_pr',
            url: prUrl,
          },
        ],
      },
    ],
  };
}

/**
 * Build the epoch reminder message
 */
export function buildEpochReminderMessage(
  epochNumber: number,
  daysUntil: number
): SlackMessage {
  const epochDate = formatEpochDate(epochNumber);

  return {
    text: `Epoch #${epochNumber} starts in ${daysUntil} days`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🔔 Epoch #${epochNumber} Reminder`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Epoch #${epochNumber} starts in *${daysUntil} days* (${epochDate}).\n\n` +
            `Configure rewards using \`/epoch-config\``,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Current defaults will be loaded from previous epoch configuration.',
          },
        ],
      },
    ],
  };
}

/**
 * Build an error message
 */
export function buildErrorMessage(error: string): SlackMessage {
  return {
    text: `Error: ${error}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *Error:* ${error}`,
        },
      },
    ],
  };
}
