import { generateFingerprint, maskApaarId } from '../../utils/security.js';

export interface ApaarFormatValidationResult {
  isValidFormat: boolean;
  normalizedId?: string;
  maskedId: string;
  fingerprint: string;
  error?: string;
}

export interface AuthoritativeAdapterResult {
  status: 'VERIFIED' | 'INVALID' | 'UNVERIFIED' | 'UNAVAILABLE' | 'REQUIRES_MANUAL_REVIEW';
  demographicMatch: boolean;
  matchScore: number; // 0 to 100
  registryName?: string;
  verifiedAt?: string;
  notes?: string;
}

export class ApaarValidationService {
  /**
   * Layer 1: Format validation
   * APAAR is a 12-digit numeric academic identifier (following national standard specs)
   */
  static validateFormat(rawId: string | undefined | null): ApaarFormatValidationResult {
    if (!rawId || String(rawId).trim() === '') {
      return {
        isValidFormat: false,
        maskedId: 'N/A',
        fingerprint: '',
        error: 'APAAR ID is missing or empty.',
      };
    }

    const cleaned = String(rawId).trim().replace(/[\s-]/g, '');

    // Check if numeric and exactly 12 digits
    if (!/^\d{12}$/.test(cleaned)) {
      return {
        isValidFormat: false,
        normalizedId: cleaned,
        maskedId: maskApaarId(cleaned),
        fingerprint: generateFingerprint(cleaned),
        error: `Malformed identifier: APAAR must be a 12-digit numeric string (received: "${rawId}").`,
      };
    }

    return {
      isValidFormat: true,
      normalizedId: cleaned,
      maskedId: maskApaarId(cleaned),
      fingerprint: generateFingerprint(cleaned),
    };
  }

  /**
   * Layer 3: Authoritative Verification Adapter
   * In production, connects via secure mutual-TLS / OAuth2 to national APAAR / ABC APIs.
   * In SIH Prototype Demo Mode, simulates authoritative registry responses based on synthetic fixtures.
   */
  static async validateWithAuthoritativeAdapter(
    normalizedApaarId: string,
    claimedStudentName: string,
    claimedDobYear?: number
  ): Promise<AuthoritativeAdapterResult> {
    // Demonstration Fixtures:
    // If APAAR ends with '9999', simulate an invalid/unregistered ID
    if (normalizedApaarId.endsWith('9999')) {
      return {
        status: 'INVALID',
        demographicMatch: false,
        matchScore: 0,
        notes: 'Identifier not found in demonstration APAAR national identity registry.',
      };
    }

    // If APAAR ends with '8888', simulate unavailable/downtime gateway
    if (normalizedApaarId.endsWith('8888')) {
      return {
        status: 'UNAVAILABLE',
        demographicMatch: false,
        matchScore: 0,
        notes: 'Authoritative identity gateway temporarily unreachable. Retry scheduled.',
      };
    }

    // If APAAR ends with '7777', simulate unverified state (no linked KYC/Aadhaar in ABC)
    if (normalizedApaarId.endsWith('7777')) {
      return {
        status: 'UNVERIFIED',
        demographicMatch: false,
        matchScore: 30,
        notes: 'APAAR account exists but identity verification is pending with applicant.',
      };
    }

    // If APAAR ends with '6666', simulate manual review requirement due to slight name discrepancy
    if (normalizedApaarId.endsWith('6666')) {
      return {
        status: 'REQUIRES_MANUAL_REVIEW',
        demographicMatch: true,
        matchScore: 78,
        registryName: claimedStudentName + ' (Variant)',
        verifiedAt: new Date().toISOString(),
        notes: 'Phonetic similarity match (78%). Manual administrative review recommended.',
      };
    }

    // Default: Authenticated & Verified fixture
    return {
      status: 'VERIFIED',
      demographicMatch: true,
      matchScore: 98,
      registryName: claimedStudentName,
      verifiedAt: new Date().toISOString(),
      notes: 'Authoritative biometric-linked academic identity verified.',
    };
  }
}

