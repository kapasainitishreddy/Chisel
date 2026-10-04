# Chisel Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Repair the actual build and complete feasible local features and backend lifecycle source.
**Architecture:** Extend existing small vanilla JavaScript modules, with explicit dependency boundaries and backwards-compatible local data. Native assets are generated from canonical www. Services remain opt-in and gated.
**Tech Stack:** Node test runner, vanilla JS, Capacitor 6.1.2, Android API 36, Supabase Deno/Postgres.
**Spec:** docs/superpowers/specs/2026-10-04-{foundation,progress-programs,privacy-exports,cloud-lifecycle}-design.md

## Global Constraints

- Preserve local free tools, the current photo-first theme, existing user data and anti-rating positioning.
- No external deployment, publishing, purchases or push. Never commit secrets.
- Use actual www source and sync to Android before verification.
- Never equate synthetic tests with live billing, output realism or measurement accuracy.
- User requests continuous completion without review questions; execute inline in branch work.

## Review Focus

- Corrupt imported data must never overwrite valid local data.
- Module failure must not cascade to independent privacy or local tools.
- Incompatible measurement versions must never imply confirmed progress.
- Repeated account cleanup must stay owner-bound and recoverable.
- Optional cloud or billing absence must not impair free local use.

### Task 1: Build and runtime foundation
**Files:** package.json, scripts/verify-build.cjs, www/chisel-runtime-loader.js, www/chisel-ar-coach-core.js, www/chisel-eyewear-fit.js, www/chisel-tryon-policy.js, www/index.html, tests/completion-foundation.test.cjs, tests/render-repair-browser.mjs, .github/workflows/android-mobile-build.yml.
**Interfaces:** ChiselRuntimeLoader.run(groups, load) -> result map; ChiselEyewearFit.fit(landmarks,width,height) -> accepted geometry; ChiselTryonPolicy.preview(kind) -> local guide disclosure.
- [ ] Add and run regressions for missing modules, invalid fitting inputs, loader failure isolation and build policy; expected RED.
- [ ] Implement tested module boundaries, frozen CI installs and separate signing job; run tests; expected GREEN.
- [ ] Sync assets; run full suite and syntax build; attempt native debug build; commit source.

### Task 2: Honest progress and adaptive programs
**Files:** www/index.html, www/chisel-progress-intelligence.js, www/chisel-programs.js, www/chisel-completion-ui.js, www/chisel-precision.js, tests/completion-programs.test.cjs.
**Interfaces:** ChiselPrograms.create(goal,days,now), toggle(state,task,now), pause(state,paused,now), view(state,now); ChiselProgressIntelligence.report(records) -> comparable per-metric changes.
- [ ] Add tests for 30/60/90 days, adherence, pause, invalid tasks, history version mismatch and removed rating surfaces; expected RED.
- [ ] Implement deterministic reviewed programs and version-aware reports, integrate visible controls; expected GREEN.
- [ ] Sync, run full suite and commit.

### Task 3: Archive and discussion exports
**Files:** www/chisel-private-archive.js, www/chisel-discussion-export.js, www/chisel-completion-ui.js, tests/completion-privacy.test.cjs.
**Interfaces:** ChiselPrivateArchive.encrypt(data,passphrase,crypto), decrypt(envelope,passphrase,crypto); ChiselDiscussionExport.render(kind,context) -> safe HTML.
- [ ] Add tests for encryption roundtrip, wrong password/tampering, bounded import, hostile notes and report limits; expected RED.
- [ ] Implement portable archive UI and printable reports, accurate lock scope and accessible deletion; expected GREEN.
- [ ] Sync, test and commit.

### Task 4: Account deletion and scheduled retention
**Files:** supabase/functions/account-lifecycle/{index.ts,handler.mjs}, supabase/functions/output-cleanup/index.ts, supabase/migrations/20261004000100_account_lifecycle.sql, www/chisel-credits-ui.js, tests/completion-lifecycle.test.cjs.
**Interfaces:** lifecycle handler injected verified identity and storage/database adapters; scheduled cleanup bounded service-only request.
- [ ] Add tests for anonymous/foreign account deletion, active jobs, storage failure and retries; expected RED.
- [ ] Implement authenticated handlers/migration and account deletion UI without enabling sales; expected GREEN.
- [ ] Run suite and static checks; commit. No deployment.

### Task 5: Whole-app acceptance and handoff
**Files:** tests/completion-browser.mjs, docs/AI_HANDOFF.md, FEATURE_MATRIX.md, TEST_STATUS.md, RELEASE_STATUS.md, CHANGE_REQUESTS.md, CHISEL_LAUNCH_GATE.md.
- [ ] Exercise real local UI, storage and archive/download controls in Chromium; separate fixtures from live checks.
- [ ] Verify a clean tracked checkout, full tests, syntax validation and native debug build where available.
- [ ] Request one fresh whole-branch review, fix important findings with regression tests and green suite.
- [ ] Update docs with exact evidence and remaining external acceptance; leave code locally, no publish/push.
