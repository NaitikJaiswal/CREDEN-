# CREDEN — Demonstration Walkthrough Guide
### Scenario: "From Fragmented Records to Trusted Academic Data"

This guide outlines the complete 10-step evaluation script for Smart India Hackathon jury review.

---

### Step 1: Institutional Data Upload
1. Log in or switch to **Institution Admin** (`admin@coep.ac.in`).
2. Navigate to **Bulk Upload** (`/students/upload`).
3. Download the official CSV template.
4. Upload a student dataset (CSV or XLSX).
5. Observe the client-side initial row preview.

### Step 2: Multi-Layer Validation Ingestion
1. Click **Run Validation & Ingestion**.
2. The server processes Layer 1 format checks and Layer 3 authoritative adapter queries.
3. Review the **Validation Report**: valid rows, malformed rows, and duplicate candidates.

### Step 3: Inspect Data Inconsistencies
1. Navigate to **Student Records** (`/students`).
2. Filter by status: `REQUIRES_MANUAL_REVIEW` or `MALFORMED`.
3. Notice how missing or malformed APAAR identifiers are flagged.

### Step 4: Approved Intake Capacity Monitoring
1. Navigate to **Intake Monitoring** (`/admissions`).
2. Observe programme capacity gauges:
   - **Green (<80%):** Normal operations.
   - **Amber (80-100%):** Near capacity.
   - **Red (>100%):** Excess admissions alert (e.g. COEP B.Tech CSE exceeding 120 approved seats).
3. Confirm that supernumerary seats (TFW/EWS) do not inflate the regular intake calculation.

### Step 5: Duplicate & Concurrent Admission Review
1. Switch to **AICTE Administrator** via the top banner.
2. Navigate to **Validation Center** (`/validation`).
3. Filter by **Rule C (Cross-Institution Concurrent)**.
4. Open the finding for student *Rohan Deshmukh* (enrolled in COEP and VJTI simultaneously).
5. Click **Investigate**, review evidence, and document supervisory inquiry notes.

### Step 6: Source Data Correction
1. Switch back to **Institution Administrator**.
2. In **Student Records**, click on a student record requiring correction.
3. Click **Correct Record**, fix the name or category, and click **Apply Correction**.
4. The system updates the database, recalculates the quality score to 96%, and resolves the linked issue.

### Step 7: Dynamic National Analytics Update
1. Switch back to **AICTE Administrator**.
2. Open **Dashboard** (`/dashboard`).
3. Notice that total student records, validation pass rate, and intake utilization refresh dynamically from the live database.

### Step 8: Academic Verification Request
1. Switch to **Authorized Verifier** (`verifier@infosys.demo`).
2. Navigate to **Academic Verification** (`/verification`).
3. Enter student ID `ENR-0001` (Aarav Sharma) and click **Generate QR & Token**.
4. A 32-byte cryptographic token and scannable QR code are generated.

### Step 9: Controlled Claim Verification
1. Click **Execute Claim Verification**.
2. Notice the celebration confetti and verified badge!
3. Observe that only permitted claims (institution, programme, degree validity) are shown, with zero private contact details or unmasked APAAR IDs exposed.

### Step 10: Immutable Audit Trail Inspection
1. Navigate to **Audit Logs** (`/audit-logs`).
2. Observe the complete chronological timeline of login, upload, issue review, correction, and verification actions with persistent correlation IDs (`CRDN-...`).

