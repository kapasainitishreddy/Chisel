# Play store listing draft — internal test

12 October 2026. English (United States). App type: App. Price: Free. Package name, fixed after the first upload: `com.chisel.lookmax`.

Do not upload this text to production. Screenshots and the feature graphic are not in the repo; capture them from the internal-test build on a phone.

## Identity

| Field | Draft |
|---|---|
| App name (30) | `Chisel: Face & Glow-up` (22 characters) |
| Launcher name already in the app | `Chisel` |
| Short description (80) | `On-device face guidance and grooming. Not a rating or a medical app.` (68 characters) |
| Category | Beauty |
| Tags, if offered | Beauty, Self-care |
| Contact email | nittureddy26@gmail.com |
| Privacy policy URL | The `docs/privacy-policy.html` page for the same commit as the AAB. Confirm it opens in a private window. |
| External marketing | Optional. Not required for internal testing. |

## Full description

```
Chisel helps you practice grooming and self-care on your phone. It measures what you can work on and labels the evidence behind a tip. It does not score your attractiveness.

• On-device face guidance for jaw, cheeks, profile angles, symmetry, skin, teeth, and hair, using a face mesh that runs on your phone.
• Live try-on for hair, facial hair, glasses, and makeup. These previews stay on your device.
• Routines for face and neck movement, posture, and everyday grooming, plus affirmations and a short visualization.
• Progress photos, streaks, and optional sleep, water, and salt notes. Those notes stay on your phone.
• Optional photoreal edit: only if you confirm it, a prepared photo is sent to our service and an image provider. You can use Chisel without that.

No account is required. Purchases are not offered in this version. There are no ads and no analytics trackers.

Chisel is cosmetic and educational. It is not a medical device and does not diagnose, treat, or change bone structure. Stop any routine that hurts.

For ages 17 and over.
```

## Graphics Sai still has to make

| Asset | Spec | Content to capture |
|---|---|---|
| App icon | 512×512 PNG | The existing launcher icon, exported at 512 |
| Feature graphic | 1024×500 PNG or JPEG | App name and one on-device face view. No before/after medical claim. |
| Phone screenshots | At least 2, preferably 4, 16:9 or 9:16 | Home, an analysis result, try-on, and Settings showing privacy and data deletion |
| Tablet screenshots | Not required for this phone app | Skip unless the internal test includes a tablet layout you want to show |

Use captures from the signed internal build, not older marketing mockups.

## Other console fields

| Field | Draft |
|---|---|
| Ads | No |
| News app | No |
| Government | No |
| COVID-19 contact status | No |
| App access | All functionality is available without special access. There is no reviewer login. Purchases are not offered. |
| Target audience | 18 and older, or 17 and older if the form allows it. Not designed for children. |
| Ads declaration / families | Not in a families program. No ads. |
| Content rating | Complete the questionnaire honestly. No violence, sexual content, gambling, user-generated public posts, or social network. Appearance and grooming utility. Expect Everyone or Teen; the target audience above is still 17+. |
| News / financial features | No |
| Data safety | [PLAY_DATA_SAFETY.md](PLAY_DATA_SAFETY.md) |
| Health apps | [PLAY_HEALTH_DECLARATION.md](PLAY_HEALTH_DECLARATION.md) |

## Release notes for the internal track

```
First internal test. On-device face guidance, try-on, and routines. Optional cloud photo edits stay behind a confirmation. Purchases are turned off. You can clear local data in Settings.
```
