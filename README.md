# Preflight

**Pre-submission copilot for UMANG — your government application quality checker**

Citizens applying for government services face a painful cycle: gather documents, submit online, wait for review, get rejected for a missing name mismatch or expired certificate, then repeat. Preflight catches these errors **before** submission, explains issues in plain language, and guides citizens through fixing them.

Built for [Build What Moves India](https://buildwhatmovesindia.com/brief) hackathon.

---

## What It Does

```
Tell Preflight what you need
        ↓
Bring the documents you already have
        ↓
AI reads and extracts information
        ↓
Deterministic rules find problems
        ↓
Plain-language explanations + fixes
        ↓
Re-check → Ready to continue
```

**Demo login:** Enter any 10-digit phone number + any 6-digit code (e.g., 123456).

**Try the demo:** Click "Try 2-minute demo" on the dashboard.

## Architecture

```
Synthetic Documents (SVGs)
        ↓
OpenAI Vision OCR  ← real when OPENAI_API_KEY set, deterministic mock otherwise
        ↓
Normalizer          ← formatting-only, never resolves factual disagreements
        ↓
Rule Pack (JSON — verified for Rajasthan, auto-generated for all other states)
        ↓
Preflight Evaluation (pure function — 9 check implementations)
        ↓
Fix Plan (AI resolution in plain language)
        ↓
Re-check → Ready to continue
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (terracotta palette) |
| Icons | lucide-react exclusively |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle ORM + `@neondatabase/serverless` (neon-http driver) |
| Validation | Zod at every API boundary |
| AI | OpenAI SDK (vision + text models) |
| Storage | S3-compatible (Neon Storage or AWS S3) for uploaded documents |
| Toasts | react-hot-toast |

## Getting Started

### Quick Start (Demo)

1. Visit the deployed app
2. Enter any phone number + any 6-digit OTP
3. Click "Try 2-minute demo"
4. Walk through: Documents → Checks → Fix → Ready

### Local Development

- Node.js 18+
- A [Neon](https://console.neon.tech) Postgres database
- (Optional) An [OpenAI API key](https://platform.openai.com/api-keys) — the app works fully without it using deterministic mocks
- (Optional) S3 bucket for document storage — works without it using local fallback

### Setup

```bash
git clone https://github.com/tosif121/preflight.git
cd preflight
npm install
```

### Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

```
DATABASE_URL=postgresql://...     # Neon connection string
OPENAI_API_KEY=sk-...             # optional — unset = mock mode
S3_BUCKET=bucket-name             # optional — S3 bucket for document storage
S3_ENDPOINT=https://...           # optional — S3 endpoint (e.g., Neon Storage)
S3_ACCESS_KEY_ID=...              # optional — S3 access key
S3_SECRET_ACCESS_KEY=...          # optional — S3 secret key
S3_REGION=us-east-2               # optional — S3 region
```

### Database

Push the schema to Neon:

```bash
npx drizzle-kit push
```

Seed the database with all 36 states, 612 services, and rule packs:

```bash
curl http://localhost:3000/api/seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Landing — UMANG copilot positioning, flow visual, OpenAI badge |
| `/dashboard` | Application list with "Your next action" card, UMANG context |
| `/applications/new` | Intent-first wizard: What do you need? → State → Details → Family → Review |
| `/applications/[id]/documents` | "Bring your existing documents" — readiness summary, sample docs, OpenAI Vision |
| `/applications/[id]/checks` | Preflight results — claim/evidence/rule/result, AI-generated fixes |
| `/applications/[id]/packet` | Application packet — review & mock submit |
| `/reviewer-gateway/[id]` | Prototype reviewer view — read-only audit trail |

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/states` | List all 36 states/UTs |
| `GET` | `/api/states/[stateId]/services` | List services for a state |
| `GET` | `/api/services/[serviceId]` | Service detail |
| `GET` | `/api/services/[serviceId]/rule-pack` | Rule pack for a service |
| `POST` | `/api/applications` | Create application + family members |
| `GET` | `/api/applications` | List all applications |
| `GET` | `/api/applications/[id]` | Full detail (members, docs, checks, resolutions, audit) |
| `POST` | `/api/applications/[id]/documents` | Upload mock document + trigger OCR |
| `GET` | `/api/applications/[id]/documents` | List documents for an application |
| `GET` | `/api/applications/[id]/documents/[docId]/view` | View/retrieve document (S3 presigned URL) |
| `POST` | `/api/applications/[id]/family-members` | Add family member |
| `POST` | `/api/applications/[id]/evaluate` | Run preflight checks |
| `POST` | `/api/applications/[id]/resolve` | Resolve a failed check |
| `POST` | `/api/applications/[id]/recheck` | Re-run checks after resolution |
| `POST` | `/api/applications/[id]/submit` | Mock submit |
| `GET` | `/api/mock-docs` | List available mock documents for upload |
| `POST` | `/api/upload/presign` | Generate S3 presigned URL for upload |
| `GET` | `/api/auth/verify` | Verify phone + OTP, create session |
| `GET` | `/api/auth/me` | Get current user from session |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` | `/api/reviewer/applications` | List submitted applications (reviewer) |
| `GET` | `/api/reviewer/applications/[id]` | Full detail for reviewer |

Every route validates input with Zod and logs events via the audit repository.

## Project Structure

```
src/
├── app/                              # App Router pages + API routes
│   ├── (operator)/                   # Operator-facing pages
│   │   ├── applications/
│   │   │   ├── new/                  # Step 1: create application
│   │   │   └── [id]/
│   │   │       ├── documents/        # Step 2: upload documents
│   │   │       ├── checks/           # Step 3: preflight checks
│   │   │       └── packet/           # Step 4: review & submit
│   │   └── dashboard/                # Application list
│   ├── (reviewer)/                   # Reviewer gateway
│   └── api/                          # API route handlers (28 endpoints)
├── components/
│   ├── landing/                      # Landing page sections
│   ├── sign-in-modal.tsx             # Phone + OTP sign-in modal
│   ├── app-shell.tsx                 # Session-based auth shell
│   └── ui/                           # shadcn/ui components
└── lib/
    ├── ai/                           # OCR + resolution services
    ├── auth/                         # Session management (cookie-based)
    ├── db/                           # Drizzle schema, connection, seed
    ├── repositories/                 # Data access layer (12 files)
    ├── rules/                        # Rule engine + category templates
    │   ├── engine.ts                 # 9 check implementations
    │   └── templates/                # Auto-generation templates for catalog
    ├── schemas/                      # Zod validation schemas
    ├── s3.ts                         # S3 client for document storage
    └── normalizer.ts                 # OCR output normalizer
```

## Database Schema (12 tables)

| Table | Purpose |
|---|---|
| `states` | 36 states/UTs with portal names |
| `services` | 612 services (17 per state) — all fully available |
| `rule_packs` | Verification rules per service (auto-generated from templates) |
| `operators` | Registered operators (phone + name) |
| `otp_codes` | OTP verification codes |
| `sessions` | Auth sessions (cookie-based) |
| `applications` | Application records |
| `family_members` | Family member entries per application |
| `documents` | Uploaded documents with OCR data + S3 keys |
| `preflight_checks` | Check results per application |
| `resolutions` | AI-generated fix instructions per failed check |
| `audit_events` | Full audit trail per application |

## Rule Engine — 9 Check Implementations

| Check | Severity | Description |
|---|---|---|
| `name_consistency` | Blocker | Name on identity proof must match income proof and application |
| `address_consistency` | Warning | Address on identity proof should match address proof |
| `income_coverage` | Blocker | Every earning family member needs an income proof document |
| `certificate_use_by_date` | Blocker | Intended use deadline must be within 12 months |
| `document_quality` | Warning | OCR confidence should be above 0.75 |
| `lineage_reference_present` | Blocker | Prior caste certificate or community reference required |
| `age_eligibility` | Blocker | Applicant age must fall within eligibility band |
| `income_ceiling` | Warning | Income must be below pension/welfare threshold |
| `bank_account_proof_present` | Blocker | Bank account proof required for pension disbursement |

## Service Catalog — 36 States × 17 Services

All 36 states and union territories are seeded with 17 services each (612 total), all fully available:

| Service | Category | Template |
|---|---|---|
| Income Certificate | Certificate | Standard certificate template |
| Caste Certificate | Certificate | Certificate + lineage reference |
| Domicile Certificate | Certificate | Certificate + residence proof |
| Birth Certificate | Certificate | Vital event template |
| Death Certificate | Certificate | Vital event template |
| Marriage Certificate | Certificate | Standard certificate template |
| EWS Certificate | Certificate | Standard certificate template |
| Non-Creamy Layer Certificate | Certificate | Standard certificate template |
| Agriculturist Certificate | Certificate | Standard certificate template |
| Disability Certificate | Certificate | Standard certificate template |
| Widow Pension | Pension | Pension + death certificate + bank proof |
| Old Age Pension | Pension | Pension + age proof + bank proof |
| Disability Pension | Pension | Pension + disability certificate + bank proof |
| Ration Card | Welfare | Welfare registration template |
| Scholarship Application | Welfare | Welfare registration template |
| Driving License | Certificate | Standard certificate template |
| Trade License | Certificate | Standard certificate template |

**Rajasthan Family Income Certificate** has a hand-researched, production-ready rule pack. All other services use auto-generated rule packs from category templates with placeholder thresholds.

## Mock vs Real

| Component | Status |
|---|---|
| Database (Neon) | **Real** |
| OCR extraction | **Real** with `OPENAI_API_KEY`; deterministic mock otherwise |
| Normalizer | **Real** (pure formatting logic) |
| Rule engine | **Real** (pure evaluation against JSON rule pack) |
| Resolution AI | **Real** with key; canned mock responses otherwise |
| Document storage | **Real** S3-compatible storage (Neon Storage or AWS S3) |
| Government submit | **Mock** (labeled in UI) |
| Payment (₹40 fee) | **Mock** (labeled in UI) |
| Auth (OTP/SMS) | **Simplified** (any 6-digit OTP accepted for demo) |
| Documents | **Synthetic** (SVGs with fake data, "SAMPLE" watermark) |

## Key Conventions

- **Repository pattern** — no raw Drizzle queries in route handlers; 12 repository files
- **Zod validation** — every API input parsed with `.safeParse()`, 400 on failure
- **No real personal data** — all documents are synthetic with masked IDs
- **Advisory only** — never claims "verified", always "preflight checks completed"
- **No declarations/affidavits** — only fix instructions
- **Category templates** — auto-generate rule packs for new services/states
- **S3 storage** — documents stored in S3-compatible storage, presigned URLs for access

## License

Hackathon prototype — not for production use.

Independent hackathon prototype — not affiliated with any government body.

---

## Submission

**Project:** Preflight — Pre-submission copilot for UMANG
**Hackathon:** [Build What Moves India](https://buildwhatmovesindia.com/brief)
**Demo:** [Live link](https://preflight-tosif121s-projects.vercel.app/)
**Login:** Any phone number + any 6-digit code
**Summary + Video script:** See [SUBMISSION.md](./SUBMISSION.md)
