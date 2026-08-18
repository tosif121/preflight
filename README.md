# Preflight

**Pre-submission quality checker for the Rajasthan Family Income Certificate (eMitra)**

Preflight catches completeness and consistency problems in Family Income Certificate applications **before** they reach the department. It explains issues in plain language and produces a clean "ready" packet — never claiming official verification; final authority stays with the Tehsildar.

---

## Architecture

```
Synthetic Documents (SVGs)
        ↓
OpenAI Vision OCR  ← real when OPENAI_API_KEY set, deterministic mock otherwise
        ↓
Normalizer          ← formatting-only, never resolves factual disagreements
        ↓
Rajasthan Rule Pack (JSON)
        ↓
Preflight Evaluation (pure function)
        ↓
Fix Plan (AI resolution, canned mock fallback)
        ↓
Re-check (operator marks resolved, re-runs checks)
        ↓
Reviewer Gateway (read-only evidence trail)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (terracotta palette) |
| Icons | lucide-react |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle ORM + `@neondatabase/serverless` |
| Validation | Zod at every API boundary |
| AI | OpenAI SDK (vision + text models) |
| Toasts | react-hot-toast |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://console.neon.tech) Postgres database
- (Optional) An [OpenAI API key](https://platform.openai.com/api-keys) — the app works fully without it using deterministic mocks

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
```

### Database

Push the schema to Neon:

```bash
npx drizzle-kit push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — Hero, How It Works, Features, FAQ, Footer |
| `/dashboard` | Application list with status badges |
| `/applications/new` | Step 1: select service, enter citizen + family member info |
| `/applications/[id]/documents` | Step 2: upload mock documents per member |
| `/applications/[id]/checks` | Step 3: run preflight checks, resolve blockers |
| `/applications/[id]/packet` | Step 4: review packet, mock submit |
| `/reviewer-gateway/[id]` | Prototype reviewer view — audit evidence trail |

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/applications` | List all applications |
| `POST` | `/api/applications` | Create application + family members |
| `GET` | `/api/applications/[id]` | Full detail (members, docs, checks, resolutions, audit) |
| `POST` | `/api/applications/[id]/documents` | Upload mock document + trigger OCR |
| `POST` | `/api/applications/[id]/run-checks` | Normalize + evaluate rule engine |
| `POST` | `/api/applications/[id]/checks/[checkId]/resolve` | Resolve a failed check |
| `POST` | `/api/applications/[id]/submit` | Mock submit |

Every route validates input with Zod and logs events via the audit repository.

## Project Structure

```
src/
├── app/                              # App Router pages + API routes
│   ├── (operator)/                   # Operator-facing pages
│   ├── (reviewer)/                   # Reviewer gateway
│   └── api/                          # API route handlers
├── components/
│   ├── landing/                      # Landing page sections
│   └── ui/                           # shadcn/ui components
└── lib/
    ├── ai/                           # OCR + resolution services
    ├── db/                           # Drizzle schema + connection
    ├── repositories/                 # Data access layer (6 files)
    ├── rules/                        # Rule engine + JSON rule pack
    ├── schemas/                      # Zod validation schemas
    └── types/                        # TypeScript interfaces
public/
└── mock-docs/                        # 9 synthetic SVG documents
```

## Mock vs Real

| Component | Status |
|---|---|
| Database (Neon) | **Real** |
| OCR extraction | **Real** with `OPENAI_API_KEY`; deterministic mock otherwise |
| Normalizer | **Real** (pure formatting logic) |
| Rule engine | **Real** (pure evaluation against JSON rule pack) |
| Resolution AI | **Real** with key; canned mock responses otherwise |
| Government submit | **Mock** (labeled in UI) |
| Payment (₹40 fee) | **Mock** (labeled in UI) |
| Documents | **Synthetic** (SVGs with fake data, "SAMPLE" watermark) |

## Preflight Checks

The Rajasthan Family Income Certificate rule pack runs 5 checks:

| Check | Severity | Description |
|---|---|---|
| `name_consistency` | Blocker | Name on identity proof must match income proof and application |
| `address_consistency` | Warning | Address on identity proof should match address proof |
| `income_coverage` | Blocker | Every earning family member needs an income proof document |
| `certificate_use_by_date` | Blocker | Intended use deadline must be within 12 months |
| `document_quality` | Warning | OCR confidence should be above 0.75 |

## Key Conventions

- **Repository pattern** — no raw Drizzle queries in route handlers
- **Zod validation** — every API input parsed with `.safeParse()`, 400 on failure
- **No real personal data** — all documents are synthetic with masked IDs
- **Advisory only** — never claims "verified", always "preflight checks completed"
- **No declarations/affidavits** — only fix instructions

## License

Hackathon prototype — not for production use.
