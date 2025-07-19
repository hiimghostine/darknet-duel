import { Request, Response } from 'express';
import { ReportService, CreateReportData } from '../services/report.service';
import { ReportType, ReportStatus } from '../entities/report.entity';

export class ReportController {
  private reportService = new ReportService();

  /**
   * @swagger
   * /api/reports:
   *   post:
   *     tags: [Reports]
   *     summary: Create a new report
   *     description: Create a report for a user or chat message
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [reporteeId, reason, reportType]
   *             properties:
   *               reporteeId:
   *                 type: string
   *                 format: uuid
   *                 description: ID of the user being reported
   *               reason:
   *                 type: string
   *                 maxLength: 500
   *                 description: Reason for the report
   *               content:
   *                 type: string
   *                 description: Content of the reported message (optional for profile reports)
   *               reportType:
   *                 type: string
   *                 enum: [profile, chat]
   *                 description: Type of report
   *     responses:
   *       201:
   *         description: Report created successfully
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  createReport = async (req: Request, res: Response) => {
    try {
      const { reporteeId, reason, content, reportType } = req.body;
      const reporterId = req.user?.id;

      if (!reporterId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!reporteeId || !reason || !reportType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: reporteeId, reason, reportType'
        });
      }

      if (!Object.values(ReportType).includes(reportType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
      }

      if (reporterId === reporteeId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot report yourself'
        });
      }

      const reportData: CreateReportData = {
        reporterId,
        reporteeId,
        reason,
        content,
        reportType
      };

      const report = await this.reportService.createReport(reportData);

      return res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: {
          id: report.id,
          status: report.status,
          createdAt: report.createdAt
        }
      });
    } catch (error) {
      console.error('Create report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create report',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/reports:
   *   get:
   *     tags: [Admin]
   *     summary: Get reports for admin review
   *     description: Retrieve paginated list of reports with filtering options
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of reports per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, reviewed, resolved, dismissed]
   *         description: Filter by report status
   *       - in: query
   *         name: reportType
   *         schema:
   *           type: string
   *           enum: [profile, chat]
   *         description: Filter by report type
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in reporter/reportee usernames or reason
   *     responses:
   *       200:
   *         description: Reports retrieved successfully
   *       401:
   *         description: Unauthorized - not an admin
   *       500:
   *         description: Internal server error
   */
  getReports = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const status = req.query.status as ReportStatus;
      const reportType = req.query.reportType as ReportType;
      const search = req.query.search as string;

      const result = await this.reportService.getReports({
        page,
        limit,
        status,
        reportType,
        search
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get reports error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve reports',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/reports/{id}:
   *   get:
   *     tags: [Admin]
   *     summary: Get detailed report information
   *     description: Get comprehensive report details including user information
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Report ID
   *     responses:
   *       200:
   *         description: Report details retrieved successfully
   *       404:
   *         description: Report not found
   *       401:
   *         description: Unauthorized - not an admin
   */
  getReportById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const report = await this.reportService.getReportById(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get report by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve report details',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/reports/{id}/status:
   *   put:
   *     tags: [Admin]
   *     summary: Update report status
   *     description: Update the status of a report (reviewed, resolved, dismissed)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Report ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, reviewed, resolved, dismissed]
   *                 description: New status for the report
   *     responses:
   *       200:
   *         description: Report status updated successfully
   *       400:
   *         description: Invalid status
   *       404:
   *         description: Report not found
   *       401:
   *         description: Unauthorized - not an admin
   */
  updateReportStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(ReportStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const adminId = req.user?.id;
      const report = await this.reportService.updateReportStatus(id, status, adminId!);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Report status updated successfully',
        data: {
          id: report.id,
          status: report.status,
          updatedAt: report.updatedAt
        }
      });
    } catch (error) {
      console.error('Update report status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update report status',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/reports/{id}:
   *   delete:
   *     tags: [Admin]
   *     summary: Delete a report
   *     description: Permanently delete a report
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Report ID
   *     responses:
   *       200:
   *         description: Report deleted successfully
   *       404:
   *         description: Report not found
   *       401:
   *         description: Unauthorized - not an admin
   */
  deleteReport = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const adminId = req.user?.id;
      const deleted = await this.reportService.deleteReport(id, adminId!);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete report',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/admin/reports/stats:
   *   get:
   *     tags: [Admin]
   *     summary: Get report statistics
   *     description: Get report statistics for admin dashboard
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Report statistics retrieved successfully
   *       401:
   *         description: Unauthorized - not an admin
   */
  getReportStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.reportService.getReportStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get report stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve report statistics',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
} 