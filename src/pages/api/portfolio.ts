import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';

type APILot = {
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  switch (req.method) {
    case 'GET': {
      // Get all portfolios for the user, including lots
      const portfolios = await prisma.portfolio.findMany({
        where: { userId: user.id },
        include: { lots: true },
      });
      return res.json(portfolios);
    }
    case 'POST': {
      // Create a new portfolio with lots
      const { name, cash, visibility, lots } = req.body;
      // Validate lots
      if (Array.isArray(lots)) {
        for (const l of lots) {
          if (typeof l.pricePaid !== 'number' || l.pricePaid <= 0) {
            return res.status(400).json({ error: `Price for ${l.ticker} must be greater than zero.` });
          }
          if (l.date) {
            const lotDate = new Date(l.date);
            const now = new Date();
            if (lotDate > now) {
              return res.status(400).json({ error: `Date for ${l.ticker} cannot be in the future.` });
            }
          }
        }
      }
      const portfolio = await prisma.portfolio.create({
        data: {
          name,
          cash: cash ?? 0,
          visibility: visibility ?? 'PRIVATE',
          userId: user.id,
          lots: {
            create: (lots as APILot[] | undefined)?.map((l) => ({
              ticker: l.ticker,
              quantity: l.quantity,
              pricePaid: l.pricePaid,
              date: l.date ? new Date(l.date) : undefined,
            })) || [],
          },
        },
        include: { lots: true },
      });
      return res.status(201).json(portfolio);
    }
    case 'PUT': {
      // Update an existing portfolio and its lots
      const { id, name, cash, visibility, lots } = req.body;
      if (!id) return res.status(400).json({ error: 'Portfolio ID required' });
      // Validate lots
      if (Array.isArray(lots)) {
        for (const l of lots) {
          if (typeof l.pricePaid !== 'number' || l.pricePaid <= 0) {
            return res.status(400).json({ error: `Price for ${l.ticker} must be greater than zero.` });
          }
          if (l.date) {
            const lotDate = new Date(l.date);
            const now = new Date();
            if (lotDate > now) {
              return res.status(400).json({ error: `Date for ${l.ticker} cannot be in the future.` });
            }
          }
        }
      }
      // Update portfolio fields
      await prisma.portfolio.update({
        where: { id },
        data: {
          name,
          cash,
          visibility,
        },
      });
      // Update lots (delete all and recreate for simplicity)
      if (Array.isArray(lots)) {
        await prisma.lot.deleteMany({ where: { portfolioId: id } });
        await prisma.lot.createMany({
          data: (lots as APILot[]).map((l) => ({
            portfolioId: id,
            ticker: l.ticker,
            quantity: l.quantity,
            pricePaid: l.pricePaid,
            date: l.date ? new Date(l.date) : undefined,
          })),
        });
      }
      const portfolio = await prisma.portfolio.findUnique({
        where: { id },
        include: { lots: true },
      });
      return res.json(portfolio);
    }
    case 'DELETE': {
      // Delete a portfolio and its lots and all related share links and analytics
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Portfolio ID required' });
      // Delete all lots
      await prisma.lot.deleteMany({ where: { portfolioId: id } });
      // Find all shared access records for this portfolio
      const sharedAccesses = await prisma.sharedPortfolioAccess.findMany({ where: { portfolioId: id } });
      // Delete all token access logs for these shared accesses
      const sharedAccessIds = sharedAccesses.map(sa => sa.id);
      if (sharedAccessIds.length > 0) {
        await prisma.tokenAccessLog.deleteMany({ where: { sharedAccessId: { in: sharedAccessIds } } });
      }
      // Delete all shared access records for this portfolio
      await prisma.sharedPortfolioAccess.deleteMany({ where: { portfolioId: id } });
      // Delete the portfolio itself
      await prisma.portfolio.delete({ where: { id } });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
} 