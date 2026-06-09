/**
 * Epoch configuration types for the Slack bot
 */

import { fifteenthOfMonthUTC } from '../epochs';

// Chain IDs
export type ChainId = '1284' | '8453' | '10';

export const CHAIN_NAMES: Record<ChainId, string> = {
	'1284': 'Moonbeam',
	'8453': 'Base',
	'10': 'Optimism',
};

export const CHAIN_IDS: ChainId[] = ['1284', '8453', '10'];

// Epochs are calendar months running 15th 00:00:00 UTC -> next 15th (variable 28-31 days).
// Epoch numbering is anchored to the first day-15 epoch.
export const FIRST_EPOCH_YEAR = 2025;
export const FIRST_EPOCH_MONTH = 0; // January (0-indexed); epoch 1 starts 2025-01-15 UTC

/**
 * Configuration for a single market within a network
 */
export interface MarketConfig {
	/** Whether this market is enabled for rewards */
	enabled: boolean;
	/** Boost/deboost multiplier (1.0 = normal, 1.2 = 20% boost, 0.8 = 20% deboost) */
	boost: number;
	/** Amount of reserves to withdraw for buybacks (in USD) */
	buybackWithdrawal: string;
}

/**
 * Reserve transfer between markets
 */
export interface RebalanceTransfer {
	/** Source market address or "none" */
	fromMarket: string;
	/** Destination market address or "none" */
	toMarket: string;
	/** Amount to transfer (in underlying token or USD) */
	amount: string;
}

/**
 * Configuration for a single network
 */
export interface NetworkConfig {
	/** Market configurations keyed by market address */
	markets: Record<string, MarketConfig>;
	/** Reserve rebalancing transfers */
	reserveRebalancing: RebalanceTransfer[];
}

/**
 * Complete epoch configuration
 */
export interface EpochConfig {
	/** Epoch number (1-indexed) */
	epochNumber: number;
	/** Epoch start date (ISO format) */
	epochDate: string;
	/** Network-specific configurations */
	networks: Record<ChainId, NetworkConfig>;
	/** Slack user ID who created this config */
	createdBy: string;
	/** Creation timestamp (ISO format) */
	createdAt: string;
	/** Config status */
	status: 'draft' | 'submitted';
	/** PR URL if submitted */
	prUrl?: string;
}

/**
 * Market info for display in Slack modals
 */
export interface MarketInfo {
	address: string;
	name: string;
	alias: string;
	chainId: ChainId;
	enabled: boolean;
	boost: number;
	deboost: number;
	decimals: number;
}

/**
 * Epoch number from a timestamp. Epoch 1 starts on FIRST_EPOCH_YEAR/MONTH the 15th.
 * Counts whole month-epochs elapsed since the anchor.
 */
export function getEpochNumber(timestamp: number = Date.now() / 1000): number {
	const d = new Date(timestamp * 1000);
	let year = d.getUTCFullYear();
	let month = d.getUTCMonth();
	// Before the 15th, we are still in the previous month's epoch.
	if (timestamp < fifteenthOfMonthUTC(year, month)) {
		month -= 1;
		if (month < 0) {
			month = 11;
			year -= 1;
		}
	}
	const monthsElapsed = (year - FIRST_EPOCH_YEAR) * 12 + (month - FIRST_EPOCH_MONTH);
	return monthsElapsed + 1;
}

/**
 * Start timestamp (15th 00:00 UTC) of a given epoch number.
 */
export function getEpochStartTimestamp(epochNumber: number): number {
	const monthsFromAnchor = epochNumber - 1;
	const totalMonths = FIRST_EPOCH_MONTH + monthsFromAnchor;
	const year = FIRST_EPOCH_YEAR + Math.floor(totalMonths / 12);
	const month = ((totalMonths % 12) + 12) % 12;
	return fifteenthOfMonthUTC(year, month);
}

/**
 * Calculate days until next epoch
 */
export function getDaysUntilNextEpoch(timestamp: number = Date.now() / 1000): number {
	const currentEpoch = getEpochNumber(timestamp);
	const nextEpochStart = getEpochStartTimestamp(currentEpoch + 1);
	return Math.ceil((nextEpochStart - timestamp) / 86400);
}

/**
 * Format epoch date for display
 */
export function formatEpochDate(epochNumber: number): string {
	const timestamp = getEpochStartTimestamp(epochNumber);
	return new Date(timestamp * 1000).toISOString().split('T')[0];
}

/**
 * Create a default network config with all markets disabled and default values
 */
export function createDefaultNetworkConfig(markets: MarketInfo[]): NetworkConfig {
	const marketConfigs: Record<string, MarketConfig> = {};

	for (const market of markets) {
		marketConfigs[market.address] = {
			enabled: market.enabled,
			boost: market.boost > 0 ? market.boost / 1_000_000 : market.deboost > 0 ? -market.deboost / 1_000_000 : 1.0,
			buybackWithdrawal: '0',
		};
	}

	return {
		markets: marketConfigs,
		reserveRebalancing: [
			{ fromMarket: 'none', toMarket: 'none', amount: '0' },
			{ fromMarket: 'none', toMarket: 'none', amount: '0' },
			{ fromMarket: 'none', toMarket: 'none', amount: '0' },
		],
	};
}

/**
 * Create a default epoch config
 */
export function createDefaultEpochConfig(epochNumber: number, networks: Record<ChainId, NetworkConfig>, userId: string): EpochConfig {
	return {
		epochNumber,
		epochDate: formatEpochDate(epochNumber),
		networks,
		createdBy: userId,
		createdAt: new Date().toISOString(),
		status: 'draft',
	};
}
