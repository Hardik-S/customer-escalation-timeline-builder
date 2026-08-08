# Customer Escalation Timeline Builder

Customer Escalation Timeline Builder is a fixture-first React tool that turns synthetic ticket, email, and call-note evidence into a chronological escalation narrative, a commitment ledger, and a save-the-account prep brief.

## Portfolio Signal

The product shows customer-operations judgment: it reconstructs what happened, who promised what, what dates slipped, and which owner ambiguity must be resolved before an escalation call. The first slice is intentionally deterministic so the workflow, source boundaries, and tests are auditable without API keys.

## Synthetic Data Boundary

All accounts, people, tickets, emails, call notes, dates, and commitments are invented. Do not paste real customer, support, or personal data into this static demo. The current implementation is public because it contains no credentials, private business logic, or real customer information.

## Stack Rationale

- Vite + React + TypeScript keeps the customer-ops workbench fast and deployable as a static public demo.
- Typed local fixtures make provenance visible and avoid hidden model behavior.
- Vitest covers timeline ordering, missed-date detection, and owner ambiguity before UI polish.
- Plain CSS is used because the first slice needs a focused workbench, not a component-system dependency.

## Local Setup

```powershell
npm ci
npm run test -- --run
npm run build
npm run preview
```

## File Map

- `src/data/escalation.ts`: synthetic ticket, email, and call-note evidence for one account escalation.
- `src/lib/escalation.ts`: deterministic timeline, commitment, and prep-brief logic.
- `src/lib/escalation.test.ts`: behavior tests for the first slice.
- `src/App.tsx`: workbench composition and source-backed UI.
- `src/styles.css`: responsive product styling.

## Decision Log

- Built one complete account escalation instead of a broad support dashboard so the demo produces a manager-ready artifact.
- Kept every commitment tied to source IDs so the UI can explain why an item is unresolved or ambiguous.
- Treated owner ambiguity as a first-class risk because escalation prep often fails when accountability is assumed but not named.
- Parsed both `by` and `before` deadline language because customer commitments often use either phrase to describe the same recovery date.
- Kept prep-brief risk wording count-aware so singular evidence does not make the generated manager summary look machine-assembled.
- Parse abbreviated and full month names across the calendar year while keeping
  the synthetic fixture year fixed at 2026. This preserves deterministic tests
  without letting later recovery commitments such as June steering-review tasks
  lose their due dates.
- Preserve comma-formatted deadline times, such as `June 3, 09:30`, because
  customer-facing recovery notes often include natural punctuation around
  executive checkpoint times.
- Preserve natural-language time separators, such as `June 4 at 10:15`,
  because copied customer notes often state checkpoint times conversationally.
- Parse `no later than` deadline phrasing because escalation recovery notes
  often frame a due date as the latest acceptable customer-facing time.
- Recognize `will`-phrased owner commitments, such as `CSM will send ...`,
  because customer-facing recovery notes often use promise language instead of
  task-list wording.
- Accept tiered support owner names, such as `L2 Support`, because escalation
  notes commonly assign recovery evidence to numbered operational teams.
- Accept joint owner names, such as `CSM & Support`, because pasted recovery
  notes often assign one customer-facing commitment to a shared pairing.
- Accept plus-separated joint owner names, such as `CSM + Support`, because
  copied customer recovery notes often use spreadsheet-style team pairings.
- Accept ordinal date copy, such as `June 4th 10:15`, so pasted customer
  commitments keep their explicit recovery time instead of falling back to the
  fixture end-of-day default.
- Accept EOD deadline shorthand, such as `by EOD June 4`, so customer-facing
  recovery packets keep a due date instead of appearing unresolved.
- Parse task-style due-date phrasing, such as `due June 4 16:00`, because
  copied recovery checklists often omit `by` or `before` language.
- Reject impossible copied deadline dates instead of letting JavaScript roll
  them into later months. A malformed customer commitment should remain
  unresolved without showing a fabricated due date.
- Avoided live AI in the first slice; later GPT behavior should move behind a server route and preserve this deterministic evidence trail.

## Verification

The expected verification path is `npm ci`, `npm run test -- --run`, `npm run build`, and a local preview smoke check for the timeline and commitment ledger.

## Deployment

Production is deployed on Vercel at https://customer-escalation-timeline-builde.vercel.app. The alias is intentionally recorded because the first deploy used an explicit project name after the Vercel CLI rejected the long worktree-derived auto name.
