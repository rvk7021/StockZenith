import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  console.log('Revoke request:', { token });
  const shared = await prisma.sharedPortfolioAccess.findUnique({ where: { token } });
  console.log('Found shared:', shared);
  if (!shared) return res.status(404).json({ error: 'Not found' });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || shared.createdById !== user.id) return res.status(403).json({ error: 'Forbidden' });

  try {
    await prisma.sharedPortfolioAccess.update({ where: { token }, data: { revoked: true } });
    const updated = await prisma.sharedPortfolioAccess.findUnique({ where: { token } });
    console.log('After update:', updated);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating revoked status:', err);
    return res.status(500).json({ error: 'Failed to revoke link', details: (err as Error).message });
  }
} 