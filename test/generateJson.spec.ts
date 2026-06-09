import { describe, it, expect } from 'vitest';
import { returnJson } from '../src/generateJson';
import { mainConfig } from '../src/config';
import BigNumber from 'bignumber.js';

describe('generateJson', () => {
	describe('Moonbeam network', () => {
		it('should include initSale and transferReserves when market has reservesEnabled', async () => {
			const mockMarketData = {
				'1284': [
					{
						alias: 'MOONWELL_WBTC',
						totalReserves: 100,
						minimumReserves: 20,
						reservesEnabled: true,
						digits: 8, // WBTC has 8 decimals
						newWellSupplySpeed: '0',
						newWellBorrowSpeed: '0',
						newNativeSupplySpeed: '0',
						newNativeBorrowSpeed: '0',
					},
				],
				'8453': [], // Empty array for Base markets
				'10': [], // Empty array for Optimism markets
				moonbeam: {
					wellPerEpochDex: '1000',
					wellPerEpochMarkets: '5000',
					wellPerEpochSafetyModule: '4000',
				},
				epochEndTimestamp: 1723174200,
				epochStartTimestamp: 1723174200 - 60 * 60 * 24 * 7 * 4, // 4 weeks before
				totalSeconds: 60 * 60 * 24 * 7 * 4, // 4 weeks
			};

			const result = await returnJson(mockMarketData, 'Moonbeam');

			// Check initSale
			expect(result[1284].initSale).toBeDefined();
			expect(result[1284].initSale).toEqual({
				...mainConfig.initSale,
				reserveAutomationContracts: ['RESERVE_AUTOMATION_WBTC'],
			});

			// Check transferReserves
			const transferReserves = result[1284].transferReserves.find(
				(t: any) => t.market === 'MOONWELL_WBTC' && t.to === 'RESERVE_AUTOMATION_WBTC',
			);
			expect(transferReserves).toBeDefined();
			expect(transferReserves.amount).toBe(
				new BigNumber(80) // 100 - 20
					.shiftedBy(8) // WBTC has 8 decimals
					.decimalPlaces(0, BigNumber.ROUND_FLOOR)
					.toNumber(),
			);
		});

		it('should not include initSale when no market has reservesEnabled', async () => {
			const mockMarketData = {
				'1284': [
					{
						alias: 'MOONWELL_WBTC',
						totalReserves: 100,
						minimumReserves: 20,
						reservesEnabled: false,
						digits: 8, // WBTC has 8 decimals
						newWellSupplySpeed: '0',
						newWellBorrowSpeed: '0',
						newNativeSupplySpeed: '0',
						newNativeBorrowSpeed: '0',
					},
				],
				'8453': [], // Empty array for Base markets
				'10': [], // Empty array for Optimism markets
				moonbeam: {
					wellPerEpochDex: '1000',
					wellPerEpochMarkets: '5000',
					wellPerEpochSafetyModule: '4000',
				},
				epochEndTimestamp: 1723174200,
				epochStartTimestamp: 1723174200 - 60 * 60 * 24 * 7 * 4,
				totalSeconds: 60 * 60 * 24 * 7 * 4,
			};

			const result = await returnJson(mockMarketData, 'Moonbeam');

			expect(result[1284].initSale).toBeUndefined();
			const transferReserves = result[1284].transferFrom.find(
				(t: any) => t.market === 'MOONWELL_WBTC' && t.To === 'RESERVE_AUTOMATION_WBTC',
			);
			expect(transferReserves).toBeUndefined();
		});
	});

	describe('Base network', () => {
		it('should include initSale and transferReserves when market has reservesEnabled', async () => {
			const mockMarketData = {
				'8453': [
					{
						alias: 'MOONWELL_USDBC',
						totalReserves: 100,
						minimumReserves: 20,
						reservesEnabled: true,
						digits: 6, // USDC has 6 decimals
						newWellSupplySpeed: '0',
						newWellBorrowSpeed: '0',
						newNativeSupplySpeed: '0',
						newNativeBorrowSpeed: '0',
					},
				],
				'1284': [], // Empty array for Moonbeam markets
				'10': [], // Empty array for Optimism markets
				base: {
					wellPerEpoch: '10000',
					wellPerEpochDex: '1000',
					wellPerEpochMarkets: '5000',
					wellPerEpochSafetyModule: '4000',
				},
				epochEndTimestamp: 1723174200,
				epochStartTimestamp: 1723174200 - 60 * 60 * 24 * 7 * 4,
				totalSeconds: 60 * 60 * 24 * 7 * 4,
				bridgeCost: '1000000000000000',
			};

			const result = await returnJson(mockMarketData, 'Base');

			// Check initSale
			expect(result[8453].initSale).toBeDefined();
			expect(result[8453].initSale).toEqual({
				...mainConfig.initSale,
				reserveAutomationContracts: ['RESERVE_AUTOMATION_USDBC'],
			});

			// Check transferReserves
			const transferReserves = result[8453].transferReserves.find(
				(t: any) => t.market === 'MOONWELL_USDBC' && t.to === 'RESERVE_AUTOMATION_USDBC',
			);
			expect(transferReserves).toBeDefined();
			expect(transferReserves.amount).toBe(
				new BigNumber(80) // 100 - 20
					.shiftedBy(6) // USDC has 6 decimals
					.decimalPlaces(0, BigNumber.ROUND_FLOOR)
					.toNumber(),
			);
		});
	});

	describe('Optimism network', () => {
		it('should include initSale and transferReserves when market has reservesEnabled', async () => {
			const mockMarketData = {
				'10': [
					{
						alias: 'MOONWELL_WBTC',
						totalReserves: 100,
						minimumReserves: 20,
						reservesEnabled: true,
						digits: 8, // WBTC has 8 decimals
						newWellSupplySpeed: '0',
						newWellBorrowSpeed: '0',
						newNativeSupplySpeed: '0',
						newNativeBorrowSpeed: '0',
					},
				],
				'1284': [], // Empty array for Moonbeam markets
				'8453': [], // Empty array for Base markets
				optimism: {
					wellPerEpoch: '10000',
					wellPerEpochDex: '1000',
					wellPerEpochMarkets: '5000',
					wellPerEpochSafetyModule: '4000',
					nativePerEpoch: '1000',
				},
				epochEndTimestamp: 1723174200,
				epochStartTimestamp: 1723174200 - 60 * 60 * 24 * 7 * 4,
				totalSeconds: 60 * 60 * 24 * 7 * 4,
				bridgeCost: '1000000000000000',
			};

			const result = await returnJson(mockMarketData, 'Optimism');

			// Check initSale
			expect(result[10].initSale).toBeDefined();
			expect(result[10].initSale).toEqual({
				...mainConfig.initSale,
				reserveAutomationContracts: ['RESERVE_AUTOMATION_WBTC'],
			});

			// Check transferReserves
			const transferReserves = result[10].transferReserves.find(
				(t: any) => t.market === 'MOONWELL_WBTC' && t.to === 'RESERVE_AUTOMATION_WBTC',
			);
			expect(transferReserves).toBeDefined();
			expect(transferReserves.amount).toBe(
				new BigNumber(80) // 100 - 20
					.shiftedBy(8) // WBTC has 8 decimals
					.decimalPlaces(0, BigNumber.ROUND_FLOOR)
					.toNumber(),
			);
		});
	});

	describe('stkWELL APY cap scales with epoch duration', () => {
		it('caps wellHolderBalance differently for 28- vs 31-day epochs (Optimism)', async () => {
			const base = {
				'1284': [],
				'8453': [],
				'10': [],
				optimism: {
					wellPerEpoch: '0',
					wellPerEpochDex: '0',
					wellPerEpochMarkets: '0',
					wellPerEpochSafetyModule: '0',
					wellHolderBalance: (1_000_000n * 10n ** 18n).toString(),
				},
				optimismStkWELLTotalSupply: (100_000_000n * 10n ** 18n).toString(),
				epochStartTimestamp: 1739577600,
			};

			const make = (durationSeconds: number) => ({
				...base,
				epochEndTimestamp: 1739577600 + durationSeconds,
				totalSeconds: durationSeconds,
			});

			const r28 = await returnJson(make(28 * 86400), 'Optimism');
			const r31 = await returnJson(make(31 * 86400), 'Optimism');

			// The 10% APY cap bounds the wellHolderBalance contribution (withdrawWell).
			// With the OLD fixed 365/28 epochs-per-year constant this cap is identical
			// for any month length; with the duration-based cap a 31-day epoch permits
			// a larger contribution than a 28-day epoch.
			const amt28 = r28[10].withdrawWell[0].amount;
			const amt31 = r31[10].withdrawWell[0].amount;
			expect(amt31).toBeGreaterThan(amt28);
			expect(amt28).toBeGreaterThan(0);
		});
	});

	describe('Ethereum bridge source', () => {
		const baseMarketData = () => ({
			'1284': [],
			'8453': [],
			'10': [],
			moonbeam: {
				wellPerEpoch: '30000',
				wellPerEpochDex: '1000',
				wellPerEpochMarkets: '20000',
				wellPerEpochSafetyModule: '9000',
			},
			base: {
				wellPerEpoch: '50000',
				wellPerEpochDex: '0',
				wellPerEpochMarkets: '40000',
				wellPerEpochSafetyModule: '5000',
				wellHolderBalance: '0',
				vaultAmounts: { USDC: '0', WETH: '0', EURC: '0', cbBTC: '0', meUSDC: '0' },
			},
			optimism: {
				wellPerEpoch: '20000',
				wellPerEpochDex: '0',
				wellPerEpochMarkets: '18000',
				wellPerEpochSafetyModule: '2000',
				wellHolderBalance: '0',
				optimismUSDCVaultWellRewardAmount: 0,
			},
			baseStkWELLTotalSupply: '0',
			optimismStkWELLTotalSupply: '0',
			epochStartTimestamp: 1739577600,
			epochEndTimestamp: 1739577600 + 28 * 86400,
			totalSeconds: 28 * 86400,
		});

		it('Base emits an Ethereum (1) source block from FOUNDATION_MULTISIG with no nativeValue', async () => {
			const r = await returnJson(baseMarketData(), 'Base');
			expect(r[1]).toBeDefined();
			expect(r[1].transferFrom[0].from).toBe('FOUNDATION_MULTISIG');
			expect(r[1].transferFrom[0].to).toBe('MULTICHAIN_GOVERNOR_V2_PROXY');
			expect(r[1].transferFrom[0].token).toBe('xWELL_PROXY');
			expect(r[1].bridgeToRecipient[0].network).toBe(8453);
			expect(r[1].bridgeToRecipient[0].target).toBe('TEMPORAL_GOVERNOR');
			expect(r[1].bridgeToRecipient[0]).not.toHaveProperty('nativeValue');
			// legacy Moonbeam source key must NOT carry the bridge anymore
			expect(r[1284]).toBeUndefined();
		});

		it('Moonbeam becomes a destination funded from TEMPORAL_GOVERNOR and bridged from Ethereum', async () => {
			const r = await returnJson(baseMarketData(), 'Moonbeam');
			// Ethereum source carries the bridge to Moonbeam
			expect(r[1].bridgeToRecipient[0].network).toBe(1284);
			expect(r[1].transferFrom[0].from).toBe('FOUNDATION_MULTISIG');
			// Moonbeam destination block funds from TEMPORAL_GOVERNOR, not MGLIMMER
			const froms = r[1284].transferFrom.map((t: any) => t.from);
			expect(froms.every((f: string) => f === 'TEMPORAL_GOVERNOR')).toBe(true);
			expect(froms).not.toContain('MGLIMMER_MULTISIG');
		});

		it('emits no Moonbeam source actions (no dust) when all Moonbeam incentives are zero', async () => {
			const md = baseMarketData();
			md.moonbeam = {
				wellPerEpoch: '0',
				wellPerEpochDex: '0',
				wellPerEpochMarkets: '0',
				wellPerEpochSafetyModule: '0',
			};
			const r = await returnJson(md, 'Moonbeam');
			// Zeroed network must not fund or bridge any WELL via the unconditional padding.
			expect(r[1].transferFrom).toEqual([]);
			expect(r[1].bridgeToRecipient).toEqual([]);
		});
	});
});
