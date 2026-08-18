<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Preflight — Project Agent Rules

## What This Is

Preflight is an application-quality preflight tool for the Rajasthan Family
Income Certificate (issued via eMitra). It catches completeness/consistency
problems BEFORE submission, explains them in plain language, and produces a
clean "ready" packet. It never claims official verification — final authority
always stays with the department (Tehsildar).

## Architecture Flow

```
Synthetic Documents (SVGs in /public/mock-docs/)
        ↓
OpenAI Vision OCR  ← REAL (falls back to deterministic mocks if no OPENAI_API_KEY)
        ↓
Normalizer         ← REAL (formatting-only, never resolves factual disagreements)
        ↓
Rajasthan Rule Pack (JSON in /lib/rules/rajasthan/family-income.json)
        ↓
Preflight Evaluation (pure function in /lib/rules/engine.ts)
        ↓
Fix Plan (AI resolution in /lib/ai/resolution.ts, falls back to canned mock responses)
        ↓
Re-check (operator marks resolved, re-runs checks)
        ↓
Reviewer Gateway (/reviewer-gateway/[id]) ← REAL prototype, read-only evidence trail
```

## Tech Stack

- **Framework**: Next.js 16, App Router, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui (neutral base color)
- **Icons**: lucide-react exclusively — no other icon sets
- **Database**: Neon (serverless Postgres)
- **ORM**: Drizzle ORM with `@neondatabase/serverless` driver
- **Validation**: zod at every API input/output boundary
- **AI**: OpenAI SDK (vision model for OCR, text model for resolution)
- **Toasts**: react-hot-toast

## Data Access Pattern

**Strict repository pattern.** No raw Drizzle queries inside route handlers
or server actions. Every DB operation goes through a repository class in
`/lib/repositories/`. Route handlers and server actions call repositories only.

```
src/lib/repositories/
  applications.repository.ts
  family-members.repository.ts
  documents.repository.ts
  checks.repository.ts
  resolutions.repository.ts
  audit.repository.ts
```

## Environment Variables

```
DATABASE_URL    — Neon Postgres connection string (required for data)
OPENAI_API_KEY  — OpenAI API key (optional; unset = deterministic mock OCR/resolution)
```

## Mock vs Real Boundary

| Component          | Real / Mock |
|--------------------|-------------|
| Database (Neon)    | REAL        |
| OCR extraction     | REAL when `OPENAI_API_KEY` is set; deterministic mock fallback otherwise |
| Normalizer         | REAL (pure formatting logic) |
| Rule engine        | REAL (pure evaluation against JSON rule pack) |
| Resolution AI      | REAL when key set; canned mock responses otherwise |
| Government submit  | MOCK (labeled in UI) |
| Payment (₹40 fee)  | MOCK (labeled in UI) |
| OTP / SMS          | NOT IMPLEMENTED (out of scope) |
| Documents          | SYNTHETIC (SVGs with fake data, "SAMPLE — SYNTHETIC DOCUMENT" watermark) |

## Commands

```bash
npm run dev          # Start dev server
npx drizzle-kit push # Push schema to Neon
npx drizzle-kit generate  # Generate migrations
npm run build        # Production build
```

## Key Conventions

- Every API route validates input with zod `.safeParse()`, returns 400 on failure
- No unvalidated `request.json()` bodies — always parse through zod first
- Route params are a Promise — always `await params`
- Never use real Aadhaar/PAN numbers or real people's data anywhere
- Never generate declarations/affidavits — only fix instructions
- Never claim "verified" — only "preflight checks completed"
- All UI copy pairs "ready" states with the department-verification disclaimer
