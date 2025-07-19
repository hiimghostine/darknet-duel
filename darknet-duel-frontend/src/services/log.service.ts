import api from './api';

export interface Log {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface GetLogsOptions {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface PaginatedLogsResponse {
  logs: Log[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class LogService {
  async getLogs(options: GetLogsOptions = {}): Promise<PaginatedLogsResponse> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.userId) params.append('userId', options.userId);

    const response = await api.get(`/logs?${params.toString()}`);
    return response.data;
  }

  async getLogById(id: string): Promise<Log> {
    const response = await api.get(`/logs/${id}`);
    return response.data;
  }
}

export const logService = new LogService(); 