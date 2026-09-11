# Release Status

2026-09-10. **PR #7 remains draft and unmerged. The user's installed Android app has not been updated.**

## Latest UI checkpoint

The focused Looks editor replaces the rejected inline form with a prominent user photo, grouped categories, searchable presets, colour swatches, a saved-look sheet and one primary action. Application/test revision `3e0fc9d536a149ec7452c22129f92e15766bbe50` passed 245 Node tests, 54 Looks browser checks and all five current workflows. See [exact verification and visual ledger](LOOKS_WORKSPACE_REVIEW.md).

This UI change did not deploy or enable the rendering backend. The previous Looks backend was deployed separately but remains disabled/unverified for real output, as recorded in [LOOKS_STUDIO_STATUS.md](LOOKS_STUDIO_STATUS.md). Do not mistake simulated-ready test screenshots for a live generation service. Production billing-aware allowances, real output fidelity and retention review remain open.

## Earlier personal-photo checkpoint

The user-approved photo-led UI is implemented with personal-photo storage, real feature controls and original-photo Skin handoff. Application/test revision `2d5ecf6de339621c8c96258ea74b53a034faf865` passed 222 Node tests, 66 personal-photo browser checks and the four required workflows at that checkpoint. See [historical evidence](PERSONAL_STUDIO.md).

No signed APK/AAB or native installation has been performed for these changes. Physical Android camera/HUD/picker/touch/scroll, large text and screen reader acceptance remain open. Test representative devices and conditions, validate metric error/repeatability, review actual generated outputs, and complete parent PR #6's Supabase/RevenueCat/provider/privacy/Play requirements.

The saved portrait is not a generated exercise demo or transformed hairstyle image. Existing numerical skin and geometry signals remain unvalidated photographic estimates. Instructional animations are still unfinished. No blanket accuracy or release-ready percentage is assigned.

[Previous checkpoint](history/2026-09-10-before-personal-RELEASE_STATUS.md) and [accuracy requirements](ACCURACY_RELIABILITY.md) remain preserved.
