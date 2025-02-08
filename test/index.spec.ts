import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../src/index';

describe('Moonwell Reward Automation worker', () => {
  const mockEnv = {
    ENVIRONMENT: 'test',
    ETHEREUM_RPC: 'http://localhost:8545',
    MOONBEAM_RPC: 'http://localhost:8545',
    BASE_RPC: 'http://localhost:8545',
    OPTIMISM_RPC: 'http://localhost:8545',
  };

  const mockCtx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
    abort: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('responds with markdown content for Moonbeam network', async () => {
    vi.setConfig({ testTimeout: 30000 }); // Set 30 second timeout for this test
    const mockRequest = new Request('http://example.com/?type=markdown&network=Moonbeam&timestamp=1707379200');
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
