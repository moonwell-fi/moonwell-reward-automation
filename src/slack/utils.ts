/**
 * Utility functions for the Slack bot
 */

import type { MarketInfo, ChainId } from '../types/config';
import { marketConfigs } from '../config';

/**
 * Get all markets for all chains from the config
 */
export async function getMarketsForAllChains(): Promise<MarketInfo[]> {
  const markets: MarketInfo[] = [];

  // Process each chain's markets
  for (const [chainIdStr, chainMarkets] of Object.entries(marketConfigs)) {
    const chainId = chainIdStr as ChainId;

    for (const market of chainMarkets) {
      markets.push({
        address: market.address,
        name: market.nameOverride || market.alias,
        alias: market.alias,
        chainId,
        enabled: market.enabled,
        boost: market.boost || 0,
        deboost: market.deboost || 0,
        decimals: market.digits,
      });
    }
  }

  return markets;
}

/**
 * Get markets for a specific chain
 */
export function getMarketsForChain(chainId: ChainId): MarketInfo[] {
  const chainMarkets = marketConfigs[chainId as unknown as keyof typeof marketConfigs];

  if (!chainMarkets) {
    return [];
  }

  return chainMarkets.map((market: any) => ({
    address: market.address,
    name: market.nameOverride || market.alias,
    alias: market.alias,
    chainId,
    enabled: market.enabled,
    boost: market.boost || 0,
    deboost: market.deboost || 0,
    decimals: market.digits,
  }));
}

/**
 * Post a message to Slack using the Web API
 */
export async function postSlackMessage(
  channel: string,
  message: any,
  token: string
): Promise<any> {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel,
      ...message,
    }),
  });

  const result = await response.json() as { ok: boolean; error?: string };

  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

/**
 * Update a Slack message
 */
export async function updateSlackMessage(
  channel: string,
  ts: string,
  message: any,
  token: string
): Promise<any> {
  const response = await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel,
      ts,
      ...message,
    }),
  });

  const result = await response.json() as { ok: boolean; error?: string };

  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

/**
 * Open a Slack modal
 */
export async function openSlackModal(
  triggerId: string,
  modal: any,
  token: string
): Promise<any> {
  const response = await fetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      trigger_id: triggerId,
      view: modal,
    }),
  });

  const result = await response.json() as { ok: boolean; error?: string };

  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

/**
 * Update a Slack modal
 */
export async function updateSlackModal(
  viewId: string,
  modal: any,
  token: string
): Promise<any> {
  const response = await fetch('https://slack.com/api/views.update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      view_id: viewId,
      view: modal,
    }),
  });

  const result = await response.json() as { ok: boolean; error?: string };

  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

/**
 * Respond to a Slack interaction using response_url
 */
export async function respondToSlack(
  responseUrl: string,
  message: any
): Promise<void> {
  const response = await fetch(responseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Failed to respond to Slack: ${response.status}`);
  }
}
