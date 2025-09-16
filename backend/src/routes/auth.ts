import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Demo login schema
const demoLoginSchema = z.object({
  email: z.string().email().optional()
});

// Demo login endpoint
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    // For demo, we'll use a predefined demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });

    if (!demoUser) {
      return res.status(404).json({ error: 'Demo user not found. Please run database seed.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: demoUser.id, email: demoUser.email, role: demoUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user endpoint
router.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/* 
// Magic link authentication (commented out for demo)
// Uncomment and configure when SMTP is available

const magicLinkSchema = z.object({
  email: z.string().email()
});

router.post('/magic-link', async (req: Request, res: Response) => {
  try {
    const { email } = magicLinkSchema.parse(req.body);
    
    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, role: 'user' }
      });
    }

    // Generate magic link token
    const token = jwt.sign(
      { userId: user.id, email: user.email, type: 'magic-link' },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    // TODO: Send email with magic link
    // await sendMagicLinkEmail(email, magicLink);

    res.json({ 
      success: true, 
      message: 'Magic link sent to your email',
      // For demo purposes, return the link
      ...(process.env.NODE_ENV === 'development' && { magicLink })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-magic-link', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'magic-link') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate session token
    const sessionToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});
*/

export default router;
