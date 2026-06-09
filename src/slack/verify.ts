/**
 * Slack request signature verification
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */

/**
 * Verify that a request is actually from Slack
 * @param request - The incoming request
 * @param signingSecret - The Slack app signing secret
 * @returns true if valid, throws error if invalid
 */
export async function verifySlackRequest(
  request: Request,
  signingSecret: string
): Promise<{ valid: boolean; body: string }> {
  const timestamp = request.headers.get('x-slack-request-timestamp');
  const signature = request.headers.get('x-slack-signature');

  if (!timestamp || !signature) {
    throw new Error('Missing Slack signature headers');
  }

  // Check if timestamp is within 5 minutes to prevent replay attacks
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 60 * 5) {
    throw new Error('Request timestamp is too old');
  }

  // Get the raw body
  const body = await request.text();

  // Create the signature base string
  const sigBaseString = `v0:${timestamp}:${body}`;

  // Calculate the expected signature using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(sigBaseString)
  );

  // Convert to hex string
  const expectedSignature = 'v0=' + Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Compare signatures using timing-safe comparison
  if (!timingSafeEqual(signature, expectedSignature)) {
    throw new Error('Invalid Slack signature');
  }

  return { valid: true, body };
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Parse URL-encoded form body (used by Slack commands)
 */
export function parseFormBody(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
}

/**
 * Parse JSON payload from Slack interaction (URL-encoded with 'payload' key)
 */
export function parseInteractionPayload<T>(body: string): T {
  const params = new URLSearchParams(body);
  const payload = params.get('payload');

  if (!payload) {
    throw new Error('Missing payload in interaction request');
  }

  return JSON.parse(payload) as T;
}
