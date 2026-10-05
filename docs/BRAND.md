# Chisel brand assets

The new identity keeps forest green `#102821`, warm ivory `#F4EFE3`, and a small sage accent `#97A78A`. It uses an open sculpted C and a diagonal chisel cut; no face, gender, attractiveness score or transformation claim is embedded in the mark.

- `chisel-android/www/chisel-logo.png`: original generated transparent concept, 1280 × 1280, copied unchanged from the image-generation result. SHA-256 `d7d5c520afcc78f71ef8dfe6097b0ddcd9a2430188fd92828926b5930cef4583`. Used in the actual masthead and web boot screen.
- `chisel-android/www/chisel-mark.svg`: manually authored flat vector companion to that concept, with no background. Its shape intentionally simplifies the generated raster, and is not an automatic trace.
- `chisel-android/www/chisel-icon.svg`: vector companion on forest green, used as favicon and native packaging source.
- Android adaptive foreground/background vectors and 15 density PNGs: generated from the authored companion, preserving the adaptive icon safe zone. Launcher round/square surfaces use the same identity.

Keep the opening and sage accent legible. Do not stretch, add gradients, put claims inside the symbol, or treat the generated raster as a formal trademark clearance. The current wordmark uses the existing sans-serif typography and uppercase Chisel. Main product photography remains the user's own, saved separately from the brand assets.

Reproduce launcher density PNGs with `node scripts/package-brand-icons.mjs` from `chisel-android`, using the existing QA-only Puppeteer/Chromium setup. This is a development packaging script; it is not part of app runtime and Puppeteer is not a production dependency. The generated PNG concept stays unchanged. Native icons compile, but launcher masking/appearance on physical Android devices has not been tested in this session.
