import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { portfolioId } = req.query;
  if (!portfolioId || typeof portfolioId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid portfolioId' });
  }

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: { lots: true },
  });

  if (!portfolio || portfolio.visibility !== 'PUBLIC') {
    return res.status(404).json({ error: 'Portfolio not found or not public' });
  }

  return res.json({
    id: portfolio.id,
    name: portfolio.name,
    cash: portfolio.cash,
    lots: portfolio.lots,
    createdAt: portfolio.createdAt,
    visibility: portfolio.visibility,
  });
} 