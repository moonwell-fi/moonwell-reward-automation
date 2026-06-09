/**
 * Slack slash command handler for /epoch-config
 */

import type { SlackCommandPayload } from '../types/slack';
import type { EpochConfig, ChainId, MarketInfo } from '../types/config';
import {
  getEpochNumber,
  getDaysUntilNextEpoch,
  createDefaultEpochConfig,
  createDefaultNetworkConfig,
  CHAIN_IDS,
} from '../types/config';
import { buildNetworkSelectionMessage } from './messages';
import { getMarketsForAllChains } from './utils';

export interface Env {
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN: string;
  GITHUB_TOKEN: string;
  SLACK_CHANNEL: string;
  GITHUB_REPO: string;
  EPOCH_CONFIG: KVNamespace;
  // RPC URLs
  MOONBEAM_RPC_URL: string;
  BASE_RPC_URL: string;
  OPTIMISM_RPC_URL: string;
}

/**
 * Handle the /epoch-config slash command
 */
export async function handleSlackCommand(
  payload: SlackCommandPayload,
  env: Env
): Promise<Response> {
  try {
    // Calculate current/next epoch
    const currentTimestamp = Date.now() / 1000;
    const daysUntil = getDaysUntilNextEpoch(currentTimestamp);

    // If we're within 5 days of next epoch, configure for next epoch
    // Otherwise configure for current epoch
    const epochNumber = daysUntil <= 5
      ? getEpochNumber(currentTimestamp) + 1
      : getEpochNumber(currentTimestamp);

    // Try to load existing config from KV
    const configKey = `epoch:${epochNumber}:config`;
    let config = await env.EPOCH_CONFIG.get<EpochConfig>(configKey, 'json');

    // If no config exists, create a default one
    if (!config) {
      const markets = await getMarketsForAllChains();

      const networks: Record<ChainId, any> = {} as Record<ChainId, any>;
      for (const chainId of CHAIN_IDS) {
        const chainMarkets = markets.filter(m => m.chainId === chainId);
        networks[chainId] = createDefaultNetworkConfig(chainMarkets);
      }

      config = createDefaultEpochConfig(epochNumber, networks, payload.user_id);

      // Save the new config
      await env.EPOCH_CONFIG.put(configKey, JSON.stringify(config), {
        expirationTtl: 60 * 60 * 24 * 60, // 60 days
      });
    }

    // Build and return the network selection message
    const message = buildNetworkSelectionMessage(epochNumber, config);

    return new Response(JSON.stringify(message), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling slash command:', error);

    return new Response(
      JSON.stringify({
        response_type: 'ephemeral',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
