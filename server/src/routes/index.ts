import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/authController.js';
import { DashboardController } from '../controllers/dashboardController.js';
import { InstitutionController } from '../controllers/institutionController.js';
import { StudentController } from '../controllers/studentController.js';
import { UploadController } from '../controllers/uploadController.js';
import { ValidationController } from '../controllers/validationController.js';
import { VerificationController } from '../controllers/verificationController.js';
import { ReportController } from '../controllers/reportController.js';
import { AuditController } from '../controllers/auditController.js';
import { DemoController } from '../controllers/demoController.js';
import { authenticate, authorizeRoles, enforceInstitutionScope } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// 1. Auth & Demo Identity Routes
router.post('/auth/login', AuthController.login);
router.post('/auth/demo-login', AuthController.demoLogin);
router.get('/auth/me', authenticate, AuthController.me);
router.post('/auth/logout', authenticate, AuthController.logout);

// 2. Dashboard
router.get('/dashboard/overview', authenticate, DashboardController.getOverview);

// 3. Institutions
router.get('/institutions', authenticate, InstitutionController.getAll);
router.get('/institutions/:id', authenticate, enforceInstitutionScope, InstitutionController.getById);

// 4. Students
router.get('/students', authenticate, StudentController.getAll);
router.get('/students/export', authenticate, StudentController.exportCsv);
router.get('/students/:id', authenticate, StudentController.getById);
router.patch('/students/:id', authenticate, authorizeRoles('AICTE_ADMIN', 'INSTITUTION_ADMIN'), StudentController.update);

// 5. Bulk Upload & Validation Engine
router.get('/upload/template', authenticate, UploadController.downloadTemplate);
router.post(
  '/students/bulk-upload',
  authenticate,
  authorizeRoles('AICTE_ADMIN', 'INSTITUTION_ADMIN'),
  upload.single('file'),
  UploadController.processBulkUpload
);
router.get('/imports/:batchId/errors', authenticate, UploadController.downloadErrorReport);

// 6. Validation Review Center
router.get('/validation/issues', authenticate, ValidationController.getIssues);
router.post(
  '/validation/issues/:id/review',
  authenticate,
  authorizeRoles('AICTE_ADMIN', 'INSTITUTION_ADMIN'),
  ValidationController.reviewIssue
);

// 7. Secure Academic Verification
router.post('/verification/requests', authenticate, VerificationController.createRequest);
router.get('/verification/verify', VerificationController.verify); // Public or token-authorized verification

// 8. Analytics & Policy Simulation
router.get('/reports', authenticate, ReportController.getReports);
router.post('/reports/simulate-policy', authenticate, authorizeRoles('AICTE_ADMIN'), ReportController.simulatePolicy);

// 9. Audit Logs
router.get('/audit-logs', authenticate, authorizeRoles('AICTE_ADMIN', 'INSTITUTION_ADMIN'), AuditController.getLogs);

// 10. Demo & Hackathon Utilities
router.get('/demo/accounts', DemoController.getAccounts);
router.post('/demo/reset', DemoController.resetData);
router.get('/demo/scenario', DemoController.getScenarioSteps);

// 11. Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'CREDEN — Student Identity, Verification and Academic Governance Platform',
    version: '1.0.0-sih-prototype',
    timestamp: new Date().toISOString(),
  });
});

export default router;

