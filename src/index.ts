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

export default {
	async fetch(request: Request, env: Record<string, any>, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const searchParams = url.searchParams;
		const type = searchParams.get('type');
		const network = searchParams.get('network');
		const timestamp = searchParams.get('timestamp');

		if (!type || !timestamp) {
			return new Response('Missing required parameters: type and timestamp', { status: 400 });
		}

		try {
			if (type === 'json') {
				const marketData = await getMarketData(Number(timestamp));
				let json = '';
				const networks = network ? [network] : ['Optimism', 'Moonbeam', 'Base'];

				const jsonArray = await Promise.all(networks.map(async (n) => {
					const result = await returnJson(marketData, n);
					return result;
				}));

				return new Response(JSON.stringify(jsonArray, null, 2), {
					headers: {
							'content-type': 'application/json',
					},
				});
			} else if (type === 'markdown') {
				const proposalNumber = searchParams.get('proposal') || 'X??';
				const marketData = await getMarketData(Number(timestamp));
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
				const networks = network ? [network] : ['Optimism', 'Moonbeam', 'Base'];

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
