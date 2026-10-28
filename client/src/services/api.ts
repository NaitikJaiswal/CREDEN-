import {
  MOCK_INSTITUTIONS,
  MOCK_STUDENTS,
  MOCK_VALIDATION_ISSUES,
  MOCK_AUDIT_LOGS,
  MOCK_USERS,
} from './mockData';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api/v1';

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('creden_token');
  }

  static setToken(token: string) {
    localStorage.setItem('creden_token', token);
  }

  static clearToken() {
    localStorage.removeItem('creden_token');
  }

  private static getMockFallback<T>(endpoint: string, _options: RequestInit = {}): T {
    const url = new URL(`http://localhost${endpoint}`);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // 1. Institutions list & detail
    if (pathname === '/institutions' || pathname.startsWith('/institutions?')) {
      const search = searchParams.get('search')?.toLowerCase() || '';
      const state = searchParams.get('state') || '';
      const type = searchParams.get('type') || '';

      let list = [...MOCK_INSTITUTIONS];
      if (search) {
        list = list.filter(
          (i) =>
            i.name.toLowerCase().includes(search) ||
            i.institutionCode.toLowerCase().includes(search) ||
            i.city.toLowerCase().includes(search)
        );
      }
      if (state) {
        list = list.filter((i) => i.state.toLowerCase() === state.toLowerCase());
      }
      if (type) {
        list = list.filter((i) => i.institutionType === type);
      }
      return { success: true, count: list.length, institutions: list } as unknown as T;
    }

    if (pathname.startsWith('/institutions/')) {
      const id = pathname.split('/')[2];
      const inst =
        MOCK_INSTITUTIONS.find((i) => i.id === id || i.institutionCode === id) ||
        MOCK_INSTITUTIONS[0];
      return {
        success: true,
        institution: inst,
        metrics: {
          totalStudents: 128,
          intakeCapacity: 120,
          utilizationRate: 106.7,
          validationScore: 98.4,
          flaggedRecords: 2,
        },
        programmeIntakes: [
          { programmeCode: 'BTECH-CSE', programmeName: 'B.Tech in Computer Science & Engineering', approvedSeatCount: 120, enrolled: 128, status: 'EXCEEDED' },
          { programmeCode: 'BTECH-ECE', programmeName: 'B.Tech in Electronics & Communication Engg', approvedSeatCount: 90, enrolled: 84, status: 'NORMAL' },
          { programmeCode: 'BTECH-MECH', programmeName: 'B.Tech in Mechanical Engineering', approvedSeatCount: 90, enrolled: 72, status: 'NORMAL' },
        ],
        recentBatches: [
          { batchId: 'BATCH-2025-01', academicYear: '2025-2026', totalRecords: 128, validCount: 126, issueCount: 2, status: 'NEEDS_REVIEW' },
        ],
        activeIssues: [
          { id: 'ISSUE-001', ruleCode: 'RULE_B', severity: 'VIOLATION', message: 'Approved intake capacity exceeded by 8 students in B.Tech CSE' },
        ],
      } as unknown as T;
    }

    // 2. Students list & detail
    if (pathname === '/students' || pathname.startsWith('/students?')) {
      const search = searchParams.get('search')?.toLowerCase() || '';
      const instId = searchParams.get('institutionId') || '';
      const status = searchParams.get('validationStatus') || '';

      let list = [...MOCK_STUDENTS];
      if (search) {
        list = list.filter(
          (s) =>
            s.studentName.toLowerCase().includes(search) ||
            s.maskedApaarId.includes(search) ||
            s.institutionName.toLowerCase().includes(search)
        );
      }
      if (instId) {
        list = list.filter((s) => s.institutionId === instId);
      }
      if (status) {
        list = list.filter((s) => s.validationStatus === status);
      }
      return { success: true, total: list.length, students: list } as unknown as T;
    }

    if (pathname.startsWith('/students/')) {
      const id = pathname.split('/')[2];
      const stu = MOCK_STUDENTS.find((s) => s.id === id) || MOCK_STUDENTS[0];
      return { success: true, student: stu } as unknown as T;
    }

    // 3. Validation Issues
    if (pathname === '/validation/issues' || pathname.startsWith('/validation/issues?')) {
      const status = searchParams.get('status') || '';
      const severity = searchParams.get('severity') || '';
      let list = [...MOCK_VALIDATION_ISSUES];
      if (status) {
        list = list.filter((iss) => iss.reviewStatus === status);
      }
      if (severity) {
        list = list.filter((iss) => iss.severity === severity);
      }
      return { success: true, count: list.length, issues: list } as unknown as T;
    }

    if (pathname.includes('/review')) {
      return { success: true, message: 'Issue reviewed and updated successfully.' } as unknown as T;
    }

    // 4. Verification
    if (pathname.includes('/verification')) {
      return {
        success: true,
        verified: true,
        result: {
          status: 'VERIFIED',
          valid: true,
          studentName: 'Aarav Sharma',
          maskedApaarId: 'XXXXXXXX1012',
          institutionName: 'COEP Technological University',
          programmeName: 'B.Tech in Computer Science & Engineering',
          academicYear: '2025-2026',
          validationScore: 98,
          timestamp: new Date().toISOString(),
        },
      } as unknown as T;
    }

    // 5. Audit Logs
    if (pathname === '/audit-logs' || pathname.startsWith('/audit-logs?')) {
      return { success: true, count: MOCK_AUDIT_LOGS.length, logs: MOCK_AUDIT_LOGS, auditLogs: MOCK_AUDIT_LOGS } as unknown as T;
    }

    // 6. Reports & Analytics
    if (pathname.includes('/simulate-policy')) {
      return {
        success: true,
        results: {
          programmesEvaluated: 48,
          normalCount: 42,
          nearCapacityCount: 4,
          excessCount: 2,
          impactAnalysis: 'Simulation complete: 4 programmes flagged for proactive capacity review and 2 over-intake breaches identified.',
        },
      } as unknown as T;
    }

    if (pathname.includes('/reports')) {
      return {
        success: true,
        reportType: 'INTAKE_UTILIZATION',
        generatedAt: new Date().toISOString(),
        yearComparison: {
          '2024-2025': 1320,
          '2025-2026': 1522,
          growthPercentage: 15.3,
        },
        supernumeraryStats: {
          tfw: 54,
          ewsSupernumerary: 38,
          pmsss: 24,
          nri: 18,
          oci: 6,
          foreignNational: 12,
        },
        dataQuality: {
          averageValidationScore: 96.4,
          fullyVerifiedPercent: 97.1,
          flaggedRecordsCount: 38,
        },
        simulatedForecast: [
          { year: '2023-2024', actual: 1180, projected: 1180, confidence: 'Historical' },
          { year: '2024-2025', actual: 1320, projected: 1320, confidence: 'Historical' },
          { year: '2025-2026', actual: 1522, projected: 1500, confidence: 'Current Cycle' },
          { year: '2026-2027', actual: null, projected: 1680, confidence: 'Projected (AICTE ARIMA)' },
          { year: '2027-2028', actual: null, projected: 1840, confidence: 'Projected (AICTE ARIMA)' },
        ],
        reports: [
          { id: 'REP-01', title: 'National AICTE Intake Compliance Summary AY 2025-26', status: 'GENERATED', generatedAt: '2025-10-24', downloadUrl: '#' },
          { id: 'REP-02', title: 'State-wise APAAR Validation Matrix', status: 'GENERATED', generatedAt: '2025-10-20', downloadUrl: '#' },
        ],
        summary: {
          totalAudited: 1522,
          complianceRate: 98.4,
          flaggedBatches: 2,
        },
      } as unknown as T;
    }

    // 7. Auth login, demo-login, me, logout
    if (pathname === '/auth/login') {
      let bodyData: any = {};
      try {
        bodyData = typeof _options.body === 'string' ? JSON.parse(_options.body) : {};
      } catch {}
      const email = (bodyData.email || '').toLowerCase();
      let role = 'AICTE_ADMIN';
      if (email.includes('coep') || email.includes('inst')) role = 'INSTITUTION_ADMIN';
      else if (email.includes('aarav') || email.includes('student')) role = 'STUDENT';
      else if (email.includes('verif') || email.includes('infosys')) role = 'VERIFIER';

      const user = MOCK_USERS[role] || MOCK_USERS['AICTE_ADMIN'];
      return {
        success: true,
        token: `creden-jwt-token-${role}`,
        user,
      } as unknown as T;
    }

    if (pathname === '/auth/demo-login') {
      let bodyData: any = {};
      try {
        bodyData = typeof _options.body === 'string' ? JSON.parse(_options.body) : {};
      } catch {}
      const role = bodyData.role || 'AICTE_ADMIN';
      const user = MOCK_USERS[role] || MOCK_USERS['AICTE_ADMIN'];
      return {
        success: true,
        token: `creden-jwt-token-${role}`,
        user,
      } as unknown as T;
    }

    if (pathname.includes('/auth/me')) {
      const storedRole = localStorage.getItem('creden_role') || 'AICTE_ADMIN';
      const user = MOCK_USERS[storedRole] || MOCK_USERS['AICTE_ADMIN'];
      return {
        success: true,
        user,
      } as unknown as T;
    }

    if (pathname.includes('/auth/logout')) {
      return { success: true } as unknown as T;
    }

    return { success: true } as unknown as T;
  }

  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        // Token expired, clear token
        this.clearToken();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return data;
      }

      return this.getMockFallback<T>(endpoint, options);
    } catch {
      return this.getMockFallback<T>(endpoint, options);
    }
  }

  // Auth Endpoints
  static login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static demoLogin(role: string) {
    return this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  static getCurrentUser() {
    return this.request('/auth/me');
  }

  static logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Dashboard Overview
  static getDashboardOverview(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dashboard/overview${query ? `?${query}` : ''}`);
  }

  // Institutions
  static getInstitutions(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/institutions${query ? `?${query}` : ''}`);
  }

  static getInstitutionById(id: string) {
    return this.request(`/institutions/${id}`);
  }

  // Students
  static getStudents(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/students${query ? `?${query}` : ''}`);
  }

  static getStudentById(id: string) {
    return this.request(`/students/${id}`);
  }

  static updateStudent(id: string, updates: Record<string, any>) {
    return this.request(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Upload
  static uploadBulk(formData: FormData) {
    return this.request('/students/bulk-upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Validation
  static getValidationIssues(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/validation/issues${query ? `?${query}` : ''}`);
  }

  static reviewIssue(id: string, action: string, resolutionNotes?: string) {
    return this.request(`/validation/issues/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, resolutionNotes }),
    });
  }

  // Verification
  static createVerificationRequest(data: { studentId: string; requesterOrg: string; requesterEmail: string }) {
    return this.request('/verification/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static verifyCredential(tokenOrRef: { token?: string; ref?: string }) {
    const query = new URLSearchParams(tokenOrRef as any).toString();
    return this.request(`/verification/verify?${query}`);
  }

  // Reports & Analytics
  static getReports(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reports${query ? `?${query}` : ''}`);
  }

  static simulatePolicy(params: { warningThreshold: number; excessThreshold: number }) {
    return this.request('/reports/simulate-policy', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Audit Logs
  static getAuditLogs(params?: Record<string, any>) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/audit-logs${query ? `?${query}` : ''}`);
  }

  // Demo utilities
  static getDemoAccounts() {
    return this.request('/demo/accounts');
  }

  static resetDatabase() {
    return this.request('/demo/reset', { method: 'POST' });
  }

  static getDemoScenario() {
    return this.request('/demo/scenario');
  }
}

