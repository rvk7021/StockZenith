import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function askGemini(portfolio: any, question: string) {
  const prompt = `You are a financial assistant. Given the following portfolio, answer the user's question concisely and accurately.\n\nPortfolio:\n${JSON.stringify(portfolio, null, 2)}\n\nQuestion: ${question}\n\nAnswer:`;
  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { portfolio, question } = req.body;
  if (!portfolio || !question) return res.status(400).json({ error: 'Portfolio and question required' });
  try {
    const answer = await askGemini(portfolio, question);
    return res.json({ answer });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to get answer', details: (e as any).message });
  }
}