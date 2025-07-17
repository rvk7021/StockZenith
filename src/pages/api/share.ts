import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 16);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { portfolioId } = req.body;
  if (!portfolioId) return res.status(400).json({ error: 'Portfolio ID required' });

  // Fetch user by email
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Check ownership
  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio || portfolio.userId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Create or reuse a share token
  let shared = await prisma.sharedPortfolioAccess.findFirst({
    where: { portfolioId, revoked: false },
  });
  if (!shared) {
    shared = await prisma.sharedPortfolioAccess.create({
      data: {
        portfolioId,
        token: nanoid(),
        createdById: user.id,
      },
    });
  }
  const link = `${req.headers.origin || ''}/portfolio/${shared.token}`;
  return res.json({ link, token: shared.token });
} 