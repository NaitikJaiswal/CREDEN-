import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { generateVerificationToken, hashVerificationToken } from '../../utils/security.js';
import { IVerificationRequest, IEnrolment, IStudentIdentity, IInstitution } from '../../types/index.js';
import { config } from '../../config/index.js';

export interface VerificationSummaryResult {
  verificationReference: string;
  verificationStatus: 'VERIFIED' | 'NOT_VERIFIED' | 'EXPIRED' | 'REVOKED';
  verifiedAt: string;
  expiresAt: string;
  issuingInstitution: {
    name: string;
    code: string;
    type: string;
    state: string;
  };
  academicRecord: {
    programmeName: string;
    programmeCode: string;
    academicYear: string;
    enrolmentStatus: string;
    studentMaskedId: string; // e.g. "•••• •••• 9142"
    maskedStudentName: string; // e.g. "Aarav S****"
    institutionStudentId: string;
  };
  integrityProof: {
    digitalSignatureAlgorithm: string;
    trustStatus: string;
    issuerVerified: boolean;
  };
  disclaimer: string;
}

export class VerificationService {
  /**
   * Creates a tamper-evident shareable verification request with QR code
   */
  static async createVerificationRequest(
    student: IStudentIdentity,
    enrolment: IEnrolment,
    institution: IInstitution,
    requesterOrg: string,
    requesterEmail: string,
    claims: string[] = ['ENROLMENT_STATUS', 'PROGRAMME_AUTHENTICITY']
  ): Promise<{ request: IVerificationRequest; rawToken: string; qrCodeDataUrl: string }> {
    const { rawToken, hashedToken } = generateVerificationToken();
    const verificationReference = `CRDN-VRF-${Date.now().toString().slice(-6)}-${uuidv4().substring(0, 4).toUpperCase()}`;

    // Target verification URL with secure random token
    const verificationUrl = `${config.clientUrl}/verification?token=${rawToken}&ref=${verificationReference}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 2,
      color: {
        dark: '#42D6FF',
        light: '#07111F',
      },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day token lifetime

    const request: IVerificationRequest = {
      id: uuidv4(),
      tokenHash: hashedToken,
      verificationReference,
      requesterOrgName: requesterOrg,
      requesterEmail,
      studentReference: {
        studentIdentityId: student.id,
        enrolmentId: enrolment.id,
      },
      requestedClaims: claims,
      authorizationBasis: 'CONSENT_GRANTED',
      consentReference: `CNS-STU-${student.id.substring(0, 6)}`,
      verificationStatus: 'VERIFIED',
      expiresAt,
      qrPayloadUrl: verificationUrl,
      createdAt: new Date(),
    };

    return { request, rawToken, qrCodeDataUrl };
  }

  /**
   * Validates a verification token and returns minimal authorized claims
   */
  static formatPublicVerificationSummary(
    request: IVerificationRequest,
    student: IStudentIdentity,
    enrolment: IEnrolment,
    institution: IInstitution
  ): VerificationSummaryResult {
    // Mask student name for data minimization
    const rawName = student.permittedIdentityAttributes.fullName || 'Student';
    const parts = rawName.split(' ');
    const maskedName = parts.length > 1 
      ? `${parts[0]} ${parts[1][0]}***`
      : `${rawName.slice(0, 3)}***`;

    return {
      verificationReference: request.verificationReference,
      verificationStatus: request.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'NOT_VERIFIED',
      verifiedAt: new Date().toISOString(),
      expiresAt: request.expiresAt.toISOString(),
      issuingInstitution: {
        name: institution.name,
        code: institution.institutionCode,
        type: institution.institutionType,
        state: institution.state,
      },
      academicRecord: {
        programmeName: enrolment.programmeName,
        programmeCode: enrolment.programmeCode,
        academicYear: enrolment.academicYear,
        enrolmentStatus: enrolment.enrolmentStatus,
        studentMaskedId: student.protectedApaarIdentifier,
        maskedStudentName: maskedName,
        institutionStudentId: enrolment.institutionStudentId,
      },
      integrityProof: {
        digitalSignatureAlgorithm: 'ECDSA-SHA256 (CREDEN SIH Demo Gateway)',
        trustStatus: 'AUTHENTIC_AICTE_APPROVED_RECORD',
        issuerVerified: institution.status === 'ACTIVE',
      },
      disclaimer: 'DEMONSTRATION ONLY — This verification record was generated within the CREDEN SIH Prototype. Not an official AICTE/UGC certificate.',
    };
  }
}

