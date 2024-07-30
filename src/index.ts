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

		if (!type || !network) {
			return new Response('Missing required search parameters: type and network', { status: 400 });
		}

		try {
			if (type === 'json') {
				const marketData = await getMarketData();
				const dexData = await getDexInfo();
				const json = await returnJson(marketData, network);
				return new Response(JSON.stringify(json, null, 2), {
					headers: {
						'content-type': 'application/json',
					},
				});
			} else if (type === 'markdown') {
				const proposalNumber = searchParams.get('proposal') || 'X??';
				const marketData = await getMarketData();
				const dexData = await getDexInfo();
				const markdown = await generateMarkdown(marketData, proposalNumber, network, dexData);
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
