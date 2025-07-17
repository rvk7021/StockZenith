import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Get current user (if authenticated)
  let currentUserId: string | null = null;
  try {
    const session = await getServerSession(req, res, authOptions);
    if (session && session.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) currentUserId = user.id;
    }
  } catch { }

  // Find all public portfolios and their users
  const portfolios = await prisma.portfolio.findMany({
    where: { visibility: 'PUBLIC' },
    select: {
      user: { select: { id: true, name: true } }
    }
  });
  // Deduplicate users and filter out self
  const users = portfolios
    .map(p => p.user)
    .filter((u, i, arr) => u && arr.findIndex(x => x?.id === u.id) === i && u.id !== currentUserId);

  return res.json({ users });
} 