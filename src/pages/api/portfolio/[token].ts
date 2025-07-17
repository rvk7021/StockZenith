import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (typeof token !== 'string') return res.status(400).json({ error: 'Invalid token' });

  // Find the shared access record
  const shared = await prisma.sharedPortfolioAccess.findUnique({
    where: { token },
    include: {
      portfolio: {
        include: { lots: true, user: { select: { name: true } } },
      },
    },
  });
  if (!shared || shared.revoked) return res.status(404).json({ error: 'Not found or revoked' });

  // Log anonymous access (basic, by IP)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  await prisma.tokenAccessLog.create({
    data: {
      sharedAccessId: shared.id,
      viewerType: 'ANONYMOUS',
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      userAgent: req.headers['user-agent'] || '',
    },
  });

  return res.json({
    portfolio: shared.portfolio,
    sharedBy: shared.portfolio.user?.name || 'Anonymous',
    shared,
  });
} 