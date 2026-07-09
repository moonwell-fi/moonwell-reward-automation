import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env } from 'cloudflare:test';
import worker from '../src/index';

describe('Moonwell Reward Automation worker', () => {
  // env carries the *_RPC_URL vars from .dev.vars (loaded by the Workers pool),
  // which createClients() reads. Without them, viem falls back to its default
  // public endpoints — and its Moonbeam default has been decommissioned.
  const mockEnv = {
    ...env,
    ENVIRONMENT: 'test',
  };

  const mockCtx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
    abort: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('responds with markdown content for Moonbeam network', { timeout: 30000 }, async () => {
    // Use a recent timestamp: at historical Moonbeam blocks (lower block gas
    // limits), providers that inject a default eth_call gas limit (e.g.
    // Alchemy) trip Moonbeam's 10x-block-gas-limit cap and every read reverts.
    const timestamp = Math.floor(Date.now() / 1000) - 3600;
    const mockRequest = new Request(`http://example.com/?type=markdown&network=Moonbeam&timestamp=${timestamp}`);
    const response = await worker.fetch(mockRequest, mockEnv, mockCtx);
    
    expect(response.status).toBe(200);
    const contentType = response.headers.get('content-type');
    expect(contentType).toBeDefined();
    expect(contentType).toContain('text/markdown');
  });

  it('returns 400 for missing required parameters', async () => {
    const mockRequest = new Request('http://example.com/?network=Moonbeam');
    const response = await worker.fetch(mockRequest, mockEnv, mockCtx);
    
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Missing required parameters');
  });

  it('returns 400 for invalid type parameter', async () => {
    const mockRequest = new Request('http://example.com/?type=invalid&network=Moonbeam&timestamp=1707379200');
    const response = await worker.fetch(mockRequest, mockEnv, mockCtx);
    
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Invalid type parameter');
  });
});
