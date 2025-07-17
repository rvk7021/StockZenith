import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      name: email.split('@')[0],
      password: hashed,
    },
  });
  return res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email, name: newUser.name } });
} 