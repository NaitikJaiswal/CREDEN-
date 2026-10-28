import { v4 as uuidv4 } from 'uuid';
import { dbStore } from '../db/store.js';
import { hashPassword, generateFingerprint, maskApaarId } from '../utils/security.js';
import { 
  IInstitution, 
  IUser, 
  IApprovedIntake, 
  IStudentIdentity, 
  IEnrolment, 
  IValidationIssue, 
  IAuditLog 
} from '../types/index.js';

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting CREDEN synthetic database seeding...');

  // 1. Seed 12 AICTE Institutions
  const institutionsData: Array<Omit<IInstitution, 'createdAt' | 'updatedAt'>> = [
    {
      id: 'INST-001',
      institutionCode: 'AICTE-MH-1029',
      name: 'COEP Technological University',
      institutionType: 'STATE_TECHNICAL_UNIVERSITY',
      state: 'Maharashtra',
      city: 'Pune',
      approvedYear: 1854,
      contactEmail: 'admin@coep.ac.in',
      status: 'ACTIVE',
    },
    {
      id: 'INST-002',
      institutionCode: 'AICTE-DL-2001',
      name: 'Indian Institute of Technology Delhi',
      institutionType: 'CENTRAL_UNIVERSITY',
      state: 'Delhi',
      city: 'New Delhi',
      approvedYear: 1961,
      contactEmail: 'admin@iitd.ac.in',
      status: 'ACTIVE',
    },
    {
      id: 'INST-003',
      institutionCode: 'AICTE-KA-3042',
      name: 'R.V. College of Engineering',
      institutionType: 'AUTONOMOUS_COLLEGE',
      state: 'Karnataka',
      city: 'Bengaluru',
      approvedYear: 1963,
      contactEmail: 'principal@rvce.edu.in',
      status: 'ACTIVE',
    },
    {
      id: 'INST-004',
      institutionCode: 'AICTE-MH-1002',
      name: 'Veermata Jijabai Technological Institute (VJTI)',
      institutionType: 'AUTONOMOUS_COLLEGE',
      state: 'Maharashtra',
      city: 'Mumbai',
      approvedYear: 1887,
      contactEmail: 'admin@vjti.ac.in',
      status: 'ACTIVE',
    },
    {
      id: 'INST-005',
      institutionCode: 'AICTE-TN-4010',
      name: 'College of Engineering, Guindy (Anna University)',
      institutionType: 'STATE_TECHNICAL_UNIVERSITY',
      state: 'Tamil Nadu',
      city: 'Chennai',
      approvedYear: 1794,
      contactEmail: 'dean@ceg.annauniv.edu',
      status: 'ACTIVE',
    },
    {
      id: 'INST-006',
      institutionCode: 'AICTE-DL-2015',
      name: 'Delhi Technological University (DTU)',
      institutionType: 'STATE_TECHNICAL_UNIVERSITY',
      state: 'Delhi',
      city: 'Delhi',
      approvedYear: 1941,
      contactEmail: 'registrar@dtu.ac.in',
      status: 'ACTIVE',
    },
    {
      id: 'INST-007',
      institutionCode: 'AICTE-TN-4088',
      name: 'PSG College of Technology',
      institutionType: 'AUTONOMOUS_COLLEGE',
      state: 'Tamil Nadu',
      city: 'Coimbatore',
      approvedYear: 1951,
      contactEmail: 'admin@psgtech.edu',
      status: 'ACTIVE',
    },
    {
      id: 'INST-008',
      institutionCode: 'AICTE-WB-5001',
      name: 'Jadavpur University Faculty of Engg & Tech',
      institutionType: 'STATE_TECHNICAL_UNIVERSITY',
      state: 'West Bengal',
      city: 'Kolkata',
      approvedYear: 1955,
      contactEmail: 'registrar@jadavpuruniversity.in',
      status: 'ACTIVE',
    },
    {
      id: 'INST-009',
      institutionCode: 'AICTE-PB-6020',
      name: 'Thapar Institute of Engineering & Technology',
      institutionType: 'AUTONOMOUS_COLLEGE',
      state: 'Punjab',
      city: 'Patiala',
      approvedYear: 1956,
      contactEmail: 'academic@thapar.edu',
      status: 'ACTIVE',
    },
    {
      id: 'INST-010',
      institutionCode: 'AICTE-TN-4001',
      name: 'National Institute of Technology Tiruchirappalli',
      institutionType: 'CENTRAL_UNIVERSITY',
      state: 'Tamil Nadu',
      city: 'Tiruchirappalli',
      approvedYear: 1964,
      contactEmail: 'dean.ac@nitt.edu',
      status: 'ACTIVE',
    },
    {
      id: 'INST-011',
      institutionCode: 'AICTE-RJ-7011',
      name: 'Birla Institute of Technology and Science (BITS Pilani)',
      institutionType: 'AUTONOMOUS_COLLEGE',
      state: 'Rajasthan',
      city: 'Pilani',
      approvedYear: 1964,
      contactEmail: 'admissions@pilani.bits-pilani.ac.in',
      status: 'ACTIVE',
    },
    {
      id: 'INST-012',
      institutionCode: 'AICTE-MH-9050',
      name: 'Maharashtra Institute of Management & Research (PGDM)',
      institutionType: 'PGDM_INSTITUTION',
      state: 'Maharashtra',
      city: 'Pune',
      approvedYear: 1998,
      contactEmail: 'director@mimr.ac.in',
      status: 'ACTIVE',
    },
  ];

  for (const item of institutionsData) {
    dbStore.insert(dbStore.institutions, {
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 2. Seed 4 Demo Users with secure bcrypt hashes
  const adminHash = await hashPassword('Admin@Creden2026');
  const instHash = await hashPassword('Inst@Creden2026');
  const stuHash = await hashPassword('Student@Creden2026');
  const verHash = await hashPassword('Verify@Creden2026');

  const demoUsers: IUser[] = [
    {
      id: 'USER-001',
      name: 'Dr. Rajeshwar Rao',
      email: 'aicte.admin@creden.gov.in',
      passwordHash: adminHash,
      roles: ['AICTE_ADMIN'],
      accountStatus: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'USER-002',
      name: 'Prof. Sunita Deshmukh',
      email: 'admin@coep.ac.in',
      passwordHash: instHash,
      roles: ['INSTITUTION_ADMIN'],
      institutionId: 'INST-001',
      accountStatus: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'USER-003',
      name: 'Aarav Sharma',
      email: 'student.aarav@creden.demo',
      passwordHash: stuHash,
      roles: ['STUDENT'],
      institutionId: 'INST-001',
      studentIdentityId: 'STU-ID-001',
      accountStatus: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'USER-004',
      name: 'Priya Nambiar',
      email: 'verifier@infosys.demo',
      passwordHash: verHash,
      roles: ['VERIFIER'],
      accountStatus: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const u of demoUsers) {
    dbStore.insert(dbStore.users, u);
  }

  // 3. Seed Approved Intakes for Programmes
  const programmes = [
    { code: 'BTECH-CSE', name: 'B.Tech in Computer Science & Engineering', baseCapacity: 120 },
    { code: 'BTECH-ECE', name: 'B.Tech in Electronics & Communication Engg', baseCapacity: 90 },
    { code: 'BTECH-MECH', name: 'B.Tech in Mechanical Engineering', baseCapacity: 90 },
    { code: 'BTECH-AIDS', name: 'B.Tech in Artificial Intelligence & Data Science', baseCapacity: 60 },
    { code: 'MBA-FIN', name: 'MBA in Financial Analytics & Management', baseCapacity: 60 },
  ];

  const academicYears = ['2024-2025', '2025-2026'];

  for (const inst of dbStore.institutions) {
    for (const prog of programmes) {
      for (const year of academicYears) {
        // Special case: INST-003 (RVCE) or INST-001 in 2025-2026 has an over-admitted case for intake violation demo
        let seatCount = prog.baseCapacity;
        if (inst.id === 'INST-001' && prog.code === 'BTECH-CSE' && year === '2025-2026') {
          seatCount = 120; // Will have 132 enrolments to trigger Rule EXCESS_ENROLMENT
        }

        const intakeRecord: IApprovedIntake = {
          id: `INTAKE-${inst.id}-${prog.code}-${year}`,
          institutionId: inst.id,
          programmeCode: prog.code,
          programmeName: prog.name,
          academicYear: year,
          approvedSeatCount: seatCount,
          maxSupernumeraryPercent: 15,
          nriQuotaMax: 5,
          policyVersion: 'AICTE-APH-2024-25',
          effectiveFrom: `${year.split('-')[0]}-06-01`,
          sourceReference: `AICTE/EOA/2024/${inst.institutionCode}`,
        };

        dbStore.insert(dbStore.approvedIntakes, intakeRecord);
      }
    }
  }

  // 4. Generate ~1,500 Synthetic Enrolments with Diverse Student Profiles
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Kabir', 'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Ananya',
    'Pari', 'Anika', 'Navya', 'Angel', 'Ira', 'Myra', 'Siya', 'Riya', 'Avani', 'Sneha', 'Tanvi',
    'Neha', 'Kavya', 'Pooja', 'Shruti', 'Meera', 'Rohan', 'Kunal', 'Dev', 'Sameer', 'Vikram'
  ];

  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Deshmukh', 'Kulkarni', 'Iyer', 'Reddy', 'Nair', 'Chopra', 'Gupta',
    'Mehta', 'Bhat', 'Joshi', 'Singh', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Rao', 'Natarajan', 'Pillai',
    'Gowda', 'Shetty', 'Agarwal', 'Mishra', 'Pandey', 'Saxena', 'Trivedi', 'Menon', 'Dubey', 'Sengupta'
  ];

  const categories = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'MANAGEMENT'];
  const supernumeraries = ['NONE', 'TFW', 'EWS_SUPERNUMERARY', 'PMSSS', 'JK_MIGRANT', 'SPORTS_QUOTA'];

  let studentCounter = 1;
  const targetTotal = 1520;

  // Let's create the key demo student first (Aarav Sharma)
  const keyApaar = '987654321012';
  const keyIdentity: IStudentIdentity = {
    id: 'STU-ID-001',
    protectedApaarIdentifier: maskApaarId(keyApaar),
    identifierFingerprint: generateFingerprint(keyApaar),
    permittedIdentityAttributes: {
      fullName: 'Aarav Sharma',
      gender: 'MALE',
      dateOfBirthYearOnly: 2004,
    },
    identifierValidationStatus: 'VERIFIED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dbStore.insert(dbStore.studentIdentities, keyIdentity);

  const keyEnrolment: IEnrolment = {
    id: 'ENR-0001',
    studentIdentityId: keyIdentity.id,
    institutionId: 'INST-001',
    institutionStudentId: '2025-CSE-001',
    programmeCode: 'BTECH-CSE',
    programmeName: 'B.Tech in Computer Science & Engineering',
    academicYear: '2025-2026',
    admissionDate: '2025-08-01',
    admissionCategory: 'GENERAL',
    supernumeraryCategory: 'NONE',
    nriStatus: false,
    ociStatus: false,
    foreignNationalStatus: false,
    enrolmentStatus: 'ACTIVE',
    validationStatus: 'VALID',
    validationScore: 98,
    sourceSystem: 'CREDEN_PORTAL',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dbStore.insert(dbStore.enrolments, keyEnrolment);
  studentCounter++;

  // Synthetic Enrolments distribution across institutions & programmes
  for (const inst of dbStore.institutions) {
    for (const prog of programmes) {
      for (const year of academicYears) {
        if (studentCounter > targetTotal) break;

        // Base batch size per programme-year
        let batchSize = 14;
        if (inst.id === 'INST-001' && prog.code === 'BTECH-CSE' && year === '2025-2026') {
          batchSize = 25; // Boost to exceed 120 capacity across multiple rounds
        }

        for (let i = 0; i < batchSize; i++) {
          if (studentCounter > targetTotal) break;

          const fName = firstNames[(studentCounter + i) % firstNames.length];
          const lName = lastNames[(studentCounter * 3 + i) % lastNames.length];
          const fullName = `${fName} ${lName}`;
          const isFemale = (studentCounter % 2) === 0;

          // Realistic synthetic APAAR number (deterministic 12 digits)
          const baseNum = (100000000000 + (studentCounter * 73919) % 899999999999).toString();
          let rawApaar = baseNum.padStart(12, '1');

          let validationStatus: any = 'VALID';
          let validationScore = 95 + (studentCounter % 5);

          // Edge Case 1: Missing APAAR ID (~20 records)
          if (studentCounter % 75 === 0) {
            rawApaar = '';
            validationStatus = 'MISSING';
            validationScore = 35;
          }
          // Edge Case 2: Malformed APAAR ID (~15 records with non-12-digit length)
          else if (studentCounter % 97 === 0) {
            rawApaar = '98745'; // Only 5 digits
            validationStatus = 'MALFORMED';
            validationScore = 40;
          }
          // Edge Case 3: Identity Conflict (~8 records)
          else if (studentCounter % 180 === 0) {
            rawApaar = '454545456666'; // Ends with 6666 (fixture for manual review/name mismatch)
            validationStatus = 'REQUIRES_MANUAL_REVIEW';
            validationScore = 75;
          }

          const fingerprint = rawApaar ? generateFingerprint(rawApaar) : '';
          const masked = rawApaar ? maskApaarId(rawApaar) : 'N/A';

          const identityId = `STU-ID-${studentCounter.toString().padStart(4, '0')}`;
          const identity: IStudentIdentity = {
            id: identityId,
            protectedApaarIdentifier: masked,
            identifierFingerprint: fingerprint,
            permittedIdentityAttributes: {
              fullName,
              gender: isFemale ? 'FEMALE' : 'MALE',
              dateOfBirthYearOnly: 2003 + (studentCounter % 3),
            },
            identifierValidationStatus: validationStatus === 'VALID' ? 'VERIFIED' : 'UNVERIFIED',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          dbStore.insert(dbStore.studentIdentities, identity);

          const cat = categories[studentCounter % categories.length];
          let superCat = 'NONE';
          if (studentCounter % 13 === 0) superCat = 'TFW';
          else if (studentCounter % 23 === 0) superCat = 'EWS_SUPERNUMERARY';
          else if (studentCounter % 37 === 0) superCat = 'PMSSS';

          const isNri = studentCounter % 43 === 0;

          const enrolmentId = `ENR-${studentCounter.toString().padStart(4, '0')}`;
          const enrolment: IEnrolment = {
            id: enrolmentId,
            studentIdentityId: identity.id,
            institutionId: inst.id,
            institutionStudentId: `${year.split('-')[0].slice(-2)}-${prog.code.split('-')[1]}-${(i + 1).toString().padStart(3, '0')}`,
            programmeCode: prog.code,
            programmeName: prog.name,
            academicYear: year,
            admissionDate: `${year.split('-')[0]}-08-15`,
            admissionCategory: cat as any,
            supernumeraryCategory: superCat as any,
            nriStatus: isNri,
            ociStatus: false,
            foreignNationalStatus: studentCounter % 113 === 0,
            enrolmentStatus: 'ACTIVE',
            validationStatus,
            validationScore,
            sourceSystem: 'CSV_BULK_UPLOAD',
            createdAt: new Date(Date.now() - (studentCounter % 30) * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          };

          dbStore.insert(dbStore.enrolments, enrolment);
          studentCounter++;
        }
      }
    }
  }

  // Edge Case 4: Cross-Institution Concurrent Enrolment (Rule C)
  // Student enrolled in COEP (INST-001) and VJTI (INST-004) for same academic year 2025-2026
  const concurrentApaar = '882199341122';
  const concurrentIdentity: IStudentIdentity = {
    id: 'STU-CONCURRENT-01',
    protectedApaarIdentifier: maskApaarId(concurrentApaar),
    identifierFingerprint: generateFingerprint(concurrentApaar),
    permittedIdentityAttributes: {
      fullName: 'Rohan Deshmukh',
      gender: 'MALE',
      dateOfBirthYearOnly: 2004,
    },
    identifierValidationStatus: 'VERIFIED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dbStore.insert(dbStore.studentIdentities, concurrentIdentity);

  const enrolmentCoep: IEnrolment = {
    id: 'ENR-CONC-01',
    studentIdentityId: concurrentIdentity.id,
    institutionId: 'INST-001',
    institutionStudentId: '25-CSE-990',
    programmeCode: 'BTECH-CSE',
    programmeName: 'B.Tech in Computer Science & Engineering',
    academicYear: '2025-2026',
    admissionDate: '2025-08-10',
    admissionCategory: 'GENERAL',
    supernumeraryCategory: 'NONE',
    nriStatus: false,
    ociStatus: false,
    foreignNationalStatus: false,
    enrolmentStatus: 'ACTIVE',
    validationStatus: 'CROSS_INSTITUTION_FLAG',
    validationScore: 68,
    sourceSystem: 'CSV_UPLOAD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const enrolmentVjti: IEnrolment = {
    id: 'ENR-CONC-02',
    studentIdentityId: concurrentIdentity.id,
    institutionId: 'INST-004',
    institutionStudentId: '25-AIDS-104',
    programmeCode: 'BTECH-AIDS',
    programmeName: 'B.Tech in Artificial Intelligence & Data Science',
    academicYear: '2025-2026',
    admissionDate: '2025-08-14',
    admissionCategory: 'GENERAL',
    supernumeraryCategory: 'NONE',
    nriStatus: false,
    ociStatus: false,
    foreignNationalStatus: false,
    enrolmentStatus: 'ACTIVE',
    validationStatus: 'CROSS_INSTITUTION_FLAG',
    validationScore: 68,
    sourceSystem: 'CSV_UPLOAD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  dbStore.insert(dbStore.enrolments, enrolmentCoep);
  dbStore.insert(dbStore.enrolments, enrolmentVjti);

  // Validation Issue for Cross-Institution Flag
  const issueConcurrent: IValidationIssue = {
    id: 'ISSUE-001-CROSS-INST',
    issueType: 'CROSS_INSTITUTION_CONCURRENT',
    severity: 'NEEDS_REVIEW',
    affectedRecordReferences: {
      enrolmentId: enrolmentCoep.id,
      studentIdentityId: concurrentIdentity.id,
      institutionStudentId: '25-CSE-990',
      institutionId: 'INST-001',
      conflictingInstitutionId: 'INST-004',
    },
    institutionId: 'INST-001',
    evidence: {
      ruleCode: 'RULE_C',
      ruleDescription: 'Potential Concurrent Cross-Institution Enrolment',
      details: 'Same APAAR ID registered for concurrent ACTIVE full-time B.Tech programmes in COEP Pune and VJTI Mumbai for AY 2025-2026. Review required under AICTE Dual-Degree Policy.',
      detectedValues: {
        studentName: 'Rohan Deshmukh',
        primaryInstitution: 'COEP Technological University',
        concurrentInstitution: 'VJTI Mumbai',
        academicYear: '2025-2026',
      },
      riskScore: 78,
    },
    ruleVersion: '1.0',
    reviewStatus: 'UNDER_INVESTIGATION',
    assignedReviewer: 'aicte.admin@creden.gov.in',
    resolutionNotes: 'Investigation opened. Official inquiries dispatched to registrar offices of both institutions.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dbStore.insert(dbStore.validationIssues, issueConcurrent);

  // Edge Case 5: Duplicate Submission (Rule A)
  const issueDuplicate: IValidationIssue = {
    id: 'ISSUE-002-DUPLICATE',
    issueType: 'DUPLICATE_SUBMISSION',
    severity: 'CONFIRMED_DATA_ERROR',
    affectedRecordReferences: {
      institutionId: 'INST-003',
      institutionStudentId: '25-MECH-042',
    },
    institutionId: 'INST-003',
    evidence: {
      ruleCode: 'RULE_A',
      ruleDescription: 'Duplicate Submission Detection',
      details: 'Same APAAR ID and Institution Student ID submitted in two successive upload files by RVCE Bangalore.',
      detectedValues: {
        institutionCode: 'AICTE-KA-3042',
        studentId: '25-MECH-042',
      },
      riskScore: 85,
    },
    ruleVersion: '1.0',
    reviewStatus: 'CORRECTION_REQUESTED',
    assignedReviewer: 'principal@rvce.edu.in',
    resolutionNotes: 'Institution notified to de-duplicate row 42 in Batch #RV-2025-B2.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dbStore.insert(dbStore.validationIssues, issueDuplicate);

  // Edge Case 6: Excess Enrolment Warning (Rule INTAKE_VIOLATION)
  const issueIntake: IValidationIssue = {
    id: 'ISSUE-003-INTAKE',
    issueType: 'INTAKE_VIOLATION',
    severity: 'WARNING',
    affectedRecordReferences: {
      institutionId: 'INST-001',
    },
    institutionId: 'INST-001',
    evidence: {
      ruleCode: 'RULE_INTAKE',
      ruleDescription: 'Approved Intake Threshold Exceeded',
      details: 'Enrolment in B.Tech CSE (AY 2025-2026) has reached 128 students against approved capacity of 120 (106.6% utilization).',
      detectedValues: {
        approvedSeats: 120,
        enrolledCount: 128,
        excessCount: 8,
      },
      riskScore: 72,
    },
    ruleVersion: '1.0',
    reviewStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  dbStore.insert(dbStore.validationIssues, issueIntake);

  // 5. Seed Realistic Audit History Logs
  const auditSeedData: Array<Omit<IAuditLog, 'id' | 'timestamp'>> = [
    {
      actorId: 'USER-001',
      actorEmail: 'aicte.admin@creden.gov.in',
      actorRole: 'AICTE_ADMIN',
      action: 'PLATFORM_INITIALIZATION',
      resourceType: 'SYSTEM',
      outcome: 'SUCCESS',
      correlationId: 'CRDN-INIT-001',
      sanitizedMetadata: { version: '1.0.0-sih-prototype', institutionsCount: 12 },
    },
    {
      actorId: 'USER-002',
      actorEmail: 'admin@coep.ac.in',
      actorRole: 'INSTITUTION_ADMIN',
      institutionId: 'INST-001',
      action: 'BULK_STUDENT_UPLOAD_PROCESSED',
      resourceType: 'IMPORT_BATCH',
      outcome: 'SUCCESS',
      correlationId: 'CRDN-UPL-0042',
      sanitizedMetadata: { fileName: 'coep_btech_cse_intake_2025.csv', totalRows: 128, validRows: 128 },
    },
    {
      actorId: 'USER-001',
      actorEmail: 'aicte.admin@creden.gov.in',
      actorRole: 'AICTE_ADMIN',
      institutionId: 'INST-001',
      action: 'VALIDATION_ISSUE_INVESTIGATE',
      resourceType: 'VALIDATION_ISSUE',
      resourceId: issueConcurrent.id,
      outcome: 'SUCCESS',
      correlationId: 'CRDN-REV-0091',
      sanitizedMetadata: { ruleCode: 'RULE_C', student: 'Rohan Deshmukh' },
    },
    {
      actorId: 'USER-004',
      actorEmail: 'verifier@infosys.demo',
      actorRole: 'VERIFIER',
      institutionId: 'INST-001',
      action: 'ACADEMIC_VERIFICATION_CHECK',
      resourceType: 'VERIFICATION_REQUEST',
      outcome: 'SUCCESS',
      correlationId: 'CRDN-VRF-0105',
      sanitizedMetadata: { verificationReference: 'CRDN-VRF-2026-98124', result: 'VERIFIED' },
    },
  ];

  for (const log of auditSeedData) {
    dbStore.insert(dbStore.auditLogs, {
      ...log,
      id: uuidv4(),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)),
    });
  }

  dbStore.isSeeded = true;
  console.log(`✅ Successfully seeded CREDEN:`);
  console.log(`   - 12 AICTE Institutions`);
  console.log(`   - ${dbStore.users.length} Demo Accounts (AICTE Admin, Institution Admin, Student, Verifier)`);
  console.log(`   - ${dbStore.approvedIntakes.length} Approved Intake Quotas`);
  console.log(`   - ${dbStore.enrolments.length} Student Enrolments`);
  console.log(`   - ${dbStore.validationIssues.length} Validation Findings (Rules A, B, C, Excess Intake)`);
  console.log(`   - ${dbStore.auditLogs.length} Audit Trail Events`);
}

