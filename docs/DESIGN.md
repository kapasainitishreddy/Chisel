# Chisel visual system

Shipped on `cursor/play-internal-readiness-d466`. Presentation only. Measurement, billing, and deletion behavior are unchanged.

## Tokens

Central custom properties live in `chisel-android/www/chisel-studio-theme.css` and are repeated for the photo-led layer in `chisel-personal-studio.css`. `chisel-appearance.js` stores the choice at `chisel:theme` (`light`, `dark`, or absent for the phone setting) and sets `data-theme` before paint.

| Token | Light | Dark |
|---|---|---|
| Background | `#F6F3EE` | `#141210` |
| Surface | `#FFFCF8` | `#211E1A` |
| Text | `#1C1915` | `#F7F4EF` |
| Muted | `#5C564C` | `#D2C9BC` |
| Accent | `#9A3412` | `#F2C4A2` |
| Sage | `#1F6A45` | `#B7DCC8` |

Body text, muted text, and accent buttons are checked at 4.5:1 in `tests/chisel-appearance.test.cjs`.

## Type, space, shape, motion

Public Sans is self-hosted in `www/fonts/` at 400, 400 italic, 600, and 700. The scale is 12 / 14 / 16 / 20 / 28 / 40. Spacing steps are 4, 8, 12, 16, 24, 32, and 48. Cards use an 18px radius. Buttons and inputs use 14px and a 48px minimum height. Screen changes rise 8px over 180ms. `prefers-reduced-motion` removes that motion.

## Icons and chrome

Navigation, capture, and routine marks are inline 24px stroke icons from `ChiselAppearance.icon`. Bottom tabs keep a 64px row plus the Android safe-area inset. A software keyboard sets `--cs-keyboard` and hides the tab bar. Primary taps call Capacitor Haptics when that plugin exists.

Settings → Appearance offers System, Light, and Dark. Paid purchase UI stays hidden because `billingEnabled` is false.
