# CREDEN — REST API Specification (v1)

Base URL: `/api/v1`

---

## 1. Authentication & Role Discovery

### `POST /api/v1/auth/login`
Authenticates a user via email and password.
- **Request Body:** `{ "email": "...", "password": "..." }`
- **Response:** `{ "success": true, "token": "jwt...", "user": { ... } }`

### `POST /api/v1/auth/demo-login`
Fast role-switching endpoint for evaluation.
- **Request Body:** `{ "role": "AICTE_ADMIN" | "INSTITUTION_ADMIN" | "STUDENT" | "VERIFIER" }`
- **Response:** `{ "success": true, "token": "jwt...", "user": { ... } }`

### `GET /api/v1/auth/me`
Retrieves authenticated user session and institutional profile.
- **Headers:** `Authorization: Bearer <token>`

---

## 2. National Governance Dashboard

### `GET /api/v1/dashboard/overview`
Retrieves national calculated KPIs, intake capacity, validation issue breakdowns, and regional telemetry.
- **Query Parameters:** `academicYear`, `state`, `institutionId`, `programmeCode`
- **Response:**
  - `kpis`: Total institutions, student records, pass rate, duplicate count, over-intake count.
  - `intakeSummary`: Approved seats, enrolled students, remaining capacity, national utilization %.
  - `submissionStatusCounts`: Accepted, under validation, needs correction, duplicate candidate.
  - `issueDistribution`: Array of issues categorized by detection rule.
  - `regionalData`: Enrolment and capacity grouped by state.
  - `recentActivity`: Live audit event stream.

---

## 3. Institutions Directory

### `GET /api/v1/institutions`
Lists all approved participating institutions with filters.
- **Query Parameters:** `search`, `state`, `type`

### `GET /api/v1/institutions/:id`
Retrieves institution profile, approved programme intakes, recent upload batches, and active issues.

---

## 4. Student Record Management

### `GET /api/v1/students`
Paginated search and filter for student enrolment profiles.
- **Query Parameters:** `page`, `limit`, `search`, `academicYear`, `validationStatus`, `admissionCategory`
- **Response:** List of student records with masked APAAR identifiers and quality scores.

### `GET /api/v1/students/:id`
Retrieves deep student dossier: identity, academic details, quota status, validation findings, and audit history.

### `PATCH /api/v1/students/:id`
Allows authorized institution administrators to correct data errors in student records.

### `GET /api/v1/students/export`
Exports sanitized CSV student records with spreadsheet formula injection protection.

---

## 5. Bulk Ingestion & Validation

### `GET /api/v1/upload/template`
Downloads the official CSV student upload template.

### `POST /api/v1/students/bulk-upload`
Multipart upload for CSV or XLSX file. Executes multi-layer validation engine.
- **Form Data:** `file`, `academicYear`, `programmeCode`
- **Response:** Ingestion summary, valid count, invalid count, duplicate count, and detailed error log.

### `GET /api/v1/imports/:batchId/errors`
Downloads a CSV report of validation errors for a specific upload batch.

---

## 6. Validation Review Center

### `GET /api/v1/validation/issues`
Supervisory issue queue filterable by severity, rule code, and status.

### `POST /api/v1/validation/issues/:id/review`
Applies administrative action: `INVESTIGATE`, `REQUEST_CORRECTION`, `MARK_LEGITIMATE`, or `RESOLVE_ERROR`.

---

## 7. Academic Verification

### `POST /api/v1/verification/requests`
Issues a random 32-byte cryptographic token and QR code for an academic claim.

### `GET /api/v1/verification/verify`
Public / authorized verification endpoint. Resolves claim by token or reference without exposing private student records.

---

## 8. Analytics & Policy Simulation

### `GET /api/v1/reports`
Compiles institutional intake reports, YoY growth comparisons, and simulated 5-year enrolment forecasts.

### `POST /api/v1/reports/simulate-policy`
Simulates the impact of adjusting intake warning thresholds and excess thresholds on warning counts.

---

## 9. System & Hackathon Tools

### `GET /api/v1/audit-logs`
Queries tamper-evident platform audit events.

### `GET /api/v1/demo/accounts`
Lists pre-seeded demonstration accounts and passwords.

### `POST /api/v1/demo/reset`
Restores demonstration database to initial pristine seed state.

### `GET /api/v1/health`
Health check and platform status.

