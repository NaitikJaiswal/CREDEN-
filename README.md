# CREDEN — AICTE Student Identity, Data Verification & Intelligent Academic Governance Platform

> **"Trust Every Record. Verify Every Identity. Empower Every Institution."**  
> *One Academic Identity. A Connected Future.*

---

## 1. Executive Summary & Problem Statement

AICTE receives student-related information from approved institutions through disparate submission mechanisms. PGDM institutions provide annual student data, while many other AICTE-approved institutions submit aggregated statistical enrolment summaries. This fragmentation creates severe national challenges in maintaining complete, authentic, consistent, and verifiable student academic records.

With **APAAR ID (Automated Permanent Academic Account Registry)** serving as the national student identity under the National Education Policy (NEP 2020), **CREDEN** is built as an intelligent, unified digital platform that connects AICTE, approved institutions, students, and authorized verification stakeholders.

**CREDEN delivers:**
- Full-screen cinematic **interactive 3D academic identity network** (Three.js, React Three Fiber, Drei) depicting institutional connections, data rings, and floating student identity nodes.
- **6-stage 3D workflow visualization** explaining end-to-end data submission, validation, intake governance, and verification.
- Modular **4-layer APAAR validation engine** (format checks, local duplicate filters, authoritative gateway adapter, and consistency checks).
- Explainable **intelligent duplicate detection (Rules A through E)** separating accidental re-submissions and legitimate dual qualifications from suspicious concurrency.
- Dedicated **approved intake capacity monitoring** with real-time gauges and visual breach alerts (>100% capacity).
- Tamper-evident **academic verification portal** with random high-entropy tokens and scannable QR codes delivering minimal necessary claims.
- Interactive **supervisory policy simulator** allowing regulators to test warning threshold impacts.
- Pre-seeded **synthetic demonstration dataset** featuring 12 AICTE institutions across India and ~1,500 realistic student enrolments.

*Note: CREDEN is an SIH prototype designed for technical evaluation and demonstration. It does not claim to be an officially deployed AICTE product.*

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with Vite & TypeScript
- **Styling:** Tailwind CSS (custom dark enterprise palette `#07111F`, `#0B1728`, `#101F33`, `#42D6FF`, `#8B7CFF`)
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Charts:** Recharts (Intake gauges, YoY area charts, pie charts, bar charts)
- **Icons & Motion:** Lucide React, Framer Motion, Canvas Confetti
- **Forms & State:** React Hook Form, TanStack Query, React Router v7

### Backend
- **Runtime:** Node.js v24 & Express.js with TypeScript
- **Database:** MongoDB Atlas / Mongoose with resilient In-Memory Database Engine fallback (zero setup required to run!)
- **Security:** Bcryptjs password hashing, JSON Web Tokens (JWT), Salted Keyed HMAC-SHA256 fingerprinting, Helmet, Strict CORS, Rate Limiting
- **Ingestion:** Multer, PapaParse, XLSX engine

### Testing
- **Unit & Integration Suite:** Vitest, Supertest (11 automated test specifications passing)

---

## 3. Project Structure

