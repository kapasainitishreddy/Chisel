# Chisel launch evidence gate

Chisel remains **Waitlist** in the Syrava launch system until the applicable external release gates have current evidence for the exact shipping commit. Existing automated and Android build evidence is valuable, but it does not substitute for Play signing, production-service configuration, store testing, or representative empirical validation.

Allowed statuses are **PASS**, **FAIL**, **BLOCKED**, **NOT RUN**, and **N/A**.

| Gate | Status | Evidence required |
|---|---|---|
| source / synchronized product test suite | PASS | Current branch inherits the verified synchronized suite and release-hardening merge; rerun before final release if source changes |
| Android debug build | PASS | Existing API-36 debug/build evidence; rerun against final candidate |
| release bundle compile | PASS | Existing CI `bundleRelease` artifact proves compile/bundle, not final signed Play upload |
| final upload signing | NOT RUN | Developer-owned upload keystore + signed AAB tied to final commit |
| Play Internal upload/install | NOT RUN | Internal-test artifact, install/launch and Play-delivered build evidence |
| physical-device final regression | NOT RUN | Final build: permissions, Analyze, Quick/Deep, Precision, AR coach, try-on, progress, share/export, restart/data deletion |
| empirical scan repeatability | BLOCKED | Representative repeated captures across devices/lighting/distance/skin tones/facial hair/glasses with variance and reference checks |
| optional photoreal production path | N/A | N/A if launch is local/free-first; otherwise provider/server config, privacy disclosure, quota/cost and live render verification |
| RevenueCat / Google Play billing | N/A | N/A if launch is free-first; otherwise product/entitlement config plus Play test-track purchase/restore/grace/expiry evidence |
| privacy / Play declarations | NOT RUN | Hosted privacy URL + accurate Data Safety, content rating, target audience, health/wellness, ads and app-access forms |
| real store screenshots / listing | NOT RUN | Current real-device captures, final copy and feature graphic |
| Persona QA | NOT RUN | Public-safe launch QA report for the exact final candidate; raw appearance-test evidence remains private |
| final release decision | BLOCKED | Applicable gates above resolved and human decision recorded |

## Marketing boundaries

- Do not market Chisel as a medical, diagnostic or clinical product.
- Do not claim population-level or ground-truth measurement accuracy from software tests alone.
- Do not promise attractiveness gains, symmetry gains or bone reshaping.
- Do not claim every image stays on-device when the optional photoreal cloud feature is enabled; describe it as a separate opt-in cloud path.
- The core marketing wedge is anti-rating, local-first analysis, evidence-strength labeling, uncertainty-aware progress and actionable grooming/try-on workflows.
- Private face images, measurements and progress photos must never be sent into launch analytics or marketing content systems.

## Current decision

**BLOCKED / Waitlist.**

The software is a strong Android release candidate, but final signed Play distribution, final-device/store checks and the empirical repeatability gate are not all complete for a public Live claim.
