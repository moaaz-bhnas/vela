# Cursor Medusa Prompt Pack

Use these copy-paste prompts in Cursor to get high-quality, Medusa-specific output quickly.

## 1) Backend Feature (Module + API + Workflow)

```text
You are helping in a Medusa v2 backend project.

Goal:
Build <FEATURE> end-to-end as a Medusa custom module.

Context:
- Medusa version: 2.x
- Keep existing architecture/style
- Prefer minimal, production-safe changes
- Do not break existing APIs

Tasks:
1) Create/update module data model(s) for <FEATURE>.
2) Add service/repository logic following Medusa patterns.
3) Add API routes for create/read/update/delete as needed.
4) Add workflow(s)/hooks where business logic is multi-step.
5) Wire validation and error handling.
6) Add migration notes + commands to run.

Output format:
- First: implementation plan (short)
- Then: file-by-file diff-style explanation
- Then: test plan (manual + edge cases)
- Then: rollback strategy if migration fails

Also verify:
- DI/container usage
- module links (if needed)
- idempotency for write operations
- pagination/filtering for list endpoints
```

## 2) Admin Widget / Dashboard Customization

```text
Implement an Admin dashboard customization in Medusa for <ENTITY>.

Goal:
Add a widget/page that allows admin users to <ACTION> on <ENTITY>.

Requirements:
- Follow Medusa admin extension patterns
- Use existing UI components/styles where possible
- Handle loading/empty/error/success states
- Keep UX clear and minimal

Tasks:
1) Add widget/page entry point in admin extension.
2) Fetch data from backend route(s).
3) Implement mutation actions with optimistic or safe refresh.
4) Add validation and clear error messaging.
5) Ensure permissions/role assumptions are explicit.

Output:
- File-by-file changes
- Why each change is needed
- QA steps for admin user
- Potential regressions
```

## 3) Storefront Integration (Next.js + Medusa)

```text
Integrate <CUSTOM BACKEND FEATURE> into my Next.js storefront.

Context:
- Use Medusa storefront best practices
- Keep SSR/CSR behavior consistent with existing app
- Avoid breaking cart/checkout flows

Tasks:
1) Add data-fetching layer for <FEATURE> (SDK/API route).
2) Build UI in <PAGE/COMPONENT>.
3) Handle loading, empty, error states.
4) Add pagination/filter/sort if relevant.
5) Ensure type safety and predictable caching/revalidation.

Output:
- Implementation plan
- Exact files to update
- Any env/config needed
- Manual test checklist
- Performance/accessibility notes
```

## 4) Bug Fix Prompt (Root Cause First)

```text
Fix this issue in my Medusa project:

Issue:
<DESCRIBE BUG + REPRO STEPS>

Rules:
- Find root cause first
- Prefer smallest safe patch
- Do not refactor unrelated code
- Preserve backward compatibility

Please provide:
1) Root cause analysis
2) Minimal patch plan
3) File-level changes
4) Regression risks
5) Verification steps (including edge cases)
```

## 5) Code Review Prompt (High Signal)

```text
Review my current changes with a Medusa-focused lens.

Focus on:
- Behavioral regressions
- Broken module boundaries
- Wrong workflow usage
- API contract drift
- Admin/storefront integration mismatches
- Missing validation/authorization
- Migration/data integrity risks

Output format:
1) Findings first, ordered by severity
2) For each finding: impact + where + fix suggestion
3) Missing tests checklist
4) Brief summary at the end
```

## 6) Safe Migration Prompt

```text
I need to introduce schema changes for <FEATURE> safely.

Please:
1) Propose migration strategy (forward-only, no destructive assumptions).
2) Highlight data backfill requirements.
3) Provide command sequence for local + staging.
4) Include rollback/mitigation plan.
5) List pre-deploy and post-deploy checks.

Assume production data exists and downtime must be minimized.
```

## 7) New Feature PR Assistant Prompt

```text
I finished implementing <FEATURE>. Prepare a PR-quality review package.

Include:
- concise PR title options
- PR description (summary + test plan + risk)
- changed endpoints/contracts
- migration/env changes
- QA checklist
- follow-up tasks (if any)

Keep it concrete and based on actual code changes.
```

## 8) Learning Mode (Guided)

```text
Teach me how to implement <FEATURE> in Medusa step-by-step.

I want:
- small steps with checkpoints
- explain why each step matters
- ask me to confirm before next step
- include common mistakes
- include how admin and storefront consume this feature
```

## 9) Reusable Task Brief Header

```text
Task Brief:
- Goal:
- Current behavior:
- Desired behavior:
- Constraints:
- Affected areas (backend/admin/storefront):
- Definition of done:
```

## 10) Default Power Prompt

```text
Medusa v2 task in this repo. Use Medusa-specific best practices, keep changes minimal and production-safe, and align with existing patterns.

Before coding:
- state assumptions
- show short plan

Then implement with:
- file-by-file changes
- why each change is needed
- risks/regressions
- exact run/test commands
- manual QA checklist

If anything is ambiguous, ask targeted clarification questions before making broad changes.
```
