import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userId' });
  }

  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId,
      visibility: 'PUBLIC',
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ portfolios });
} 