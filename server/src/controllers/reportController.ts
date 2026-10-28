import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import { IntakeMonitoringService } from '../services/enrolment/intakeMonitoringService.js';

export class ReportController {
  static async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { type = 'INTAKE_UTILIZATION', academicYear, state } = req.query;

    let enrolments = [...dbStore.enrolments];
    let intakes = [...dbStore.approvedIntakes];
    let institutions = [...dbStore.institutions];
    let issues = [...dbStore.validationIssues];

    if (academicYear) {
      enrolments = enrolments.filter((e) => e.academicYear === academicYear);
      intakes = intakes.filter((i) => i.academicYear === academicYear);
    }
    if (state) {
      const stateInstIds = institutions
        .filter((i) => i.state.toLowerCase() === String(state).toLowerCase())
        .map((i) => i.id);
      enrolments = enrolments.filter((e) => stateInstIds.includes(e.institutionId));
      intakes = intakes.filter((i) => stateInstIds.includes(i.institutionId));
      institutions = institutions.filter((i) => i.state.toLowerCase() === String(state).toLowerCase());
    }

    // 1. Intake Utilization Report
    const intakeReport = intakes.map((intake) => {
      const inst = institutions.find((i) => i.id === intake.institutionId);
      const analysis = IntakeMonitoringService.calculateUtilization(intake, enrolments);
      return {
        ...analysis,
        institutionName: inst?.name || 'Institution',
        institutionCode: inst?.institutionCode || 'N/A',
        state: inst?.state || 'N/A',
      };
    });

    // 2. Year-over-Year Comparison
    const year2024Enrolments = dbStore.enrolments.filter((e) => e.academicYear === '2024-2025').length;
    const year2025Enrolments = dbStore.enrolments.filter((e) => e.academicYear === '2025-2026').length;

    // 3. Supernumerary & Quota Breakdown
    const supernumeraryStats = {
      tfw: enrolments.filter((e) => e.supernumeraryCategory === 'TFW').length,
      ewsSupernumerary: enrolments.filter((e) => e.supernumeraryCategory === 'EWS_SUPERNUMERARY').length,
      pmsss: enrolments.filter((e) => e.supernumeraryCategory === 'PMSSS').length,
      nri: enrolments.filter((e) => e.nriStatus).length,
      oci: enrolments.filter((e) => e.ociStatus).length,
      foreignNational: enrolments.filter((e) => e.foreignNationalStatus).length,
    };

    // 4. Data Quality & Compliance Scores
    const validCount = enrolments.filter((e) => e.validationStatus === 'VALID').length;
    const averageQualityScore = enrolments.length > 0
      ? Math.round(enrolments.reduce((sum, e) => sum + e.validationScore, 0) / enrolments.length)
      : 92;

    // 5. Simulated Enrolment Forecasting (Explainable SIH Demo Feature)
    const simulatedForecast = [
      { year: '2023-2024', actual: 1180, projected: 1180, confidence: 'Historical' },
      { year: '2024-2025', actual: 1320, projected: 1320, confidence: 'Historical' },
      { year: '2025-2026', actual: 1495, projected: 1480, confidence: 'Current Cycle' },
      { year: '2026-2027', actual: null, projected: 1650, confidence: 'Projected (ARIMA/Simulated)' },
      { year: '2027-2028', actual: null, projected: 1810, confidence: 'Projected (ARIMA/Simulated)' },
    ];

    res.json({
      success: true,
      reportType: type,
      generatedAt: new Date().toISOString(),
      filters: { academicYear, state },
      intakeReport,
      yearComparison: {
        '2024-2025': year2024Enrolments,
        '2025-2026': year2025Enrolments,
        growthPercentage: year2024Enrolments > 0
          ? Math.round(((year2025Enrolments - year2024Enrolments) / year2024Enrolments) * 100)
          : 0,
      },
      supernumeraryStats,
      dataQuality: {
        averageScore: averageQualityScore,
        validRecords: validCount,
        totalRecords: enrolments.length,
        anomaliesCount: issues.length,
      },
      simulatedForecast: {
        methodology: 'Simulated 3-Year Rolling Average with 10.5% Regional Demographic Expansion Factor',
        disclaimer: 'SIMULATED FORECAST ONLY — For SIH prototype strategic policy planning demonstration.',
        data: simulatedForecast,
      },
    });
  }

  /**
   * Policy Simulation Feature (Section 26 Feature E)
   * Simulates effect of changing intake warning thresholds (e.g. 75% vs 85% vs 95%)
   */
  static simulatePolicy(req: AuthenticatedRequest, res: Response): void {
    const { warningThreshold = 80, excessThreshold = 100 } = req.body;

    const thresholdNum = Number(warningThreshold);
    const excessNum = Number(excessThreshold);

    const intakes = dbStore.approvedIntakes;
    const enrolments = dbStore.enrolments;

    let nearCapacityCount = 0;
    let excessCount = 0;
    let normalCount = 0;

    for (const intake of intakes) {
      const activeEnrolled = enrolments.filter(
        (e) =>
          e.institutionId === intake.institutionId &&
          e.programmeCode === intake.programmeCode &&
          e.academicYear === intake.academicYear &&
          e.enrolmentStatus === 'ACTIVE'
      ).length;

      const util = intake.approvedSeatCount > 0 ? (activeEnrolled / intake.approvedSeatCount) * 100 : 0;

      if (util > excessNum) {
        excessCount++;
      } else if (util >= thresholdNum) {
        nearCapacityCount++;
      } else {
        normalCount++;
      }
    }

    res.json({
      success: true,
      simulationParams: { warningThreshold: thresholdNum, excessThreshold: excessNum },
      results: {
        programmesEvaluated: intakes.length,
        normalCount,
        nearCapacityCount,
        excessCount,
        impactAnalysis: `Setting warning threshold to ${thresholdNum}% flags ${nearCapacityCount} programmes for early supervisory review, while excess threshold ${excessNum}% detects ${excessCount} intake anomalies.`,
      },
    });
  }
}