```text
CREDEN/
├── client/                      # React 18 + Vite + Three.js Frontend
│   ├── public/logo.svg          # Holographic brand logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # DemoBanner, Quick Role Switcher
│   │   │   ├── layout/          # AppLayout, Navbar, Sidebar
│   │   │   └── three/           # IdentityNetwork3D, Workflow3D
│   │   ├── features/
│   │   │   └── auth/            # AuthContext, Token persistence
│   │   ├── lib/utils.ts         # Formatting, styling, and color helpers
│   │   ├── pages/               # 12 functional full pages
│   │   │   ├── LandingPage.tsx  # Cinematic 3D Hero & 6-Stage Workflow
│   │   │   ├── LoginPage.tsx    # 1-Click Role Logins
│   │   │   ├── DashboardPage.tsx# 8 KPI cards, dynamic charts, regional view
│   │   │   ├── InstitutionsPage.tsx
│   │   │   ├── InstitutionDetailPage.tsx
│   │   │   ├── StudentsPage.tsx # Table, masked APAAR, drawer, CSV export
│   │   │   ├── UploadPage.tsx   # Bulk CSV/XLSX Ingestion & report
│   │   │   ├── ValidationPage.tsx # Issue queue & investigation
│   │   │   ├── AdmissionsPage.tsx # Intake capacity gauges & alerts
│   │   │   ├── VerificationPage.tsx # Token, QR code & credential proof
│   │   │   ├── AnalyticsPage.tsx# YoY growth, forecast & policy simulator
│   │   │   ├── ReportsPage.tsx  # Downloadable compliance dossiers
│   │   │   ├── AuditLogsPage.tsx# Immutable audit trail & correlation IDs
│   │   │   ├── SettingsPage.tsx # Telemetry & database reset button
│   │   │   └── DemoGuidePage.tsx# 10-step jury walkthrough script
│   │   ├── services/api.ts      # Type-safe API client
│   │   ├── types/index.ts       # Shared TypeScript definitions
│   │   ├── App.tsx              # Router & Role Route Guards
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                      # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/index.ts      # Environment configurations
│   │   ├── controllers/         # 10 modular controllers
│   │   ├── db/store.ts          # Resilient Dual-Mode (Mongoose + In-Memory)
│   │   ├── middleware/          # Auth, RBAC guards, Institution isolation
│   │   ├── models/index.ts      # Mongoose schemas for all 9 collections
│   │   ├── routes/index.ts      # Versioned REST endpoints (/api/v1)
│   │   ├── seed/                # 12 institutions & ~1,500 synthetic enrolments
│   │   ├── services/
│   │   │   ├── apaar/           # Format validation & authoritative gateway adapter
│   │   │   ├── audit/           # Redacted event logging & correlation tracing
│   │   │   ├── enrolment/       # Intake utilization & capacity calculations
│   │   │   ├── validation/      # Rules A through E duplicate detection
│   │   │   └── verification/    # 32-byte token & QR code generation
│   │   ├── tests/api.test.ts    # Vitest automated test suite
│   │   ├── app.ts               # Express configuration
│   │   └── server.ts            # Entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Complete technical documentation
│   ├── architecture.md
│   ├── api.md
│   ├── security.md
│   └── demo-guide.md
│
├── .env.example
├── package.json
└── README.md
```

---

## 4. Installation & Quick Start

### Prerequisites
- Node.js v18+ (tested on Node v24.14.0)
- npm v9+

### 1. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/creden.git
cd creden

# Install root, client, and server dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(No MongoDB setup required! If `MONGODB_URI` is not reachable, CREDEN automatically boots with its embedded in-memory database pre-seeded with 12 institutions and ~1,500 synthetic records).*

### 3. Run Backend & Frontend Concurrently
```bash
# Start both client (Vite on :5173) and backend (Express on :5000)
npm run dev
```

Alternatively, run in separate terminals:
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

Open your browser to: **http://localhost:5173**

---

## 5. Demonstration Accounts (1-Click Logins)

The application features a sticky top banner with **1-Click Role Switcher** buttons. You can also sign in manually using these seeded credentials:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **AICTE Administrator** | `aicte.admin@creden.gov.in` | `Admin@Creden2026` | National oversight, all institutions, duplicate review queue, policy simulator |
| **Institution Administrator** | `admin@coep.ac.in` | `Inst@Creden2026` | COEP Tech University: isolated data submission, intake capacity, record correction |
| **Student** | `student.aarav@creden.demo` | `Student@Creden2026` | Aarav Sharma: view masked APAAR profile, academic status, request verification |
| **Authorized Verifier** | `verifier@infosys.demo` | `Verify@Creden2026` | Third-party employer: minimal claim verification via cryptographic token / QR |

---

## 6. Guided 10-Step Hackathon Walkthrough

Visit **`/help`** in the application for an interactive stepper with quick launch buttons:

