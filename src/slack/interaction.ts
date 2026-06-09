/**
 * Slack interaction handler for modals and button clicks
 */

import type {
  SlackInteractionPayload,
  SlackBlockActionsPayload,
  SlackViewSubmissionPayload,
} from '../types/slack';
import type { EpochConfig, ChainId } from '../types/config';
import { CHAIN_IDS } from '../types/config';
import { buildNetworkSelectionMessage, buildSummaryMessage, buildPRCreatedMessage, buildErrorMessage } from './messages';
import { buildNetworkConfigModal, parseModalSubmission } from './modals';
import { getMarketsForAllChains, openSlackModal, respondToSlack, postSlackMessage } from './utils';
import type { Env } from './command';

/**
 * Handle Slack interactions (button clicks, modal submissions)
 */
export async function handleSlackInteraction(
  payload: SlackInteractionPayload,
  env: Env
): Promise<Response> {
  try {
    switch (payload.type) {
      case 'block_actions':
        return handleBlockActions(payload as SlackBlockActionsPayload, env);

      case 'view_submission':
        return handleViewSubmission(payload as SlackViewSubmissionPayload, env);

      default:
        // Return empty 200 for unhandled types
        return new Response('', { status: 200 });
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    return new Response('', { status: 200 });
  }
}

/**
 * Handle button clicks and other block actions
 */
async function handleBlockActions(
  payload: SlackBlockActionsPayload,
  env: Env
): Promise<Response> {
  const action = payload.actions[0];

  // Handle network selection buttons
  if (action.action_id.startsWith('select_network_')) {
    const chainId = action.value as ChainId;
    return handleNetworkSelection(payload, chainId, env);
  }

  // Handle edit network buttons
  if (action.action_id.startsWith('edit_network_')) {
    const chainId = action.value as ChainId;
    return handleNetworkSelection(payload, chainId, env);
  }

  // Handle review button
  if (action.action_id === 'review_config') {
    return handleReviewConfig(payload, env);
  }

  // Handle create PR button
  if (action.action_id === 'create_pr') {
    return handleCreatePR(payload, env);
  }

  // Handle preview buttons
  if (action.action_id === 'preview_json' || action.action_id === 'preview_markdown') {
    return handlePreview(payload, action.action_id, env);
  }

  return new Response('', { status: 200 });
}

/**
 * Handle network selection - open the configuration modal
 */
async function handleNetworkSelection(
  payload: SlackBlockActionsPayload,
  chainId: ChainId,
  env: Env
): Promise<Response> {
  // Get the current epoch config
  const epochNumber = await getCurrentEpochNumber(env);
  const configKey = `epoch:${epochNumber}:config`;
  const config = await env.EPOCH_CONFIG.get<EpochConfig>(configKey, 'json');

  // Get markets
  const markets = await getMarketsForAllChains();

  // Build and open the modal
  const modal = buildNetworkConfigModal(
    chainId,
    epochNumber,
    markets,
    config?.networks[chainId]
  );

  await openSlackModal(payload.trigger_id, modal, env.SLACK_BOT_TOKEN);

  return new Response('', { status: 200 });
}

/**
 * Handle review config button - show summary
 */
async function handleReviewConfig(
  payload: SlackBlockActionsPayload,
  env: Env
): Promise<Response> {
  const epochNumber = await getCurrentEpochNumber(env);
  const configKey = `epoch:${epochNumber}:config`;
  const config = await env.EPOCH_CONFIG.get<EpochConfig>(configKey, 'json');

  if (!config) {
    if (payload.response_url) {
      await respondToSlack(payload.response_url, buildErrorMessage('No configuration found'));
    }
    return new Response('', { status: 200 });
  }

  // Send summary message
  if (payload.response_url) {
    const message = buildSummaryMessage(config);
    await respondToSlack(payload.response_url, {
      ...message,
      replace_original: true,
    });
  }

  return new Response('', { status: 200 });
}

/**
 * Handle create PR button
 */
async function handleCreatePR(
  payload: SlackBlockActionsPayload,
  env: Env
): Promise<Response> {
  const epochNumber = await getCurrentEpochNumber(env);
  const configKey = `epoch:${epochNumber}:config`;
  const config = await env.EPOCH_CONFIG.get<EpochConfig>(configKey, 'json');

  if (!config) {
    if (payload.response_url) {
      await respondToSlack(payload.response_url, buildErrorMessage('No configuration found'));
    }
    return new Response('', { status: 200 });
  }

  try {
    // Create the PR using the GitHub integration
    // This will be implemented in github.ts
    const { createPullRequest } = await import('../github');
    const result = await createPullRequest(config, env);

    // Update config status
    config.status = 'submitted';
    config.prUrl = result.prUrl;
    await env.EPOCH_CONFIG.put(configKey, JSON.stringify(config));

    // Send success message
    if (payload.response_url) {
      const message = buildPRCreatedMessage(epochNumber, result.mipNumber, result.prUrl);
      await respondToSlack(payload.response_url, {
        ...message,
        replace_original: true,
      });
    }
  } catch (error) {
    console.error('Error creating PR:', error);
    if (payload.response_url) {
      await respondToSlack(
        payload.response_url,
        buildErrorMessage(`Failed to create PR: ${error instanceof Error ? error.message : 'Unknown error'}`)
      );
    }
  }

  return new Response('', { status: 200 });
}

/**
 * Handle preview buttons
 */
async function handlePreview(
  payload: SlackBlockActionsPayload,
  actionId: string,
  env: Env
): Promise<Response> {
  const epochNumber = await getCurrentEpochNumber(env);
  const configKey = `epoch:${epochNumber}:config`;
  const config = await env.EPOCH_CONFIG.get<EpochConfig>(configKey, 'json');

  if (!config) {
    return new Response('', { status: 200 });
  }

  // For now, just acknowledge - full preview would require generating content
  // and posting it as a thread or ephemeral message
  if (payload.response_url) {
    await respondToSlack(payload.response_url, {
      text: `Preview ${actionId === 'preview_json' ? 'JSON' : 'Markdown'} generation coming soon...`,
      response_type: 'ephemeral',
    });
  }

  return new Response('', { status: 200 });
}

/**
 * Handle modal submissions
 */
async function handleViewSubmission(
  payload: SlackViewSubmissionPayload,
  env: Env
): Promise<Response> {
  const callbackId = payload.view.callback_id;

  // Handle network config modal submission
  if (callbackId.startsWith('network_config_')) {
    const chainId = callbackId.replace('network_config_', '') as ChainId;
    return handleNetworkConfigSubmission(payload, chainId, env);
  }

  return new Response('', { status: 200 });
}

/**
 * Handle network configuration modal submission
 */
async function handleNetworkConfigSubmission(
  payload: SlackViewSubmissionPayload,
  chainId: ChainId,
  env: Env
): Promise<Response> {
  const metadata = JSON.parse(payload.view.private_metadata || '{}');
  const epochNumber = metadata.epochNumber || await getCurrentEpochNumber(env);
  const configKey = `epoch:${epochNumber}:config`;

  // Get current config
  let config = await env.EPOCH_CONFIG.get<EpochConfig>(configKey, 'json');

  if (!config) {
    // Create new config if none exists
    const markets = await getMarketsForAllChains();
    config = {
      epochNumber,
      epochDate: new Date().toISOString().split('T')[0],
      networks: {} as any,
      createdBy: payload.user.id,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    for (const cid of CHAIN_IDS) {
      config.networks[cid] = {
        markets: {},
        reserveRebalancing: [],
      };
    }
  }

  // Parse the modal values
  const markets = await getMarketsForAllChains();
  const networkConfig = parseModalSubmission(payload.view.state.values, markets, chainId);

  // Update the config
  config.networks[chainId] = networkConfig;

  // Save to KV
  await env.EPOCH_CONFIG.put(configKey, JSON.stringify(config), {
    expirationTtl: 60 * 60 * 24 * 60, // 60 days
  });

  // Return response action to close modal and show updated message
  // We need to use response_urls to update the original message
  if (payload.response_urls && payload.response_urls.length > 0) {
    const message = buildNetworkSelectionMessage(epochNumber, config);
    await respondToSlack(payload.response_urls[0], {
      ...message,
      replace_original: true,
    });
  }

  return new Response(JSON.stringify({ response_action: 'clear' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Helper to get the current epoch number being configured
 */
async function getCurrentEpochNumber(env: Env): Promise<number> {
  // Check if there's a stored "current" epoch
  const current = await env.EPOCH_CONFIG.get('epoch:current');
  if (current) {
    return parseInt(current, 10);
  }

  // Calculate based on time
  const { getEpochNumber, getDaysUntilNextEpoch } = await import('../types/config');
  const currentTimestamp = Date.now() / 1000;
  const daysUntil = getDaysUntilNextEpoch(currentTimestamp);

  return daysUntil <= 5
    ? getEpochNumber(currentTimestamp) + 1
    : getEpochNumber(currentTimestamp);
}
