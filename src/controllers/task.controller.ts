import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';
import logger from '../lib/logger';
import { AuthRequest } from '../middleware/auth';

export class TaskController {
  async createTask(req: AuthRequest, res: Response) {
    try {
      const validatedData = createTaskSchema.parse(req.body);
      const userId = req.user!.id;
      
      const task = await prisma.task.create({
        data: {
          ...validatedData,
          userId,
        }
      });
      
      res.status(201).json({
        message: 'Task created successfully',
        task,
      });
    } catch (error: any) {
      logger.error('Create task error:', error);
      res.status(400).json({ error: error.message || 'Failed to create task' });
    }
  }
  
  async getTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, priority, page = '1', limit = '10' } = req.query;
      
      const where: any = { userId };
      if (status) where.status = status;
      if (priority) where.priority = priority;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);
      
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.task.count({ where }),
      ]);
      
      res.json({
        tasks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      logger.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
  
  async getTaskById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const task = await prisma.task.findFirst({
        where: { id, userId }
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json({ task });
    } catch (error: any) {
      logger.error('Get task error:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }
  
  async updateTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const validatedData = updateTaskSchema.parse(req.body);
      
      const existingTask = await prisma.task.findFirst({
        where: { id, userId }
      });
      
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const task = await prisma.task.update({
        where: { id },
        data: validatedData,
      });
      
      res.json({
        message: 'Task updated successfully',
        task,
      });
    } catch (error: any) {
      logger.error('Update task error:', error);
      res.status(400).json({ error: error.message || 'Failed to update task' });
    }
  }
  
  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const existingTask = await prisma.task.findFirst({
        where: { id, userId }
      });
      
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      await prisma.task.delete({ where: { id } });
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error: any) {
      logger.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
  
  async getTaskStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      const [total, completed, pending, inProgress, cancelled] = await Promise.all([
        prisma.task.count({ where: { userId } }),
        prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
        prisma.task.count({ where: { userId, status: 'PENDING' } }),
        prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { userId, status: 'CANCELLED' } }),
      ]);
      
      // Fix: Add proper typing for the groupBy result
      const stats = await prisma.task.groupBy({
        by: ['priority'],
        where: { userId },
        _count: true,
      });
      
      // Type-safe mapping
      interface PriorityStat {
        priority: string;
        count: number;
      }
      
      const priorityStats: PriorityStat[] = stats.map((stat: any) => ({
        priority: stat.priority,
        count: stat._count,
      }));
      
      res.json({
        total,
        completed,
        pending,
        inProgress,
        cancelled,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        priorityStats,
      });
    } catch (error: any) {
      logger.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
}