# Change Requests

## CR: Make the Looks interface feel more premium, 2026-09-10

Implemented in the existing PR #7, without another generated mockup or theme controller. The inline form is now a dedicated photo workspace with the user's image, compact categories, searchable actual style names, colour swatches, a saved-look sheet and one main action. Existing privacy, quality, job and original-image behavior remain in place. Closing unfinished preparation prevents delayed consent; late results do not reopen the workspace. Search has one coherent focus boundary.

Verified application/test revision `3e0fc9d536a149ec7452c22129f92e15766bbe50`: 245/245 Node, 54/54 Looks browser checks, all five current workflows passed. Actual 360/430/1280 screenshots were reviewed against the previous screen and approved photographic direction, with a short-height interaction check. Nine new regressions failed before the fixes. See [visual ledger and exact evidence](LOOKS_WORKSPACE_REVIEW.md).

The provider and face checks are test fixtures. Live generation remains unverified/disabled, and no APK/AAB, native installation, measurement upgrade or instructional animations were added by this UI task.

## Earlier CR: Implement approved visual design using each user's own photo

2026-09-10. Implemented in existing draft PR #7, not a new mockup: local personal-photo manager, original/display separation, own-photo Home/Trainer/Skin/Style presentation, real existing task controls, balanced spacing and cream buttons. Includes explicit original-photo Skin handoff and complete local-data deletion.

Verified application/test revision `2d5ecf6de339621c8c96258ea74b53a034faf865`: 222/222 Node and 66/66 personal-photo browser checks. All four workflows passed at that checkpoint. Fixes identified in actual testing include the DOM toast collision, selected-tab contrast, thumbnail placeholders and doubled Style spacing. An outdated exact-title test now checks the approved Face training title after complete runtime installation.

No default stock faces, mock measurement scores, fabricated photo transformations or new accuracy claims. See [implementation](PERSONAL_STUDIO.md), [visual deviations and review](PERSONAL_STUDIO_REVIEW.md), and [prior requests](history/2026-09-10-before-personal-CHANGE_REQUESTS.md).
