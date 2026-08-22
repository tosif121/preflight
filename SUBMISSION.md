# Build What Moves India — Submission

## Project: Preflight

### 250-Word Summary

Citizens applying for government services through UMANG face a painful cycle: gather documents, submit online, wait days for review, get rejected for a missing name mismatch or expired certificate, then repeat the entire process. The problem isn't lack of services — it's lack of quality assurance before submission.

Preflight is a pre-submission copilot that catches document errors before they reach the department. Citizens bring the documents they already have, and Preflight reads them using OpenAI Vision, extracts key information, and runs deterministic cross-checks against service-specific rules. When something is wrong — a name variation between an Aadhaar card and an income certificate, a missing bank passbook for pension disbursement, or a low-quality scan — Preflight explains the issue in plain language and tells the citizen exactly what to fix.

The product focuses on one flawless citizen journey: tell Preflight what you need, add your existing documents, run checks, fix what's flagged, re-check, and continue with confidence. No government jargon, no rule matrices, no ambiguity.

Under the hood, Preflight uses a real database of 36 Indian states and 612 services, OpenAI Vision for document understanding, a deterministic rule engine with 9 check implementations, and AI-generated plain-language fix instructions. The architecture supports state-specific rule packs at national scale while keeping the citizen experience simple.

Preflight doesn't replace government systems — it makes sure citizens arrive at the counter ready. The goal: fewer rejections, fewer wasted trips, more confident submissions.

### Demo Login

Enter **any 10-digit phone number** and **any 6-digit code** (e.g., 123456).

### Try the Demo

Click "Try 2-minute demo" on the dashboard or new application page. It creates a synthetic Widow Pension application with sample documents.

---

## 2-Minute Video Script

### Minute 1: Citizen Demo (0:00 – 1:00)

**[Screen: Landing page]**

"Meet Sunita. She needs to apply for a widow pension through UMANG. She's tried before but got rejected because her income certificate had her husband's name, not hers."

**[Screen: Sign-in modal]**

"She opens Preflight. Any phone number works for this demo."

**[Screen: New application wizard — intent step]**

"Preflight asks: what do you need help with? Sunita picks Widow Pension from the UMANG services."

**[Screen: Applicant details]**

"She enters her name — Sunita Devi — and continues."

**[Screen: Documents page]**

"Now the key moment. Preflight tells her exactly what documents she needs: identity proof, age proof, income proof, death certificate, bank proof, address proof, and a photo."

"She adds the documents she already has — using sample documents for this demo."

**[Screen: Documents processing]**

"Preflight reads each document using OpenAI Vision. It extracts names, dates, and amounts automatically."

**[Screen: Checks page]**

"She runs Preflight. It finds a name mismatch — her income certificate says 'Sunita Devi' but her Aadhaar says 'Sunita Devi Sharma.' That's exactly the kind of error that causes rejections."

**[Screen: Fix suggestion]**

"Preflight explains the issue and tells her what to do. She reviews the document."

**[Screen: Re-check — before/after]**

"She re-checks. The issue is resolved. All 7 checks pass."

### Minute 2: How It Works (1:00 – 2:00)

**[Screen: Architecture diagram or code]**

"Preflight has three layers:

**First, document understanding.** We use OpenAI Vision to read government documents — Aadhaar cards, income certificates, bank passbooks. The model extracts structured information from each document.

**Second, a deterministic rule engine.** Each service has its own rule pack — name consistency, income coverage, age eligibility, bank proof presence. These are pure functions that compare extracted data against requirements. No AI hallucination in the rules.

**Third, AI-generated guidance.** When a check fails, we use OpenAI to explain the issue in plain language and suggest specific fixes. Citizens don't see rule IDs or technical terms.

The architecture scales to all 36 Indian states and 612 services. Rule packs are decoupled from the engine — they're JSON documents that can be verified, updated, or auto-generated from templates.

Preflight doesn't replace government systems. It makes sure citizens arrive at the counter ready."
