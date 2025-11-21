# Security Guide

## Table of Contents

1. [Open Source vs Open Access](#open-source-vs-open-access)
2. [What's Public (Safe to Share)](#whats-public-safe-to-share)
3. [What's Private (Keep Secret)](#whats-private-keep-secret)
4. [How Your Data is Protected](#how-your-data-is-protected)
5. [Access Control](#access-control)
6. [Security Best Practices](#security-best-practices)
7. [Reporting Security Issues](#reporting-security-issues)

---

## Open Source vs Open Access

### Your Code is Public ✅
**Anyone on GitHub can:**
- ✅ View your source code
- ✅ See how the app works
- ✅ Fork the repository
- ✅ Learn from your implementation

**Why this is safe:**
- Your code contains **NO passwords or secrets**
- All credentials are stored as environment variables (not in code)
- GitHub ignores `.env` files (via `.gitignore`)

### Your App is Private 🔒
**Only whitelisted users can:**
- 🔒 Register for an account
- 🔒 Access the application
- 🔒 View or create events
- 🔒 See any user data

**Why this is secure:**
- Email whitelist enforced on backend
- Database credentials never exposed
- JWT authentication required for all API calls

---

## What's Public (Safe to Share)

These are visible in your GitHub repository and **cannot be used** to access your data:

### ✅ Source Code
- React components
- Express API routes
- Database schema (table structure)
- TypeScript types and interfaces

### ✅ Configuration Templates
- `.env.example` files (templates with fake values)
- `vite.config.ts` (build configuration)
- `package.json` (dependencies list)
- `render.yaml` (deployment configuration)

### ✅ Documentation
- README.md
- DEPLOYMENT.md
- SECURITY.md (this file)
- CODE_OF_CONDUCT.md

**Analogy**: Publishing your house blueprints. People can see the design, but they can't enter without keys.

---

## What's Private (Keep Secret)

These are stored as **environment variables** and **NEVER committed to GitHub**:

### 🔒 Database Credentials
**File**: Not in repository (Render environment variables only)

```bash
DATABASE_URL=postgresql://user:password@host/dbname  # NEVER COMMIT THIS
```

**Who has access:**
- ✅ You (Neon dashboard)
- ✅ Your backend server (Render environment variables)
- ❌ Anyone viewing your GitHub code

**Protection**: Neon connection requires exact connection string. No one can access your database without it.

---

### 🔒 JWT Secret
**File**: Not in repository (Render environment variables only)

```bash
JWT_SECRET=your-secret-key-here  # NEVER COMMIT THIS
```

**Who has access:**
- ✅ Your backend server (Render environment variables)
- ❌ Anyone viewing your GitHub code
- ❌ Frontend users (never sent to client)

**Protection**: Used to sign authentication tokens. Without this secret, no one can forge valid login tokens.

---

### 🔒 Email Whitelist
**File**: Not in repository (Render environment variables only)

```bash
ALLOWED_EMAILS=admin@example.com,user@example.com  # NEVER COMMIT THIS
```

**Who has access:**
- ✅ You (Render dashboard)
- ✅ Your backend server (Render environment variables)
- ❌ Anyone viewing your GitHub code

**Protection**: Only these emails can register. Backend rejects all other registration attempts.

---

### 🔒 User Data
**Storage**: Neon PostgreSQL database

**What's stored:**
- User accounts (email, hashed password, name)
- Events (title, date, description, category, etc.)
- Categories (name, color)

**Who has access:**
- ✅ You (Neon dashboard SQL editor)
- ✅ Your backend API (via DATABASE_URL)
- ✅ Logged-in users (via JWT authentication - their own data only)
- ❌ Anyone viewing your GitHub code
- ❌ Public internet (database not publicly accessible)

**Protection**:
- Passwords hashed with bcrypt (never stored as plain text)
- Database uses SSL encryption (`sslmode=require`)
- No direct database access from frontend
- All queries use parameterized statements (prevents SQL injection)

---

## How Your Data is Protected

### 1. Email Whitelist (Registration Control)

**Location**: `backend/src/middleware/emailWhitelist.ts`

```typescript
// Checks if email is in ALLOWED_EMAILS before registration
// Unauthorized users get 403 Forbidden error
```

**How it works:**
1. User tries to register with email
2. Backend checks if email is in `ALLOWED_EMAILS` environment variable
3. If not found → Registration rejected with 403 error
4. If found → Registration proceeds

**To add new users:**
1. Go to Render dashboard
2. Click your service → Environment
3. Edit `ALLOWED_EMAILS` variable
4. Add email to comma-separated list
5. Save (service auto-redeploys)

---

### 2. JWT Authentication (Access Control)

**Location**: `backend/src/middleware/auth.ts`

```typescript
// All API endpoints require valid JWT token
// Token expires after 24 hours
```

**How it works:**
1. User logs in with email/password
2. Backend verifies credentials
3. Backend generates JWT token (signed with `JWT_SECRET`)
4. Frontend stores token in localStorage
5. All API requests include token in `Authorization` header
6. Backend verifies token signature before processing request

**Why this is secure:**
- Tokens expire after 24 hours (user must re-login)
- Tokens signed with `JWT_SECRET` (can't be forged without secret)
- Invalid tokens get 401 Unauthorized error

---

### 3. Password Hashing (Credential Protection)

**Location**: `backend/src/services/UserService.ts`

```typescript
// Passwords hashed with bcrypt before storage
// Original password never stored
```

**How it works:**
1. User registers with password `mypassword123`
2. Backend hashes it with bcrypt → `$2b$10$abc...xyz` (irreversible)
3. Only hash is stored in database
4. On login, backend hashes entered password and compares hashes

**Why this is secure:**
- Even if database is compromised, attackers can't get original passwords
- bcrypt uses salt (prevents rainbow table attacks)
- Hashing is one-way (can't reverse hash to get password)

---

### 4. CORS Protection (Cross-Origin Requests)

**Location**: `backend/src/server.ts`

```typescript
// Only frontend URL allowed to make API requests
// Other websites blocked
```

**How it works:**
1. Browser sends request to backend from `https://your-username.github.io`
2. Backend checks `CORS_ORIGIN` environment variable
3. If URL matches → Request allowed
4. If URL doesn't match → Request blocked

**Why this is secure:**
- Prevents malicious websites from calling your API
- Only your frontend can make requests

---

### 5. Rate Limiting (Brute-Force Prevention)

**Location**: `backend/src/server.ts`

```typescript
// Maximum 100 requests per 15 minutes per IP
// Prevents password guessing attacks
```

**How it works:**
1. User makes API request
2. Backend tracks requests per IP address
3. If > 100 requests in 15 minutes → Block with 429 error
4. After 15 minutes → Counter resets

**Why this is secure:**
- Prevents automated password guessing
- Limits API abuse

---

## Access Control

### Who Can Access What?

| Resource | Public | Whitelisted Users | Your Backend | You (Admin) |
|----------|--------|-------------------|--------------|-------------|
| Source Code | ✅ GitHub | ✅ GitHub | N/A | ✅ GitHub |
| Live App URL | ✅ Visit | ✅ Login | N/A | ✅ Login |
| Register Account | ❌ No | ✅ If whitelisted | N/A | ✅ Yes |
| View Events | ❌ No | ✅ If logged in | ✅ All | ✅ All |
| Database | ❌ No | ❌ No | ✅ Read/Write | ✅ Full Access |
| Env Variables | ❌ No | ❌ No | ✅ Can read | ✅ Can edit |

---

## Security Best Practices

### ✅ DO

1. **Use strong passwords**
   - Minimum 8 characters (enforced by app)
   - Use password manager

2. **Keep email whitelist updated**
   - Only add trusted users
   - Remove users who no longer need access

3. **Rotate JWT_SECRET periodically**
   - Change JWT_SECRET every 6-12 months
   - All users will need to re-login after rotation

4. **Monitor Render logs**
   - Check for suspicious activity
   - Review failed login attempts

5. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update packages with security patches

### ❌ DON'T

1. **Never commit `.env` files**
   - Always use `.env.example` templates
   - Keep actual `.env` in `.gitignore`

2. **Never share DATABASE_URL**
   - Don't post in public forums
   - Don't send via unencrypted email

3. **Never share JWT_SECRET**
   - Don't commit to GitHub
   - Don't share with users

4. **Don't add untrusted emails to whitelist**
   - Only add people you know
   - Email = access to your app

5. **Don't store sensitive data in events**
   - No credit card numbers
   - No social security numbers
   - No passwords

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT open a public GitHub issue**
2. Email the repository owner directly
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

---

## Summary: Your Security Model

```
┌─────────────────────────────────────────────┐
│          PUBLIC (GitHub Repository)          │
│  ✅ Source code                              │
│  ✅ How app works                            │
│  ✅ Database schema                          │
│  ❌ NO passwords                             │
│  ❌ NO database credentials                  │
│  ❌ NO user data                             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         PRIVATE (Environment Variables)      │
│  🔒 DATABASE_URL (Neon)                     │
│  🔒 JWT_SECRET (Render)                     │
│  🔒 ALLOWED_EMAILS (Render)                 │
│  🔒 Stored in Render dashboard only         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         PROTECTED (User Data)                │
│  🔒 User accounts (Neon database)           │
│  🔒 Events & categories (Neon database)     │
│  🔒 Passwords hashed with bcrypt            │
│  🔒 Only accessible via JWT authentication  │
└─────────────────────────────────────────────┘
```

**Bottom Line**: Your code is open source, but your data is fully protected. No one can access your app or database without your explicit permission (via email whitelist).
