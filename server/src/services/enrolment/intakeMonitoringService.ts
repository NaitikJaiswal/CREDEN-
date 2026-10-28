import { IApprovedIntake, IEnrolment } from '../../types/index.js';

export interface IntakeAnalysisResult {
  programmeCode: string;
  programmeName: string;
  academicYear: string;
  approvedSeatCount: number;
  regularEnrolled: number;
  supernumeraryEnrolled: number;
  nriEnrolled: number;
  foreignNationalEnrolled: number;
  totalEnrolled: number;
  effectiveIntakeCap: number;
  remainingCapacity: number;
  utilizationPercentage: number;
  status: 'NORMAL' | 'NEAR_CAPACITY' | 'EXCESS_ENROLMENT';
  statusColor: 'green' | 'amber' | 'red';
  isViolation: boolean;
  notes: string;
}

export class IntakeMonitoringService {
  /**
   * Evaluates institutional enrolment against AICTE approved intake orders
   */
  static calculateUtilization(
    intake: IApprovedIntake,
    enrolments: IEnrolment[]
  ): IntakeAnalysisResult {
    // Filter enrolments for this specific programme and academic year
    const relevantEnrolments = enrolments.filter(
      (e) =>
        e.institutionId === intake.institutionId &&
        e.programmeCode === intake.programmeCode &&
        e.academicYear === intake.academicYear &&
        e.enrolmentStatus === 'ACTIVE'
    );

    let regularEnrolled = 0;
    let supernumeraryEnrolled = 0;
    let nriEnrolled = 0;
    let foreignNationalEnrolled = 0;

    for (const record of relevantEnrolments) {
      if (record.supernumeraryCategory && record.supernumeraryCategory !== 'NONE') {
        supernumeraryEnrolled++;
      } else if (record.nriStatus || record.ociStatus) {
        nriEnrolled++;
      } else if (record.foreignNationalStatus) {
        foreignNationalEnrolled++;
      } else {
        regularEnrolled++;
      }
    }

    const totalEnrolled = relevantEnrolments.length;
    const approvedSeats = Math.max(1, intake.approvedSeatCount); // Safe division

    // Utilization calculation based on regular approved seats
    const utilizationPercentage = Math.round((regularEnrolled / approvedSeats) * 100 * 10) / 10;
    const remainingCapacity = Math.max(0, approvedSeats - regularEnrolled);

    let status: 'NORMAL' | 'NEAR_CAPACITY' | 'EXCESS_ENROLMENT' = 'NORMAL';
    let statusColor: 'green' | 'amber' | 'red' = 'green';
    let isViolation = false;
    let notes = 'Intake within normal operational limits.';

    if (regularEnrolled > approvedSeats) {
      status = 'EXCESS_ENROLMENT';
      statusColor = 'red';
      isViolation = true;
      notes = `Potential excess enrolment detected: Enrolled (${regularEnrolled}) exceeds AICTE approved intake (${approvedSeats}) by ${regularEnrolled - approvedSeats} seats.`;
    } else if (utilizationPercentage >= 80) {
      status = 'NEAR_CAPACITY';
      statusColor = 'amber';
      notes = `Institution is nearing approved intake capacity (${utilizationPercentage}% utilized). Only ${remainingCapacity} regular seats remaining.`;
    }

    return {
      programmeCode: intake.programmeCode,
      programmeName: intake.programmeName,
      academicYear: intake.academicYear,
      approvedSeatCount: approvedSeats,
      regularEnrolled,
      supernumeraryEnrolled,
      nriEnrolled,
      foreignNationalEnrolled,
      totalEnrolled,
      effectiveIntakeCap: approvedSeats,
      remainingCapacity,
      utilizationPercentage,
      status,
      statusColor,
      isViolation,
      notes,
    };
  }
}

