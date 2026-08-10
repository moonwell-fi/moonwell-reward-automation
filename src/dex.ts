
export const DEFILLAMA_URL = 'https://yields.llama.fi/chart'
export const ETH_WELL_AERODROME_V1_POOL_ID = '1f0c0a53-577c-4dd0-97af-f1791f532f51'

export interface DefiLllamaPoolResult {
  "status": "success" | "error",
  "data": {
    "timestamp": string,
    "tvlUsd": number | null,
    "apy": number | null,
    "apyBase": number | null,
    "apyReward": number | null,
    "il7d": number | null,
    "apyBase7d": number | null,
  }[]
}

export interface DexPoolInfo {
  network: number,
  dex: string,
  symbol: string,
  tvl: number,
  apy: number
}

export async function getDexInfo() {

  let aerodromeFetch = await fetch(`${DEFILLAMA_URL}/${ETH_WELL_AERODROME_V1_POOL_ID}`);
  let aerodromeResult = await aerodromeFetch.json() as DefiLllamaPoolResult

  let result: DexPoolInfo[] = []
  if (aerodromeResult.status == "success") {
    let aerodromeLastInfo = aerodromeResult.data[aerodromeResult.data.length - 1]
    result.push({
      network: 8453,
      dex: `Aerodrome`,
      symbol: `ETH/WELL`,
      apy: aerodromeLastInfo.apy || 0,
      tvl: aerodromeLastInfo.tvlUsd || 0,
    })
  }

  return result;
}