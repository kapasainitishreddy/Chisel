# Release Status

Updated 2026-09-10. **Not a production release. Draft PR #7 remains unmerged.**

The unisex trainer/skin/style branch now contains additional reliability and input-quality safeguards. Local software tests pass 184/184; exact-head workflow results determine CI status. A passing test run does not establish measurement accuracy or photorealistic output quality.

## Still required

- Build the exact source as an Android APK/AAB and verify on physical devices. New trainer movement thresholds, camera freshness, low-FPS behaviour, skin image checks and upload confirmation require acceptance.
- Validate claimed metrics against appropriate references, with repeatability, error and rejected-capture reporting across representative conditions.
- Review/activate the chosen cloud rendering stack and inspect actual results. HairFastGAN and the other proposed external models have not been newly bundled or deployed.
- Complete parent PR #6 production Supabase/RevenueCat/provider configuration, billing lifecycle tests, signing, Play Internal Testing, hosted privacy/retention disclosures and store submission requirements.

No release-ready percentage is assigned. See [accuracy/reliability scope](ACCURACY_RELIABILITY.md) and [preserved earlier release checklist](history/2026-09-10-before-reliability-RELEASE_STATUS.md).
