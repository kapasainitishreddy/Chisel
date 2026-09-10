# Change Requests

## CR: Implement approved visual design using each user's own photo

2026-09-10. Implemented in existing draft PR #7, not a new mockup: local personal-photo manager, original/display separation, own-photo Home/Trainer/Skin/Style presentation, real existing task controls, balanced spacing and cream buttons. Includes explicit original-photo Skin handoff and complete local-data deletion.

Verified application/test revision `2d5ecf6de339621c8c96258ea74b53a034faf865`: 222/222 Node and 66/66 personal-photo browser checks. All four current workflows pass. Fixes identified in actual testing include the DOM toast collision, selected-tab contrast, thumbnail placeholders and doubled Style spacing. An outdated exact-title test now checks the approved Face training title after complete runtime installation.

No default stock faces, mock measurement scores, fabricated photo transformations or new accuracy claims. No merge/build/install/deployment. See [implementation](PERSONAL_STUDIO.md), [visual deviations and review](PERSONAL_STUDIO_REVIEW.md), and [prior requests](history/2026-09-10-before-personal-CHANGE_REQUESTS.md).
