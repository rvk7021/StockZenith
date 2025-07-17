import fetch from 'node-fetch';

const API_KEY = process.env.STOCK_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

// Simple in-memory cache (per serverless invocation)
const priceCache: Record<string, { price: number | null; ts: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute

type FinnhubQuote = { c?: number; error?: string; s?: string };

async function fetchFinnhubQuote(ticker: string): Promise<number | null> {
  const url = `${BASE_URL}/quote?symbol=${ticker}&token=${API_KEY}`;
  const res = await fetch(url);
  const data: unknown = await res.json();
  if (
    data &&
    typeof data === 'object' &&
    data !== null &&
    'c' in data &&
    typeof (data as FinnhubQuote).c === 'number' &&
    !isNaN((data as FinnhubQuote).c!)
  ) {
    return (data as FinnhubQuote).c!;
  }
  // Check for rate limit or error
  if (
    data &&
    typeof data === 'object' &&
    ((data as FinnhubQuote).error || (data as FinnhubQuote).s === 'no_data')
  )
    return null;
  return null;
}

export async function fetchStockPrices(tickers: string[]): Promise<Record<string, number | null>> {
  const prices: Record<string, number | null> = {};
  for (const ticker of tickers) {
    // Check cache
    const cached = priceCache[ticker];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      prices[ticker] = cached.price;
      continue;
    }
    let price: number | null = null;
    try {
      price = await fetchFinnhubQuote(ticker);
    } catch {
      price = null;
    }
    prices[ticker] = price;
    priceCache[ticker] = { price, ts: Date.now() };
    // Finnhub free tier: 60 requests/min, so add a small delay for safety
    await new Promise(r => setTimeout(r, 200));
  }
  return prices;
} 