import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { dbStore } from '../db/store.js';
import { seedDatabase } from '../seed/seed.js';
import { ApaarValidationService } from '../services/apaar/apaarValidationService.js';
import { DuplicateDetectionService } from '../services/validation/duplicateDetectionService.js';
import { IntakeMonitoringService } from '../services/enrolment/intakeMonitoringService.js';

beforeAll(async () => {
  dbStore.clear();
  await seedDatabase();
});

describe('CREDEN Health & Discovery API', () => {
  it('GET /api/v1/health should return healthy status and product identity', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.product).toContain('CREDEN');
  });

  it('GET /api/v1/demo/accounts should return pre-configured demonstration role credentials', async () => {
    const res = await request(app).get('/api/v1/demo/accounts');
    expect(res.status).toBe(200);
    expect(res.body.accounts).toHaveLength(4);
    const roles = res.body.accounts.map((a: any) => a.role);
    expect(roles).toContain('AICTE_ADMIN');
    expect(roles).toContain('INSTITUTION_ADMIN');
    expect(roles).toContain('STUDENT');
    expect(roles).toContain('VERIFIER');
  });
});

describe('Authentication & Role Access Control', () => {
  it('POST /api/v1/auth/demo-login should generate a valid JWT for AICTE Administrator', async () => {
    const res = await request(app)
      .post('/api/v1/auth/demo-login')
      .send({ role: 'AICTE_ADMIN' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.roles).toContain('AICTE_ADMIN');
  });

  it('GET /api/v1/dashboard/overview should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/dashboard/overview');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/dashboard/overview should return live calculated KPIs with JWT', async () => {
    const login = await request(app)
      .post('/api/v1/auth/demo-login')
      .send({ role: 'AICTE_ADMIN' });

    const token = login.body.token;

    const res = await request(app)
      .get('/api/v1/dashboard/overview')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.kpis.totalInstitutions.value).toBe(12);
    expect(res.body.kpis.totalStudentRecords.value).toBeGreaterThan(1000);
    expect(res.body.intakeSummary).toBeDefined();
    expect(res.body.issueDistribution.length).toBeGreaterThan(0);
  });
});

describe('APAAR Validation Engine Unit Logic', () => {
  it('Validates 12-digit numeric APAAR ID format correctly', () => {
    const valid = ApaarValidationService.validateFormat('987654321012');
    expect(valid.isValidFormat).toBe(true);
    expect(valid.maskedId).toBe('•••• •••• 1012');
  });

  it('Detects missing or empty APAAR IDs', () => {
    const missing = ApaarValidationService.validateFormat('');
    expect(missing.isValidFormat).toBe(false);
    expect(missing.error).toContain('missing');
  });

  it('Detects malformed identifiers with letters or non-12-digit length', () => {
    const malformed = ApaarValidationService.validateFormat('12345ABC');
    expect(malformed.isValidFormat).toBe(false);
    expect(malformed.error).toContain('Malformed identifier');
  });

  it('Simulates Authoritative Adapter status fixtures', async () => {
    const normal = await ApaarValidationService.validateWithAuthoritativeAdapter('111122223333', 'Aarav Sharma');
    expect(normal.status).toBe('VERIFIED');

    const invalid = await ApaarValidationService.validateWithAuthoritativeAdapter('111122229999', 'Test Student');
    expect(invalid.status).toBe('INVALID');
  });
});

describe('Intelligent Duplicate & Intake Monitoring Services', () => {
  it('Intake monitoring calculates utilization percentage and detects excess capacity', () => {
    const intake = {
      id: 'INT-TEST',
      institutionId: 'INST-001',
      programmeCode: 'BTECH-CSE',
      programmeName: 'B.Tech CSE',
      academicYear: '2025-2026',
      approvedSeatCount: 100,
      maxSupernumeraryPercent: 15,
      nriQuotaMax: 5,
      policyVersion: '1.0',
      effectiveFrom: '2025-06-01',
      sourceReference: 'REF',
    };

    const mockEnrolments: any[] = Array.from({ length: 110 }).map((_, idx) => ({
      id: `E-${idx}`,
      institutionId: 'INST-001',
      programmeCode: 'BTECH-CSE',
      academicYear: '2025-2026',
      enrolmentStatus: 'ACTIVE',
      supernumeraryCategory: 'NONE',
    }));

    const result = IntakeMonitoringService.calculateUtilization(intake, mockEnrolments);
    expect(result.utilizationPercentage).toBe(110);
    expect(result.status).toBe('EXCESS_ENROLMENT');
    expect(result.isViolation).toBe(true);
  });
});

describe('Secure Academic Verification Flow', () => {
  it('Generates a limited verification result without exposing private records', async () => {
    // 1. Authenticate as verifier
    const login = await request(app)
      .post('/api/v1/auth/demo-login')
      .send({ role: 'VERIFIER' });

    const token = login.body.token;

    // 2. Issue a verification request for Aarav Sharma (ENR-0001)
    const issueRes = await request(app)
      .post('/api/v1/verification/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: 'ENR-0001',
        requesterOrg: 'Global Tech Corp',
        requesterEmail: 'hr@globaltech.com',
      });

    expect(issueRes.status).toBe(200);
    expect(issueRes.body.rawToken).toBeDefined();
    expect(issueRes.body.qrCodeDataUrl).toContain('data:image/png;base64');

    // 3. Resolve the claim verification using the raw token
    const verifyRes = await request(app)
      .get(`/api/v1/verification/verify?token=${issueRes.body.rawToken}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.verificationStatus).toBe('VERIFIED');
    expect(verifyRes.body.academicRecord.programmeName).toContain('Computer Science');
    expect(verifyRes.body.academicRecord.studentMaskedId).toContain('••••');
    expect(verifyRes.body.integrityProof.issuerVerified).toBe(true);
  });
});

