import { describe, it, expect } from 'vitest';
import { mainConfig, marketConfigs, applyConfigOverrides, validateSplits } from '../src/config';

describe('market supply/borrow ratios', () => {
  it('sum to exactly 1 for every market on every chain', () => {
    // The by-speed emission total only equals the funded market bucket (keeping the
    // grand total capped at totalWellPerEpoch) when every market's ratios sum to 1.
    for (const [chainId, markets] of Object.entries(marketConfigs)) {
      for (const market of markets) {
        expect(market.supply + market.borrow, `${chainId} ${market.nameOverride}`).toBeCloseTo(1, 9);
      }
    }
  });
});

describe('network rewardsEnabled flag', () => {
  it('ships with Optimism disabled, Base and Ethereum enabled', () => {
    expect(mainConfig.optimism.rewardsEnabled).toBe(false);
    expect(mainConfig.base.rewardsEnabled).toBe(true);
    expect(mainConfig.ethereum.rewardsEnabled).toBe(true);
  });

  it('is not settable via configOverrides (unknown keys are rejected)', () => {
    expect(() => applyConfigOverrides({ optimism: { rewardsEnabled: 1 } } as any))
      .toThrow(/unknown key "rewardsEnabled"/);
    // Same hole closed for the other config-only network fields.
    expect(() => applyConfigOverrides({ base: { nativePerEpoch: 1 } } as any))
      .toThrow(/unknown key "nativePerEpoch"/);
  });

  it('legitimate split overrides still apply and preserve the flag', () => {
    const config = applyConfigOverrides({ base: { markets: 0.6, safetyModule: 0.15 } });
    expect(config.base.markets).toBe(0.6);
    expect(config.base.safetyModule).toBe(0.15);
    expect(config.base.rewardsEnabled).toBe(true);
    expect(config.optimism.rewardsEnabled).toBe(false);
    // mainConfig itself is untouched (deep copy)
    expect(mainConfig.base.markets).toBe(0.45);
  });
});

describe('validateSplits with rewardsEnabled', () => {
  it('accepts the ship config: disabled Optimism keeps splits summing to 1.0', () => {
    expect(validateSplits(applyConfigOverrides())).toBeNull();
  });

  it('rejects all three networks disabled', () => {
    const config = applyConfigOverrides();
    config.base.rewardsEnabled = false;
    config.ethereum.rewardsEnabled = false;
    expect(validateSplits(config)).toMatch(/at least one network must have rewardsEnabled/);
  });
});
