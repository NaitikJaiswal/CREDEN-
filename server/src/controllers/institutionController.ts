import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import { IntakeMonitoringService } from '../services/enrolment/intakeMonitoringService.js';

export class InstitutionController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { state, type, search } = req.query;

    let list = [...dbStore.institutions];

    if (state) {
      list = list.filter((i) => i.state.toLowerCase() === String(state).toLowerCase());
    }
    if (type) {
      list = list.filter((i) => i.institutionType === type);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.institutionCode.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      total: list.length,
      institutions: list,
    });
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const institution = dbStore.institutions.find((i) => i.id === id || i.institutionCode === id);

    if (!institution) {
      res.status(404).json({ success: false, error: 'Institution not found.' });
      return;
    }

    // Institution specific statistics
    const enrolments = dbStore.enrolments.filter((e) => e.institutionId === institution.id);
    const intakes = dbStore.approvedIntakes.filter((i) => i.institutionId === institution.id);
    const batches = dbStore.importBatches.filter((b) => b.institutionId === institution.id);
    const issues = dbStore.validationIssues.filter((iss) => iss.institutionId === institution.id);

    // Intake breakdown per programme
    const programmeIntakes = intakes.map((intake) => {
      const analysis = IntakeMonitoringService.calculateUtilization(intake, enrolments);
      return analysis;
    });

    const totalApproved = intakes.reduce((sum, i) => sum + i.approvedSeatCount, 0);
    const totalEnrolled = enrolments.filter((e) => e.enrolmentStatus === 'ACTIVE').length;
    const remainingCapacity = Math.max(0, totalApproved - totalEnrolled);

    // Supernumerary counts
    const tfwCount = enrolments.filter((e) => e.supernumeraryCategory === 'TFW').length;
    const ewsCount = enrolments.filter((e) => e.supernumeraryCategory === 'EWS_SUPERNUMERARY').length;
    const pmsssCount = enrolments.filter((e) => e.supernumeraryCategory === 'PMSSS').length;
    const nriCount = enrolments.filter((e) => e.nriStatus).length;
    const ociCount = enrolments.filter((e) => e.ociStatus).length;
    const foreignCount = enrolments.filter((e) => e.foreignNationalStatus).length;

    // Validation breakdown
    const awaitingValidation = enrolments.filter((e) => e.validationStatus === 'REQUIRES_MANUAL_REVIEW').length;
    const requiringCorrection = enrolments.filter(
      (e) => e.validationStatus === 'MALFORMED' || e.validationStatus === 'MISSING' || e.validationStatus === 'DUPLICATE_CANDIDATE'
    ).length;
    const validCount = enrolments.filter((e) => e.validationStatus === 'VALID').length;

    const completionRate = enrolments.length > 0 
      ? Math.round((validCount / enrolments.length) * 100) 
      : 0;

    res.json({
      success: true,
      institution,
      metrics: {
        approvedIntake: totalApproved,
        actualEnrolment: totalEnrolled,
        remainingCapacity,
        utilizationPercentage: totalApproved > 0 ? Math.round((totalEnrolled / totalApproved) * 100) : 0,
        supernumerary: {
          tfw: tfwCount,
          ewsSupernumerary: ewsCount,
          pmsss: pmsssCount,
          total: tfwCount + ewsCount + pmsssCount,
        },
        internationalCategories: {
          nri: nriCount,
          oci: ociCount,
          foreignNational: foreignCount,
        },
        recordsAwaitingValidation: awaitingValidation,
        recordsRequiringCorrection: requiringCorrection,
        submissionCompletionPercentage: completionRate,
      },
      programmeIntakes,
      recentBatches: batches.slice(-5).reverse(),
      activeIssues: issues.filter((iss) => iss.reviewStatus !== 'RESOLVED').slice(0, 10),
    });
  }
}

