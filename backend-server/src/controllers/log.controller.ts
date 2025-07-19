import { Request, Response } from 'express';
import { LogService, type GetLogsOptions } from '../services/log.service';

export class LogController {
  private logService = new LogService();

  // Get logs with pagination (admin only)
  async getLogs(req: Request, res: Response) {
    try {
      const { page, limit, userId } = req.query;
      
      const options: GetLogsOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
        userId: userId as string
      };

      const result = await this.logService.getLogs(options);
      
      res.json(result);
    } catch (error) {
      console.error('Error getting logs:', error);
      res.status(500).json({ error: 'Failed to get logs' });
    }
  }

  // Get specific log by ID (admin only)
  async getLogById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const log = await this.logService.getLogById(id);
      
      if (!log) {
        return res.status(404).json({ error: 'Log not found' });
      }
      
      res.json(log);
    } catch (error) {
      console.error('Error getting log:', error);
      res.status(500).json({ error: 'Failed to get log' });
    }
  }

} 