import { describe, it, expect, beforeEach, vi } from 'vitest';
import { env } from 'cloudflare:test';
import worker from '../src/index';

describe('Moonwell Reward Automation worker', () => {
  // env carries the *_RPC_URL vars from .dev.vars (loaded by the Workers pool),
  // which createClients() reads. Without them, viem falls back to its default
  // public endpoints.
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

  it('responds with markdown content for Base network', { timeout: 30000 }, async () => {
    const timestamp = Math.floor(Date.now() / 1000) - 3600;
    const mockRequest = new Request(`http://example.com/?type=markdown&network=Base&timestamp=${timestamp}`);
    const response = await worker.fetch(mockRequest, mockEnv, mockCtx);

    expect(response.status).toBe(200);
    const contentType = response.headers.get('content-type');
    expect(contentType).toBeDefined();
    expect(contentType).toContain('text/markdown');
  });

  it('returns 400 for a sunset or unknown network', async () => {
    const mockRequest = new Request('http://example.com/?type=json&network=Moonbeam&timestamp=1707379200');
    const response = await worker.fetch(mockRequest, mockEnv, mockCtx);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Invalid network parameter');
  });

  it('returns 400 for missing required parameters', async () => {
    const mockRequest = new Request('http://example.com/?network=Base');
    const response = await worker.fetch(mockRequest, mockEnv, mockCtx);
    
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Missing required parameters');
  });

  it('returns 400 for invalid type parameter', async () => {
    const mockRequest = new Request('http://example.com/?type=invalid&network=Base&timestamp=1707379200');
    const response = await worker.fetch(mockRequest, mockEnv, mockCtx);
    
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Invalid type parameter');
  });
});
