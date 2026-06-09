/**
 * Slack modal builders for epoch configuration
 */

import type {
  SlackModal,
  SlackBlock,
  SlackOption,
  SlackInputBlock,
} from '../types/slack';
import type { ChainId, NetworkConfig, MarketInfo } from '../types/config';
import { CHAIN_NAMES } from '../types/config';

/**
 * Build the network configuration modal
 */
export function buildNetworkConfigModal(
  chainId: ChainId,
  epochNumber: number,
  markets: MarketInfo[],
  currentConfig?: NetworkConfig
): SlackModal {
  const chainName = CHAIN_NAMES[chainId];
  const blocks: SlackBlock[] = [];

  // Filter markets for this chain
  const chainMarkets = markets.filter(m => m.chainId === chainId);

  // Build market options for multi-select
  const marketOptions: SlackOption[] = chainMarkets.map(m => ({
    text: { type: 'plain_text', text: m.name, emoji: true },
    value: m.address,
  }));

  // Get initial selected markets
  const initialMarkets: SlackOption[] = currentConfig
    ? chainMarkets
        .filter(m => currentConfig.markets[m.address]?.enabled)
        .map(m => ({
          text: { type: 'plain_text', text: m.name, emoji: true },
          value: m.address,
        }))
    : chainMarkets
        .filter(m => m.enabled)
        .map(m => ({
          text: { type: 'plain_text', text: m.name, emoji: true },
          value: m.address,
        }));

  // Header section
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `Configure ${chainName} Markets`,
      emoji: true,
    },
  });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Epoch #${epochNumber} | Configure market rewards, boosts, and buyback withdrawals`,
      },
    ],
  });

  blocks.push({ type: 'divider' });

  // Enabled markets multi-select
  blocks.push({
    type: 'input',
    block_id: 'enabled_markets',
    label: { type: 'plain_text', text: 'Enabled Markets', emoji: true },
    element: {
      type: 'multi_static_select',
      action_id: 'markets_select',
      placeholder: { type: 'plain_text', text: 'Select markets to enable' },
      options: marketOptions,
      ...(initialMarkets.length > 0 && { initial_options: initialMarkets }),
    },
  } as SlackInputBlock);

  blocks.push({ type: 'divider' });

  // Boost/Deboost section header
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Boost/Deboost Values*\n_1.0 = normal, >1.0 = boost, <1.0 = deboost_',
    },
  });

  // Add boost input for each market (limit to first 5 to stay under block limit)
  const marketsToShow = chainMarkets.slice(0, 8);
  for (const market of marketsToShow) {
    const currentBoost = currentConfig?.markets[market.address]?.boost ?? 1.0;

    blocks.push({
      type: 'input',
      block_id: `boost_${market.address}`,
      label: { type: 'plain_text', text: `${market.name} Boost`, emoji: true },
      element: {
        type: 'number_input',
        action_id: 'boost_value',
        is_decimal_allowed: true,
        initial_value: currentBoost.toString(),
        min_value: '0.1',
        max_value: '5.0',
      },
      optional: true,
    } as SlackInputBlock);
  }

  blocks.push({ type: 'divider' });

  // Buyback withdrawals section header
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Buyback Withdrawals (USD)*\n_Amount of reserves to withdraw for token buybacks_',
    },
  });

  // Add buyback input for each market
  for (const market of marketsToShow) {
    const currentBuyback = currentConfig?.markets[market.address]?.buybackWithdrawal ?? '0';

    blocks.push({
      type: 'input',
      block_id: `buyback_${market.address}`,
      label: { type: 'plain_text', text: `${market.name} Buyback ($)`, emoji: true },
      element: {
        type: 'number_input',
        action_id: 'buyback_value',
        is_decimal_allowed: false,
        initial_value: currentBuyback,
        min_value: '0',
      },
      optional: true,
    } as SlackInputBlock);
  }

  blocks.push({ type: 'divider' });

  // Reserve rebalancing section
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Reserve Rebalancing*\n_Transfer reserves between markets_',
    },
  });

  // Market options for rebalancing (including "None")
  const rebalanceOptions: SlackOption[] = [
    { text: { type: 'plain_text' as const, text: 'None' }, value: 'none' },
    ...chainMarkets.map((m): SlackOption => ({
      text: { type: 'plain_text', text: m.name },
      value: m.address,
    })),
  ];

  // Add 3 rebalancing slots
  for (let i = 0; i < 3; i++) {
    const currentRebalance = currentConfig?.reserveRebalancing?.[i];

    // From market select
    blocks.push({
      type: 'input',
      block_id: `rebalance_${i}_from`,
      label: { type: 'plain_text', text: `Transfer ${i + 1} - From`, emoji: true },
      element: {
        type: 'static_select',
        action_id: 'from_market',
        options: rebalanceOptions,
        initial_option: currentRebalance?.fromMarket && currentRebalance.fromMarket !== 'none'
          ? rebalanceOptions.find(o => o.value === currentRebalance.fromMarket) || rebalanceOptions[0]
          : rebalanceOptions[0],
      },
      optional: true,
    } as SlackInputBlock);

    // To market select
    blocks.push({
      type: 'input',
      block_id: `rebalance_${i}_to`,
      label: { type: 'plain_text', text: `Transfer ${i + 1} - To`, emoji: true },
      element: {
        type: 'static_select',
        action_id: 'to_market',
        options: rebalanceOptions,
        initial_option: currentRebalance?.toMarket && currentRebalance.toMarket !== 'none'
          ? rebalanceOptions.find(o => o.value === currentRebalance.toMarket) || rebalanceOptions[0]
          : rebalanceOptions[0],
      },
      optional: true,
    } as SlackInputBlock);

    // Amount input
    blocks.push({
      type: 'input',
      block_id: `rebalance_${i}_amount`,
      label: { type: 'plain_text', text: `Transfer ${i + 1} - Amount ($)`, emoji: true },
      element: {
        type: 'number_input',
        action_id: 'amount_value',
        is_decimal_allowed: false,
        initial_value: currentRebalance?.amount ?? '0',
        min_value: '0',
      },
      optional: true,
    } as SlackInputBlock);

    if (i < 2) {
      blocks.push({ type: 'divider' });
    }
  }

  // Create modal metadata
  const metadata = JSON.stringify({
    chainId,
    epochNumber,
  });

  return {
    type: 'modal',
    callback_id: `network_config_${chainId}`,
    title: { type: 'plain_text', text: `${chainName} Config`, emoji: true },
    submit: { type: 'plain_text', text: 'Save & Continue', emoji: true },
    close: { type: 'plain_text', text: 'Cancel', emoji: true },
    blocks,
    private_metadata: metadata,
  };
}

