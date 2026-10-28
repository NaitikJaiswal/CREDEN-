import { Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { seedDatabase } from '../seed/seed.js';

export class DemoController {
  static getAccounts(req: Request, res: Response): void {
    const accounts = [
      {
        role: 'AICTE_ADMIN',
        roleTitle: 'AICTE National Administrator',
        email: 'aicte.admin@creden.gov.in',
        password: 'Admin@Creden2026',
        scope: 'National Academic Governance Oversight, All Institutions, Cross-Institution Duplicate Review',
      },
      {
        role: 'INSTITUTION_ADMIN',
        roleTitle: 'COEP Tech University Administrator',
        email: 'admin@coep.ac.in',
        password: 'Inst@Creden2026',
        scope: 'Institution-Isolated Data Submission, Intake Capacity Monitoring, Record Correction',
      },
      {
        role: 'STUDENT',
        roleTitle: 'Student (Aarav Sharma)',
        email: 'student.aarav@creden.demo',
        password: 'Student@Creden2026',
        scope: 'Academic Profile Verification, APAAR ID Status, Consent Management',
      },
      {
        role: 'VERIFIER',
        roleTitle: 'Authorized Employer / Verifier',
        email: 'verifier@infosys.demo',
        password: 'Verify@Creden2026',
        scope: 'Limited Credential Claim Verification via Token & QR Code',
      },
    ];

    res.json({
      success: true,
      demoMode: true,
      accounts,
      banner: 'CREDEN SIH Prototype Demonstration Environment — All Data is Synthetic',
    });
  }

  static async resetData(req: Request, res: Response): Promise<void> {
    try {
      dbStore.clear();
      await seedDatabase();
      res.json({
        success: true,
        message: 'CREDEN demonstration database successfully reset and re-seeded with 12 institutions and ~1,500 synthetic records.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static getScenarioSteps(req: Request, res: Response): void {
    const scenario = {
      title: 'From Fragmented Records to Trusted Academic Data',
      objective: 'Interactive 10-step demonstration workflow for Smart India Hackathon jury',
      steps: [
        {
          step: 1,
          title: 'Institution Data Submission',
          actor: 'Institution Administrator (admin@coep.ac.in)',
          action: 'Upload synthetic student intake CSV/XLSX with academic & APAAR details.',
          route: '/students/upload',
        },
        {
          step: 2,
          title: 'APAAR Multi-Layer Validation',
          actor: 'Validation Engine',
          action: 'Execute Layer 1 format checks, Layer 2 local duplicate analysis, and Layer 3 authoritative adapter verification.',
          route: '/validation',
        },
        {
          step: 3,
          title: 'Detect Inconsistencies & Malformed Identifiers',
          actor: 'System / Institution Officer',
          action: 'Examine flagged records (missing APAAR, malformed digits, name mismatches).',
          route: '/validation',
        },
        {
          step: 4,
          title: 'Intake Capacity & Excess Enrolment Monitoring',
          actor: 'Institution Administrator',
          action: 'Review intake utilization gauges and red alert indicators on over-admitted programmes.',
          route: '/admissions',
        },
        {
          step: 5,
          title: 'Investigate Cross-Institution Concurrency',
          actor: 'AICTE Administrator (aicte.admin@creden.gov.in)',
          action: 'Open Rule C concurrency finding; review evidence without jumping to fraudulent accusations.',
          route: '/validation',
        },
        {
          step: 6,
          title: 'Correct Record at Source',
          actor: 'Institution Administrator',
          action: 'Fix typographic error in student profile; observe automated status resolution.',
          route: '/students',
        },
        {
          step: 7,
          title: 'Real-Time National Analytics Update',
          actor: 'AICTE Administrator',
          action: 'Verify that national KPIs, pass rates, and regional statistics dynamically refresh from DB.',
          route: '/dashboard',
        },
        {
          step: 8,
          title: 'Authorized Verification Request',
          actor: 'Authorized Verifier (verifier@infosys.demo)',
          action: 'Request background check on candidate degree claim using random high-entropy token.',
          route: '/verification',
        },
        {
          step: 9,
          title: 'Controlled Claim Verification & QR Code Proof',
          actor: 'Verifier / Student',
          action: 'View minimal necessary verified claims without exposing raw private identifiers.',
          route: '/verification',
        },
        {
          step: 10,
          title: 'Comprehensive Audit Trail Review',
          actor: 'AICTE Auditor',
          action: 'Trace all submission, validation, review, and verification actions with immutable correlation IDs.',
          route: '/audit-logs',
        },
      ],
    };

    res.json({ success: true, scenario });
  }
}