1. **Institution Data Submission:** Sign in as Institution Admin (`admin@coep.ac.in`), navigate to `/students/upload`, download the CSV template, and upload student records.
2. **APAAR Multi-Layer Validation:** Observe Layer 1 format checks, Layer 2 local duplicate analysis, and Layer 3 authoritative adapter verification.
3. **Detect Inconsistencies:** Filter `/students` by `REQUIRES_MANUAL_REVIEW` to inspect missing or malformed APAAR identifiers.
4. **Approved Intake Monitoring:** Open `/admissions` to observe programme utilization gauges. Notice B.Tech CSE exceeding 120 approved capacity with a red alert (>100%).
5. **Investigate Concurrency:** Switch to AICTE Administrator, open `/validation`, and inspect Rule C finding for student *Rohan Deshmukh* (concurrently enrolled in COEP and VJTI). Open inquiry without jumping to fraud.
6. **Correct Record at Source:** Switch to Institution Admin, open the student profile, click **Correct Record**, fix the typographic discrepancy, and observe automatic re-validation to 96%.
7. **Real-Time Analytics Refresh:** Switch to AICTE Admin and observe `/dashboard` updating dynamic KPIs, pass rates, and regional statistics directly from the database.
8. **Authorized Verification Request:** Switch to Verifier (`verifier@infosys.demo`), navigate to `/verification`, and generate a 32-byte cryptographic token and QR code for candidate `ENR-0001`.
9. **Controlled Claim Verification:** Click verify to view minimal permitted claims with celebration confetti without exposing unmasked private identifiers.
10. **Immutable Audit Trail:** Open `/audit-logs` to inspect the complete chronological sequence of events tied to correlation IDs (`CRDN-...`).

---

## 7. Running Tests

The test suite validates the health check, demo accounts, JWT authentication, live KPI calculation, APAAR format validation, duplicate detection, intake monitoring, and academic verification:

```bash
# Run backend test suite
npm --prefix server test
```
*Result: 11 tests passing in ~350ms.*

---

## 8. API Endpoint Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Email/password authentication |
| `POST` | `/api/v1/auth/demo-login` | Fast role-switching login for evaluation |
| `GET` | `/api/v1/dashboard/overview` | National calculated KPIs, intake capacity, and issues |
| `GET` | `/api/v1/institutions` | List approved institutions with search and state filter |
| `GET` | `/api/v1/institutions/:id` | Institution profile and programme intakes |
| `GET` | `/api/v1/students` | Search and filter student records (masked APAAR) |
| `PATCH`| `/api/v1/students/:id` | Correct student record details |
| `GET` | `/api/v1/students/export` | Export sanitized CSV records with formula protection |
| `GET` | `/api/v1/upload/template` | Download official CSV upload template |
| `POST` | `/api/v1/students/bulk-upload`| Upload CSV/XLSX student file with validation |
| `GET` | `/api/v1/validation/issues` | Supervisory queue of duplicate & validation findings |
| `POST` | `/api/v1/validation/issues/:id/review` | Apply administrative review action |
| `POST` | `/api/v1/verification/requests` | Issue 32-byte verification token and QR code |
| `GET` | `/api/v1/verification/verify` | Resolve academic claim by token or reference |
| `GET` | `/api/v1/reports` | Compile intake, YoY comparison, and forecast reports |
| `POST` | `/api/v1/reports/simulate-policy`| Simulate impact of adjusting intake thresholds |
| `GET` | `/api/v1/audit-logs` | Retrieve immutable audit records with correlation IDs |
| `POST` | `/api/v1/demo/reset` | Restore demonstration database to fresh seed state |
| `GET` | `/api/v1/health` | Health check and platform version status |

---

## 9. Known Limitations & Future Official Integration Pathways

1. **APAAR Authoritative Registry:** CREDEN demonstrates a modular Layer 3 authoritative adapter using synthetic fixtures. In official production, this adapter would be configured with mutual-TLS (mTLS) and OAuth 2.0 client credentials connecting directly to NSDL/DigiLocker national APAAR/ABC APIs.
2. **AICTE Approval Process Integration:** Approved intake records in this prototype are seeded based on the AICTE Approval Process Handbook (APH 2024-25). Future integration would connect to AICTE's central portal via authorized webhooks.
3. **Decentralized Verifiable Credentials (W3C VC):** The verification portal uses SHA-256 hashed tokens and simulated ECDSA digital signatures. This can be extended to W3C Verifiable Credentials and India's DigiLocker wallet format.

---

## 10. License & Attribution

Developed for the **Smart India Hackathon (SIH)**.  
Designed and engineered as a high-fidelity academic governance prototype.

