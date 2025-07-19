import api from './api';

export interface CreateReportData {
  reporteeId: string;
  reason: string;
  content?: string;
  reportType: 'profile' | 'chat';
}

export interface Report {
  id: string;
  reporterId: string;
  reporteeId: string;
  reason: string;
  content: string | null;
  reportType: 'profile' | 'chat';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    username: string;
    email: string;
  };
  reportee: {
    id: string;
    username: string;
    email: string;
  };
}

export interface GetReportsOptions {
  page?: number;
  limit?: number;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reportType?: 'profile' | 'chat';
  search?: string;
}

export interface ReportsResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  profileReports: number;
  chatReports: number;
}

class ReportService {
  /**
   * Create a new report
   */
  async createReport(data: CreateReportData): Promise<{ id: string; status: string; createdAt: string }> {
    const response = await api.post('/reports', data);
    return response.data.data;
  }

  /**
   * Get reports for admin review
   */
  async getReports(options: GetReportsOptions = {}): Promise<ReportsResponse> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.status) params.append('status', options.status);
    if (options.reportType) params.append('reportType', options.reportType);
    if (options.search) params.append('search', options.search);

    const response = await api.get(`/reports/admin?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Get a single report by ID
   */
  async getReportById(id: string): Promise<Report> {
    const response = await api.get(`/reports/admin/${id}`);
    return response.data.data;
  }

  /**
   * Update report status
   */
  async updateReportStatus(id: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'): Promise<{ id: string; status: string; updatedAt: string }> {
    const response = await api.put(`/reports/admin/${id}/status`, { status });
    return response.data.data;
  }

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/admin/${id}`);
  }

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<ReportStats> {
    const response = await api.get('/reports/admin/stats');
    return response.data.data;
  }
}

export const reportService = new ReportService(); 