/**
 * Parse modal submission values into NetworkConfig
 */
export function parseModalSubmission(
  values: Record<string, Record<string, any>>,
  markets: MarketInfo[],
  chainId: ChainId
): NetworkConfig {
  const chainMarkets = markets.filter(m => m.chainId === chainId);
  const marketConfigs: Record<string, { enabled: boolean; boost: number; buybackWithdrawal: string }> = {};

  // Get enabled markets
  const enabledMarketAddresses = new Set(
    values.enabled_markets?.markets_select?.selected_options?.map((o: any) => o.value) ?? []
  );

  // Build market configs
  for (const market of chainMarkets) {
    const boostValue = values[`boost_${market.address}`]?.boost_value?.value;
    const buybackValue = values[`buyback_${market.address}`]?.buyback_value?.value;

    marketConfigs[market.address] = {
      enabled: enabledMarketAddresses.has(market.address),
      boost: boostValue ? parseFloat(boostValue) : 1.0,
      buybackWithdrawal: buybackValue ?? '0',
    };
  }

  // Parse rebalancing
  const reserveRebalancing = [];
  for (let i = 0; i < 3; i++) {
    const fromMarket = values[`rebalance_${i}_from`]?.from_market?.selected_option?.value ?? 'none';
    const toMarket = values[`rebalance_${i}_to`]?.to_market?.selected_option?.value ?? 'none';
    const amount = values[`rebalance_${i}_amount`]?.amount_value?.value ?? '0';

    reserveRebalancing.push({ fromMarket, toMarket, amount });
  }

  return {
    markets: marketConfigs,
    reserveRebalancing,
  };
}
