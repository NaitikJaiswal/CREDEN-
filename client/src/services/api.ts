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

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
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

