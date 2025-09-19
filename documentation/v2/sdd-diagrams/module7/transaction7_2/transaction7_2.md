# Transaction 7.2: Report Management (Submit, Review, Resolve)

## User Interface Design
- Players can submit reports about inappropriate behavior or issues (profile or chat)
- Admins/moderators can review, filter, and search reports
- Reports display reporter, reportee, reason, type, status, and timestamps
- Admins/moderators can update report status (reviewed, resolved, dismissed), delete reports, and ban users from reports
- UI provides feedback for all actions (success/error)
- Pagination and filtering for large report lists
- Responsive, admin-themed UI

## Frontend Components
1. **ReportModal** (Modal Component)
   - Allows players to submit a report with reason and details
   - File: `src/components/ReportModal.tsx`
2. **ReportManagementPage** (React Page Component)
   - Admin/moderator page for reviewing, updating, and deleting reports, and banning users
   - File: `src/pages/ReportManagementPage.tsx`
3. **reportService** (Service Module)
   - Handles API calls for submitting, fetching, updating, and deleting reports
   - File: `src/services/report.service.ts`
4. **adminService** (Service Module)
   - Used for banning users from reports
   - File: `src/services/admin.service.ts`
5. **useAuthStore** (Zustand Store)
   - Provides authentication and user info, including role/type
   - File: `src/store/auth.store.ts`

## Backend Components
1. **ReportController** (Express Controller)
   - Handles REST API requests for report submission, review, update, and deletion
   - Endpoints:
     - `POST /api/reports` — Submit a report
     - `GET /api/admin/reports` — Get reports for admin review
     - `GET /api/admin/reports/{id}` — Get detailed report info
     - `PUT /api/admin/reports/{id}/status` — Update report status
     - `DELETE /api/admin/reports/{id}` — Delete a report
     - `GET /api/admin/reports/stats` — Get report statistics
2. **ReportService** (Service Class)
   - Implements report logic: create, fetch, update, delete, log actions
   - Methods: `createReport`, `getReports`, `getReportById`, `updateReportStatus`, `deleteReport`, `getReportStats`
3. **Report Entity**
   - Stores report data (reporter, reportee, reason, type, status, etc.)
   - File: `src/entities/report.entity.ts`
4. **LogService** (Service Class)
   - Logs report status changes and actions
   - File: `src/services/log.service.ts`

## Endpoints
- **REST API**
  - `POST /api/reports` — Submit a report
  - `GET /api/admin/reports` — Get reports for admin review
  - `GET /api/admin/reports/{id}` — Get detailed report info
  - `PUT /api/admin/reports/{id}/status` — Update report status
  - `DELETE /api/admin/reports/{id}` — Delete a report
  - `GET /api/admin/reports/stats` — Get report statistics

## Sequence Overview
1. Player submits a report via ReportModal; frontend calls `POST /api/reports`
2. Backend records the report and sets status to pending
3. Admin/moderator reviews reports via ReportManagementPage; frontend calls `GET /api/admin/reports`
4. Admin/mod updates report status or deletes report; frontend calls `PUT /api/admin/reports/{id}/status` or `DELETE /api/admin/reports/{id}`
5. Backend updates report, logs action, and returns result
6. Frontend updates UI and provides feedback 