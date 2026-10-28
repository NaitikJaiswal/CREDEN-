# CREDEN — Security, Privacy & Compliance Architecture

## 1. Principles

1. **Defense in Depth:** Security is integrated across transport, authentication, authorization, business validation, and database storage.
2. **Data Minimization:** Raw APAAR identifiers are never stored unencrypted or exposed in plain text in public tables. Only minimal necessary claims are shared with third-party verifiers.
3. **Multi-Tenant Isolation:** Institutional administrators are cryptographically and logically isolated to prevent cross-institution data breaches.
4. **Tamper-Evident Auditability:** Critical actions produce immutable log records tagged with correlation IDs.

---

## 2. Authentication & Session Strategy

- **Password Hashing:** Passwords are salted and hashed using `bcryptjs` with work factor 10.
- **Signed Tokens:** Authentication issues short-lived JWTs signed with `HS256` containing user ID, role claims, and institution scope.
- **Brute Force Protection:** Rate limiting applied to `/api/v1/auth/login`.

---

## 3. Cryptographic Identifier Fingerprinting

Direct storage or hashing of a predictable identifier (like a 12-digit number) is vulnerable to precomputed rainbow table attacks.

CREDEN implements **Keyed Salted HMAC-SHA256**:
```typescript
crypto.createHmac('sha256', config.hmacSecret).update(normalizedApaarId).digest('hex');
```
- The secret HMAC key resides exclusively in secure server environment variables.
- Enables deterministic duplicate matching across uploads without storing plaintext identifiers.
- Masked display format (`•••• •••• 9012`) prevents shoulder surfing and screen-scrape leakage.

---

## 4. Academic Verification Token Security

- Verification tokens are generated using 32 cryptographically secure random bytes (`crypto.randomBytes(32).toString('hex')`).
- Tokens are stored in the database exclusively as **SHA-256 hashes**.
- Tokens expire after 30 days and are revocable at any time by the student or issuing institution.
- Verification URLs never embed the student's name, email, or APAAR ID.

---

## 5. CSV Injection Safeguards

All exported CSV files sanitize user-supplied strings by escaping formula trigger characters (`=`, `+`, `-`, `@`) with a leading apostrophe (`'`), mitigating spreadsheet formula execution attacks in Microsoft Excel and Google Sheets.

