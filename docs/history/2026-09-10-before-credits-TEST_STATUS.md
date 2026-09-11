# Test Status

## Current: focused Looks workspace, 2026-09-10

Exact application/test head `3e0fc9d536a149ec7452c22129f92e15766bbe50`; CI merge checkout `1ebd083db6a690b4f90e0c861271ed18e9d1f054`. **245/245 Node and 54/54 Looks browser checks passed**, with zero failures/skips in Node and zero uncaught page errors. Node was rerun against the downloaded exact CI source. Nine new regressions were observed failing before implementation/fixes. Canonical/native Looks JS and CSS match the tested files byte-for-byte.

All five workflows succeeded: Looks UI #5 `34529537034`, Chisel Tests #282 `34529536971`, Personal Photo #12 `34529537025`, Quiet Studio #18 `34529537054`, Reliability #23 `34529536955`. Artifact `10172946583` contains the exact source and editor screenshots. New cases cover search, colour parameters, nested dialogs, photo-plus-action visibility, short screens, closing delayed preflight and completed jobs without reopening/duplicate creation. Provider and face-check outputs remain explicit fixtures.

See [visual comparison, exact commands and remaining limits](LOOKS_WORKSPACE_REVIEW.md). Local browser navigation was blocked; rendered verification was in GitHub Actions Chromium, not a physical Android build. Earlier checkpoints below retain their original evidence and are not the latest counts.

## Earlier: Personal Photo Studio, 2026-09-10

Verified application/test head `2d5ecf6de339621c8c96258ea74b53a034faf865`, CI checkout `66ca090ae691cf3f171765eb6f0e883f9bd0da81`. The application runtime itself is unchanged from `5a4745b`; the later commit updates the interaction suite's approved title expectation and full-runtime wait.

- Full Node suite: **222/222 PASS**, no failures/skips, including a local rerun against the exact downloaded CI source.
- Personal-photo browser suite: **66/66 PASS**, zero uncaught errors and zero POST requests recorded during the tested flows.
- Personal Photo UI #4 (`34512941395`), Quiet Studio QA #10 (`34512941384`), Reliability Evidence #15 (`34512941407`) and Chisel Tests #274 (`34512941383`): **SUCCESS**.
- Five modified canonical/native asset pairs matched byte-for-byte; syntax checks passed.

New tests cover own-photo import/reload/removal/clear-all, original SHA-256 preservation, invalid input, selection races, storage failures, real session/style filters and layout at 360/430/1280. Earlier browser suites remain enabled, including 768px layout checks. Initial deletion and spacing failures were fixed in source; the old trainer-title assertion was updated to the approved Face training text, not removed.

Artifacts: `10166520546` contains full source, screenshots, Node output and the lifecycle report. Actual screenshots were reviewed for composition, typography, spacing, contrast and photo ownership. See [full scope](PERSONAL_STUDIO.md).

Local browser navigation was blocked. Browser verification used GitHub Actions Chromium, not physical Android. No empirical accuracy study, successful reference-calibrated skin measurement, live photoreal model output, billing or signed native build is certified. [Preceding test history](history/2026-09-10-before-personal-TEST_STATUS.md) is preserved.
