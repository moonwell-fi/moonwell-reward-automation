import { describe, it, expect } from 'vitest';
import { returnJson } from '../src/generateJson';
import { mainConfig } from '../src/config';
import BigNumber from 'bignumber.js';

describe('generateJson', () => {
  describe('Moonbeam network', () => {
    it('should include initSale and transferReserves when market has reservesEnabled', async () => {
      const mockMarketData = {
        "1284": [{
          alias: "MOONWELL_WBTC",
          totalReserves: 100,
          minimumReserves: 20,
          reservesEnabled: true,
          digits: 8, // WBTC has 8 decimals
          newWellSupplySpeed: "0",
          newWellBorrowSpeed: "0",
          newNativeSupplySpeed: "0",
          newNativeBorrowSpeed: "0",
        }],
        "8453": [], // Empty array for Base markets
        "10": [], // Empty array for Optimism markets
        moonbeam: {
          wellPerEpochDex: "1000",
          wellPerEpochMarkets: "5000",
          wellPerEpochSafetyModule: "4000",
        },
        epochEndTimestamp: 1723174200,
        epochStartTimestamp: 1723174200 - (60 * 60 * 24 * 7 * 4), // 4 weeks before
        totalSeconds: 60 * 60 * 24 * 7 * 4, // 4 weeks
      };

      const result = await returnJson(mockMarketData, "Moonbeam");

      // Check initSale
      expect(result[1284].initSale).toBeDefined();
      expect(result[1284].initSale).toEqual({
        ...mainConfig.initSale,
        reserveAutomationContracts: ['RESERVE_AUTOMATION_WBTC']
      });

      // Check transferReserves
      const transferReserves = result[1284].transferReserves.find(
        (t: any) => t.market === 'MOONWELL_WBTC' && t.to === 'RESERVE_AUTOMATION_WBTC'
      );
      expect(transferReserves).toBeDefined();
      expect(transferReserves.amount).toBe(
        new BigNumber(80) // 100 - 20
          .shiftedBy(8) // WBTC has 8 decimals
          .decimalPlaces(0, BigNumber.ROUND_FLOOR)
          .toNumber()
      );
    });

    it('should not include initSale when no market has reservesEnabled', async () => {
      const mockMarketData = {
        "1284": [{
          alias: "MOONWELL_WBTC",
          totalReserves: 100,
          minimumReserves: 20,
          reservesEnabled: false,
          digits: 8, // WBTC has 8 decimals
          newWellSupplySpeed: "0",
          newWellBorrowSpeed: "0",
          newNativeSupplySpeed: "0",
          newNativeBorrowSpeed: "0",
        }],
        "8453": [], // Empty array for Base markets
        "10": [], // Empty array for Optimism markets
        moonbeam: {
          wellPerEpochDex: "1000",
          wellPerEpochMarkets: "5000",
          wellPerEpochSafetyModule: "4000",
        },
        epochEndTimestamp: 1723174200,
        epochStartTimestamp: 1723174200 - (60 * 60 * 24 * 7 * 4),
        totalSeconds: 60 * 60 * 24 * 7 * 4,
      };

      const result = await returnJson(mockMarketData, "Moonbeam");

      expect(result[1284].initSale).toBeUndefined();
      const transferReserves = result[1284].transferFrom.find(
        (t: any) => t.market === 'MOONWELL_WBTC' && t.To === 'RESERVE_AUTOMATION_WBTC'
      );
      expect(transferReserves).toBeUndefined();
    });
  });

  describe('Base network', () => {
    it('should include initSale and transferReserves when market has reservesEnabled', async () => {
      const mockMarketData = {
        "8453": [{
          alias: "MOONWELL_USDBC",
          totalReserves: 100,
          minimumReserves: 20,
          reservesEnabled: true,
          digits: 6, // USDC has 6 decimals
          newWellSupplySpeed: "0",
          newWellBorrowSpeed: "0",
          newNativeSupplySpeed: "0",
          newNativeBorrowSpeed: "0",
        }],
        "1284": [], // Empty array for Moonbeam markets
        "10": [], // Empty array for Optimism markets
        base: {
          wellPerEpoch: "10000",
          wellPerEpochDex: "1000",
          wellPerEpochMarkets: "5000",
          wellPerEpochSafetyModule: "4000",
        },
        epochEndTimestamp: 1723174200,
        epochStartTimestamp: 1723174200 - (60 * 60 * 24 * 7 * 4),
        totalSeconds: 60 * 60 * 24 * 7 * 4,
        bridgeCost: "1000000000000000",
      };

      const result = await returnJson(mockMarketData, "Base");

      // Check initSale
      expect(result[8453].initSale).toBeDefined();
      expect(result[8453].initSale).toEqual({
        ...mainConfig.initSale,
        reserveAutomationContracts: ['RESERVE_AUTOMATION_USDBC']
      });

      // Check transferReserves
      const transferReserves = result[8453].transferReserves.find(
        (t: any) => t.market === 'MOONWELL_USDBC' && t.to === 'RESERVE_AUTOMATION_USDBC'
      );
      expect(transferReserves).toBeDefined();
      expect(transferReserves.amount).toBe(
        new BigNumber(80) // 100 - 20
          .shiftedBy(6) // USDC has 6 decimals
          .decimalPlaces(0, BigNumber.ROUND_FLOOR)
          .toNumber()
      );
    });
  });

  describe('Optimism network', () => {
    it('should include initSale and transferReserves when market has reservesEnabled', async () => {
      const mockMarketData = {
        "10": [{
          alias: "MOONWELL_WBTC",
          totalReserves: 100,
          minimumReserves: 20,
          reservesEnabled: true,
          digits: 8, // WBTC has 8 decimals
          newWellSupplySpeed: "0",
          newWellBorrowSpeed: "0",
          newNativeSupplySpeed: "0",
          newNativeBorrowSpeed: "0",
        }],
        "1284": [], // Empty array for Moonbeam markets
        "8453": [], // Empty array for Base markets
        optimism: {
          wellPerEpoch: "10000",
          wellPerEpochDex: "1000",
          wellPerEpochMarkets: "5000",
          wellPerEpochSafetyModule: "4000",
          nativePerEpoch: "1000",
        },
        epochEndTimestamp: 1723174200,
        epochStartTimestamp: 1723174200 - (60 * 60 * 24 * 7 * 4),
        totalSeconds: 60 * 60 * 24 * 7 * 4,
        bridgeCost: "1000000000000000",
      };

      const result = await returnJson(mockMarketData, "Optimism");

      // Check initSale
      expect(result[10].initSale).toBeDefined();
      expect(result[10].initSale).toEqual({
        ...mainConfig.initSale,
        reserveAutomationContracts: ['RESERVE_AUTOMATION_WBTC']
      });

      // Check transferReserves
      const transferReserves = result[10].transferReserves.find(
        (t: any) => t.market === 'MOONWELL_WBTC' && t.to === 'RESERVE_AUTOMATION_WBTC'
      );
      expect(transferReserves).toBeDefined();
      expect(transferReserves.amount).toBe(
        new BigNumber(80) // 100 - 20
          .shiftedBy(8) // WBTC has 8 decimals
          .decimalPlaces(0, BigNumber.ROUND_FLOOR)
          .toNumber()
      );
    });
  });
});
