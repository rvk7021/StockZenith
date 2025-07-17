import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchStockPrices } from '@/lib/stockPrice';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { tickers } = req.body;
  if (!Array.isArray(tickers) || tickers.length === 0) {
    return res.status(400).json({ error: 'Tickers required' });
  }
  try {
    const prices = await fetchStockPrices(tickers);
    return res.json({ prices });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch prices', details: (e as unknown as Error).message });
  }
} 