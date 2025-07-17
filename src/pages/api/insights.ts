import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchStockPrices } from '@/lib/stockPrice';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Add Portfolio and Lot interfaces for type safety
interface Lot {
  id?: string;
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
}

interface Portfolio {
  id: string;
  name: string;
  cash: number;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED';
  lots: Lot[];
}

interface AIInsights {
  summary?: string | string[];
  sector_analysis?: string | string[];
  diversification?: string | string[];
  risk_assessment?: string | string[];
  recommendations?: string | string[];
}

async function getGeminiInsights(portfolio: Portfolio): Promise<AIInsights> {
  const prompt = `You are a financial assistant. Analyze the following stock portfolio and provide:
1. Portfolio Summary: A concise summary of the portfolio's composition and cash position.
2. Sector Analysis: Discuss sector allocation and concentration.
3. Diversification: Assess the portfolio's diversification across stocks, sectors, and risk factors.
4. Risk Assessment: Identify key risks (concentration, volatility, market, etc.).
5. Recommendations: Provide actionable suggestions to improve diversification, reduce risk, or optimize performance.

Portfolio:
${JSON.stringify(portfolio, null, 2)}

Respond in JSON with the following keys: summary, sector_analysis, diversification, risk_assessment, recommendations.

IMPORTANT:
- For each key, return EITHER a short, human-readable paragraph OR a list of up to 5 short, clear bullet points.
- Do NOT return any nested objects or arrays of objects. Each value must be a string or a flat list of strings.
- Do NOT include any code block markers or extra formatting.
- Your response must be easy to display directly to end users without further processing.
- Example:
{
  "summary": ["Bullet 1", "Bullet 2", ...],
  "sector_analysis": "Short paragraph or up to 5 bullets",
  ...
}`;

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  // Gemini returns a text block, try to parse JSON from it
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    // Remove code block markers if present
    text = text.replace(/^```json|```$/g, '').trim();
    return JSON.parse(text);
  } catch {
    return { summary: text, sector_analysis: '' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { portfolio } = req.body;
  if (!portfolio) return res.status(400).json({ error: 'Portfolio required' });
  try {
    // Fetch real-time prices for all tickers
    const tickers = (portfolio.lots || []).map((h: Lot) => h.ticker);
    const prices = await fetchStockPrices(tickers);
    // Attach prices to lots
    const portfolioWithPrices: Portfolio = {
      ...portfolio,
      lots: (portfolio.lots || []).map((h: Lot) => ({
        ...h,
        price: prices[h.ticker] || null,
      })),
    };
    const insights = await getGeminiInsights(portfolioWithPrices);
    return res.json(insights);
  } catch (e: unknown) {
    return res.status(500).json({ error: 'Failed to generate insights', details: (e as Error).message });
  }
} 