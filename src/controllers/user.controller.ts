import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json({ users });
    } catch (error: any) {
      logger.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
  
  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          tasks: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error: any) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
  
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { username, email, role, isActive } = req.body;
      
      const user = await prisma.user.update({
        where: { id },
        data: { username, email, role, isActive },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
        },
      });
      
      res.json({
        message: 'User updated successfully',
        user,
      });
    } catch (error: any) {
      logger.error('Update user error:', error);
      res.status(400).json({ error: error.message || 'Failed to update user' });
    }
  }
  
  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const isValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      
      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      logger.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
  
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.user.delete({ where: { id } });
      
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      logger.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}