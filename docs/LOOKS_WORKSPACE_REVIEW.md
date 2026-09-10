# Looks workspace refinement

2026-09-10. User rejected the inline editor as basic, crowded and text-heavy. The actual existing Looks Studio now opens a focused photo workspace. No new theme controller, generated stock faces, provider deployment or measurement changes were added.

## Implemented

The user's selected photo remains visible above a compact Hair / Beard / Makeup / Eyewear selector, actual selected-preset name, searchable Browse sheet, labelled hair-colour swatches and one primary generation action. Saved looks occupy a separate sheet. Desktop pairs the full photo with an editing column; mobile places a consistent editing surface below the image. Standard gutters are 20px mobile and 24-28px desktop; secondary targets are 44px and the primary action is 54px.

The original file remains separate from the displayed portrait. Swatches set real render parameters; they do not pretend to recolour the original portrait. Upload consent, cancellation, original/result comparison, saved Blob gallery, export handling and job recovery remain attached to the existing implementation. Back exits pre-upload preparation; an already submitted job can finish without reopening the workspace or silently creating another paid request. Completed output remains available on explicit return.

## Exact verification

Application/test revision: `3e0fc9d536a149ec7452c22129f92e15766bbe50`.
CI merge checkout: `1ebd083db6a690b4f90e0c861271ed18e9d1f054`.
A following documentation-only commit does not change the tested runtime.

- Full Node suite: **245/245 PASS**, zero failures/skips, in CI and rerun locally against its downloaded source archive.
- Looks browser suite: **54/54 PASS**, zero uncaught page errors. Real controls, photo decoding and local storage; provider responses and face checks are explicit fixtures, not live rendering or accuracy validation.
- Chisel Looks UI QA #5, run `34529537034`: SUCCESS. Artifact `10172946583`, `chisel-looks-34529537034`, includes source, reports, Node output and screenshots.
- Chisel Tests #282, run `34529536971`: SUCCESS.
- Personal Photo UI #12, run `34529537025`: SUCCESS.
- Quiet Studio QA #18, run `34529537054`: SUCCESS.
- Reliability Evidence #23, run `34529536955`: SUCCESS.
- Both changed canonical/native JS and CSS pairs match byte-for-byte. The downloaded source matches the local tested application and browser runner.

Nine new regressions were observed failing before their corresponding fixes: six initial catalog/workspace regressions and three follow-up close/focus regressions. Browser assertions cover portrait-plus-action visibility and fit at 360x900, 430x900 and 1280x900, short-screen action reachability at 430x650, category/search/swatch selection, nested dialog back/escape, consent refusal, no-face rejection, comparison, actual Blob saves, original SHA-256 preservation, gallery reopening, interrupted status without a second create, delayed preflight/result handling and removal. Existing suites also cover 768px.

## Visual comparison ledger

The accepted concept was the earlier four-screen photo-led Chisel image in the conversation. Both that reference and the actual latest screenshots were opened during review. The previous actual inline editor was also compared directly.

| Review point | Previous problem / concept intent | Final rendered treatment |
|---|---|---|
| Photo priority | Inline form pushed the face off-screen; concept leads with portrait | Full selected photo and main action coexist in the tested mobile viewport |
| Hierarchy | Competing Create preview / Photo preview / Create look / Try camera blocks | One editor heading and one primary generation action; camera is secondary outside |
| Spacing | Mixed form, disclosure and catalog gaps | Consistent photo margins and one editing surface with deliberate section spacing |
| Palette | Approved near-black/deep-green with cream controls | Retained; no gold, neon glow or new theme layer |
| Typography | Repeated heavy labels and boilerplate | Short labels, 23-24px selected style name and deliberate 13-14px controls |
| Categories and choices | Many preset pills inline | Four compact category buttons; all real preset names in a searchable sheet |
| Colour | Native dropdown dominated controls | Labelled 44px swatch controls, selected outline and actual parameter binding |
| Focus | First browser review exposed double outline on search | One enclosing keyboard-focus boundary around input and icon |
| Back behavior | Async preparation or result could reopen a closed editor | Leaving cancels pending preparation; late completed jobs do not reopen it |

The first rendered review passed 46 browser checks; source review then found the close/late-result problem and the screenshot exposed the double search outline. Both were fixed and the expanded 54-check suite passed. No existing consent, save, result or recovery assertion was removed.

Above-the-fold copy is limited to the workspace heading, Original label, category names, selected style/colour, Browse, main action and a short consent/status line. No marketing slogan or fictional measurement was added. Intentional reference deviations: this is a dedicated editing workspace, not the concept's scrolling marketing-like card stack; the user's unedited photo replaces cinematic concept models; fabricated generated thumbnails and scores are omitted. Image fit preserves the whole portrait rather than cropping away hair.

## Boundaries

Rendered verification used GitHub Actions Chromium because local navigation returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`; no security workaround was used. Screenshots contain an existing repository test portrait imported through the real control. The test service is simulated as ready; this is not evidence that production rendering is enabled. The service was not modified in this UI task and live rendering remains unverified/disabled under the preceding deployment checkpoint.

No signed APK/AAB, phone installation, merge, live provider generation, billing setup, exercise animations or empirical accuracy study was performed. This validates the revised Looks interface and its tested workflows, not user-approved taste, full accessibility conformance or a finished Android release.
