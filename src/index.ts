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

import { getMarketsAndPrices } from "./utils";

export default {
	async fetch(request: Request, env: Record<string, any>, ctx: ExecutionContext): Promise<Response> {
		try {
			// console.log(await getMarkets());
			console.log(await getMarketsAndPrices());
			return new Response('Hello World!');
		} catch (error) {
			console.error('Error:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;