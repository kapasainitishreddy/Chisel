# Content-density correction

2026-09-10. User rejected the text-heavy Quiet Studio presentation. This changes the existing theme, not the measurement or provider engines.

## Implemented

Home now has a Today heading, Face training / Skin / Style actions, the actual daily task and optional Details / Quick tools / More. Promotional headings and repeated Measure/Act/Compare explanations are removed from the default view. Trainer sessions are open rows with movement counts. A one-line comfort reminder remains visible; the original full safety and tracking guidance remain accessible under How tracking works. Skin puts Add photo and Analyze before optional Photo tips and Details, with Your routine separately expandable. Errors, experimental/non-diagnostic labeling and portrait-upload consent remain intact. Style uses plain rows without repetitive descriptions. Heading typography now uses the Inter/system stack rather than large editorial slogans.

## Verified application revision

Application commit: `84ca6b3e09d3f85e9998bfb534291e05fc4eb565`.
CI checkout: `070b41c6c5ed1f0a550662a29ee2a268d850de9d`.
A later documentation-only checkpoint does not change this tested application tree.

- Full Node suite: 200/200 PASS, zero failures or skips, both in CI and rerun against the downloaded exact CI source.
- Five new content regressions were observed failing before the fixes and passing afterward.
- Studio browser suite: 43/43 PASS. Discovery suite: 10/10 PASS. New density suite: 46/46 PASS. All three reports contain zero uncaught page errors.
- Studio QA #4, run 34503567137: SUCCESS. Artifact 10162875018 contains exact source, reports and screenshots.
- Chisel Tests #268, run 34503567174: SUCCESS.
- Reliability Evidence #9, run 34503567139: SUCCESS on attempt 2. Attempt 1 timed out while launching Chrome before any app checks; no application assertions were removed or weakened for the retry.
- Canonical theme JS and CSS match the packaged Android copies byte-for-byte.

Default-visible text counts in the density runner: Home main content 18 words, trainer 53, Skin 33 on mobile / 78 on desktop, Style 17. Home count excludes persistent header/navigation. These are whole tested surfaces with disclosures closed, not a percentage reduction or usability-study result.

The content tests run at 360, 430 and 1280 CSS-pixel widths; existing studio/discovery checks also cover 768. Actual before/after screenshots were reviewed for copy, hierarchy, type, spacing, framing and control placement. Functional controls were exercised after moving explanations; daily completion still comes from the real state and does not restore the text wall on rerender.

## Limits

Local Chromium navigation returned net::ERR_BLOCKED_BY_ADMINISTRATOR. Rendered verification was performed in GitHub Actions Chromium, not on a physical Android device. No new native build, deployment, billing configuration or store submission was performed. This is a reduction in interface density, not empirical accuracy validation, photorealistic-model integration or a claim of user-approved design quality. All existing release requirements remain open.
