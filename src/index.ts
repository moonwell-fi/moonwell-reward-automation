/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { getMarketData } from "./markets";
import { returnJson } from "./generateJson";
import { generateMarkdown } from "./generateMarkdown";
import { getDexInfo } from "./dex";
import { applyConfigOverrides, validateSplits, type ConfigOverrides } from "./config";
import { CHAIN_IDS, CHAIN_NAMES } from "./types/config";

// Single source of truth for the supported-network roster: validation and the
// default all-networks iteration order both derive from the chain registry.
// (CHAIN_IDS is an explicit array — Object.keys/values on CHAIN_NAMES would
// reorder its integer-like keys numerically and put Ethereum first.)
const SUPPORTED_NETWORKS = CHAIN_IDS.map(id => CHAIN_NAMES[id]);

// Markdown proposal sections render Base first and Optimism last (wind-down).
// Membership still derives from SUPPORTED_NETWORKS: a network missing from the
// preferred order is appended at the end rather than silently dropped.
const MARKDOWN_ORDER = ['Base', 'Ethereum', 'Optimism'];
const MARKDOWN_NETWORKS = [
	...MARKDOWN_ORDER.filter(network => SUPPORTED_NETWORKS.includes(network)),
	...SUPPORTED_NETWORKS.filter(network => !MARKDOWN_ORDER.includes(network)),
];

// Helper function to deep merge objects
function deepMerge(target: any, source: any) {
	for (const key in source) {
		if (source[key] instanceof Object && key in target) {
			if (Array.isArray(source[key])) {
				if (!Array.isArray(target[key])) {
					target[key] = [];
				}
				target[key] = target[key].concat(source[key]);
			} else {
				target[key] = deepMerge(Object.assign({}, target[key]), source[key]);
			}
		} else {
			Object.assign(target, { [key]: source[key] });
		}
	}
	return target;
}

export default {
	async fetch(request: Request, env: Record<string, any>, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const searchParams = url.searchParams;
		const type = searchParams.get('type');
		const network = searchParams.get('network');
		const timestamp = searchParams.get('timestamp');
		const configOverridesParam = searchParams.get('configOverrides');

		if (!type || !timestamp) {
			return new Response('Missing required parameters: type and timestamp', { status: 400 });
		}

		if (network && !SUPPORTED_NETWORKS.includes(network)) {
			return new Response(`Invalid network parameter. Use one of: ${SUPPORTED_NETWORKS.join(', ')}`, { status: 400 });
		}

		// Parse and validate config overrides if provided (URL-encoded JSON)
		let configOverrides: ConfigOverrides | undefined;
		if (configOverridesParam) {
			try {
				configOverrides = JSON.parse(configOverridesParam);
			} catch {
				return new Response('Invalid configOverrides JSON', { status: 400 });
			}

			// Validate override values and split sums
			try {
				const effectiveConfig = applyConfigOverrides(configOverrides);
				const validationError = validateSplits(effectiveConfig);
				if (validationError) {
					return new Response(`Invalid config overrides: ${validationError}`, { status: 400 });
				}
			} catch (e) {
				return new Response(`Invalid config overrides: ${e instanceof Error ? e.message : String(e)}`, { status: 400 });
			}
		}

		try {
			if (type === 'json') {
				const marketData = await getMarketData(Number(timestamp), env, configOverrides);
				const networks = network ? [network] : SUPPORTED_NETWORKS;

				const mergedJson = await networks.reduce(async (accPromise, n) => {
					const acc = await accPromise;
					const result = await returnJson(marketData, n);
					return deepMerge(acc, result);
				}, Promise.resolve({}));
		
				return new Response(JSON.stringify(mergedJson, null, 2), {
					headers: {
						'content-type': 'application/json',
					},
				});
			} else if (type === 'markdown') {
				const proposalNumber = searchParams.get('proposal') || 'X??';
				const marketData = await getMarketData(Number(timestamp), env, configOverrides);
				const dexData = await getDexInfo();
				let markdown = '';
				if (network) {
					markdown += `# MIP-${proposalNumber} Automated Liquidity Incentive Proposal

This is an automated liquidity incentive governance proposal for the Moonwell protocol on the ${network} network.

`;
				} else {
					markdown += `# MIP-${proposalNumber} Automated Liquidity Incentive Proposal

This is an automated liquidity incentive governance proposal for the Moonwell protocol.

`;
				}
				const networks = network ? [network] : MARKDOWN_NETWORKS;

				for (const n of networks) {
					markdown += await generateMarkdown(marketData, proposalNumber, n, dexData);
				}
				return new Response(markdown, {
					headers: {
						'content-type': 'text/markdown',
					},
				});
			} else {
				return new Response('Invalid type parameter. Use ?type=json or ?type=markdown', { status: 400 });
			}
		} catch (error) {
			console.error('Error:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
