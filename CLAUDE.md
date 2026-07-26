# CLAUDE.md — Instructions for Claude Code

Permanent, repo-specific instructions. Read these before every task.

## Before any task
1. Read `AGENTS.md`, `docs/AI_HANDOFF.md`, `docs/FEATURE_MATRIX.md`, `docs/CHANGE_REQUESTS.md`, `docs/TEST_STATUS.md`, `docs/RELEASE_STATUS.md`.
2. Run `git status` and inspect recent diffs (`git log --oneline -10`, `git diff`).
3. Preserve user-written and other-agent (Codex) changes — never revert, reset, or overwrite unfamiliar modifications.

## While working
- **Modify the actual app**, not only documentation. The app is `chisel-android/www/index.html` (single-file, no bundler).
- There is **no test/lint/type-check framework**. "Verification" here = Node syntax + sandbox check of the embedded scripts (see AGENTS.md → Test command). Run it after every edit to `index.html`.
- Never claim a feature is complete without verification. State what you actually ran.
- Never remove functionality merely to make something pass.
- Never expose secrets. Never commit `keystore.properties`, `*.jks`, `.env`, API keys, or RevenueCat/Supabase private keys. Only the Supabase **publishable** key and (once set) the RevenueCat **public** SDK key belong in client code.
- Work toward a production-ready Play Store **AAB** (see `docs/RELEASE_STATUS.md`).

## After meaningful changes
1. Run the verification command.
2. Update `docs/AI_HANDOFF.md` (Work Completed, Current Work in Progress, Next Task).
3. Update `docs/FEATURE_MATRIX.md`, `docs/TEST_STATUS.md`, `docs/RELEASE_STATUS.md` as affected.
4. If a change request in `docs/CHANGE_REQUESTS.md` was implemented, move it only after source + verification evidence exist.
5. Record remaining problems honestly. Set exactly one "Next Task".

## Hard constraints
- Do not create a duplicate app, second source dir, or "fixed" copy. Work in the existing files.
- Do not run destructive git commands (`reset --hard`, force-push, branch deletion) without explicit user request.
- The `.claude/` directory is local tooling — do not commit it.
