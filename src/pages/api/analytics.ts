import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';

type Viewer = { viewerId?: string | null; ipAddress?: string | null; createdAt: Date };
type SharedLink = {
  token: string;
  portfolio: { name: string };
  viewers: Viewer[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Get all shared links for this user
  const sharedLinks = await prisma.sharedPortfolioAccess.findMany({
    where: { createdById: user.id, revoked: false },
    include: { viewers: true, portfolio: true },
  });

  // For each, count total and unique viewers (by IP or viewerId)
  const analytics = sharedLinks.map((link: SharedLink) => ({
    token: link.token,
    portfolioName: link.portfolio.name,
    viewCount: link.viewers.length,
    uniqueViewers: new Set(link.viewers.map((v: Viewer) => v.viewerId || v.ipAddress)).size,
    lastViewed: link.viewers.length > 0 ? link.viewers[link.viewers.length - 1].createdAt : null,
    link: `/portfolio/${link.token}`,
  }));

  return res.json({ analytics });
} 