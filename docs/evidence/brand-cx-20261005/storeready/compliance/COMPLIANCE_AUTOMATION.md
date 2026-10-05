# Autonomous Compliance Checker

**Status:** BLOCKED
**Jurisdictions:** not configured

| Control | Status | Evidence/notes |
| --- | --- | --- |
| Privacy policy is present and machine-verified | BLOCKED |  |
| Public HTTPS privacy-policy URL is verified | PLATFORM_REQUIRED | Apple requires a privacy policy URL for all apps; Google requires a complete privacy policy where applicable. |
| Privacy policy is reachable from the app/product source | AUTOMATION_PENDING |  |
| Security checker has no blocking findings | AUTOMATION_PENDING |  |
| Account deletion works end to end and the external deletion route is reachable | AUTOMATION_PENDING | Source evidence exists, but runtime deletion and public web-route evidence are still required. |
| UGC report/block controls work on the release build | AUTOMATION_PENDING | Static controls were detected; automated runtime evidence is still required. |
| Google Play Health apps declaration is imported | PLATFORM_REQUIRED | Google Play requires the Health apps declaration for published apps, including apps that declare no health features. |
| Purchase/restore/cancel lifecycle evidence is available | AUTOMATION_PENDING |  |
| AI data handling is disclosed and runtime data flow is verified | AUTOMATION_PENDING |  |
| Release jurisdictions are configured | AUTOMATION_PENDING | StoreReady cannot run jurisdiction-specific privacy controls without declared release markets. |

## Findings

- **BLOCKED** Privacy policy is present and machine-verified — Correct the detected compliance mismatch and rerun the checker.
- **PLATFORM_REQUIRED** Public HTTPS privacy-policy URL is verified — Connect/import the platform evidence so StoreReady can verify it automatically.
- **AUTOMATION_PENDING** Privacy policy is reachable from the app/product source — Enable the missing automated evidence source or connector.
- **AUTOMATION_PENDING** Security checker has no blocking findings — Enable the missing automated evidence source or connector.
- **AUTOMATION_PENDING** Account deletion works end to end and the external deletion route is reachable — Enable the missing automated evidence source or connector.
- **AUTOMATION_PENDING** UGC report/block controls work on the release build — Enable the missing automated evidence source or connector.
- **PLATFORM_REQUIRED** Google Play Health apps declaration is imported — Connect/import the platform evidence so StoreReady can verify it automatically.
- **AUTOMATION_PENDING** Purchase/restore/cancel lifecycle evidence is available — Enable the missing automated evidence source or connector.
- **AUTOMATION_PENDING** AI data handling is disclosed and runtime data flow is verified — Enable the missing automated evidence source or connector.
- **AUTOMATION_PENDING** Release jurisdictions are configured — Enable the missing automated evidence source or connector.

A PASS means the machine-verifiable evidence matched the configured rule. It does not mean StoreReady has issued a legal opinion.
