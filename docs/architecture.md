# CREDEN — System Architecture & Design Specification

## 1. Overview
**CREDEN** (Student Identity, Verification and Academic Governance Platform) is an integrated national-scale academic data ecosystem designed for the **Smart India Hackathon**. It establishes trusted student-level enrolment tracking, multi-layer APAAR identity validation, explainable duplicate and concurrent admission detection, real-time intake monitoring, and controlled academic verification for AICTE and approved institutions.

---

## 2. Layered Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        3D CLIENT EXPERIENCE                            │
│  React 18 • Three.js • React Three Fiber • Drei • Tailwind • Framer    │
│  - Cinematic 3D Identity Network & 6-Stage 3D Workflow Inspection      │
│  - AICTE Admin & Institution Dashboards • Recharts Data Telemetry      │
│  - Student Profiling • Bulk CSV/XLSX Upload • Review Center • Verifier │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST API (/api/v1)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       EXPRESS BACKEND GATEWAY                          │
│  Node.js • Express • TypeScript • Helmet • Strict CORS • Rate Limiting │
│  - RBAC: AICTE Admin, Institution Admin, Student, Authorized Verifier  │
│  - Institution Data Partitioning & Isolation Middleware                │
│  - Correlation Tracing & Redacted Audit Logging                        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
┌───────────────────▼──────────────────┐  ┌──────────▼───────────────────┐
│     INTELLIGENT BUSINESS SERVICES    │  │       STORAGE & SECURITY     │
│  1. APAAR Multi-Layer Validator      │  │  - MongoDB Atlas / Mongoose  │
│     • L1: 12-Digit Numeric Check     │  │  - Resilient In-Memory Store │
│     • L2: Batch & Inst Duplicate     │  │  - Salted Keyed HMAC-SHA256  │
│     • L3: Authoritative Adapter      │  │  - Bcrypt Password Hashing   │
│     • L4: Academic Consistency       │  │  - High-Entropy Token Hash   │
│  2. Duplicate Engine (Rules A - E)   │  │  - Audit Trail Engine        │
│  3. Intake Capacity Monitor          │  │                              │
│  4. Verification & QR Code Proof     │  │                              │
│  5. Policy Simulation & Forecast     │  │                              │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 3. Modular Validation Service (4 Layers)

### Layer 1: Format Validation
- **Specification:** 12-digit numeric identifier adhering to national APAAR / ABC standards.
- **Rules:** Detects empty or null entries, strips leading/trailing spaces and hyphens, preserves leading zeros, enforces strict 12-digit numeric format.

### Layer 2: Duplicate Detection
- Checks for duplicate APAAR IDs within the same upload batch (Rule A).
- Checks for duplicate active enrolment records within the institution scope.

### Layer 3: Authoritative Gateway Adapter
- Simulates external authoritative identity registry checks:
  - `VERIFIED`: Name and demographic attributes match authoritative records.
  - `INVALID`: Identifier unregistered or nonexistent.
  - `UNVERIFIED`: Identifier exists but eKYC/Aadhaar linkage is pending.
  - `REQUIRES_MANUAL_REVIEW`: Discrepancy detected (e.g. slight spelling variation).

### Layer 4: Data Consistency
- Compares institution code, department, degree level, intake quotas, and academic year.

---

## 4. Intelligent Duplicate Detection (Rules A - E)

- **Rule A (Duplicate Submission):** Same APAAR and same institution student ID within the same batch or academic year. Flagged as `CONFIRMED_DATA_ERROR`.
- **Rule B (Identity Conflict):** Same APAAR associated with conflicting legal names or dates of birth. Flagged as `NEEDS_REVIEW` (Risk Score: 65).
- **Rule C (Cross-Institution Concurrency):** Same APAAR linked to active enrolments across two distinct institutions in the same academic year. Flagged for review under dual-degree policies; never automatically branded fraud (Risk Score: 78).
- **Rule D (Progression Tracking):** Same identifier across different academic years (e.g. Diploma 2022-2024 to B.Tech 2024-2028). Flagged as `INFORMATIONAL` progression.
- **Rule E (Legitimate Dual Degree):** Verified concurrent programmes permitted under institutional dual-degree guidelines.

---

## 5. Approved Intake Monitoring

$$\text{Utilization Percentage} = \frac{\text{Actual Enrolment}}{\text{Approved Intake}} \times 100$$

- **Thresholds:**
  - **Normal Monitoring (<80%):** Enrolment is healthy and within bounds.
  - **Near Capacity (80% - 100%):** Approaching maximum sanctioned capacity.
  - **Excess Enrolment (>100%):** Breach alert generated.
- **Supernumerary Quotas:** TFW, EWS, J&K, PMSSS, and International seats (NRI/OCI) are isolated from ordinary approved intake calculations to prevent false breach warnings.

