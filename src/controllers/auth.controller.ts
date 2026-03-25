import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import logger from '../lib/logger';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: validatedData.email },
            { username: validatedData.username }
          ]
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email or username already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
        }
      });
      
      const token = generateToken(user.id, user.email, user.role);
      
      res.status(201).json({
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }
  
  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is disabled' });
      }
      
      const token = generateToken(user.id, user.email, user.role);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(400).json({ error: error.message || 'Login failed' });
    }
  }
  
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error: any) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
}