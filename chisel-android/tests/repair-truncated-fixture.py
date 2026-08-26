#!/usr/bin/env python3
"""Create a deterministic valid QA portrait from a truncated repository JPEG.

This is test-fixture repair only. It never runs in the shipped application.
"""

from pathlib import Path
import sys

from PIL import Image, ImageFile, ImageOps

ImageFile.LOAD_TRUNCATED_IMAGES = True


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: repair-truncated-fixture.py SOURCE DEST", file=sys.stderr)
        return 2

    source = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    with Image.open(source) as image:
        image.load()
        rgb = image.convert("RGB")
        width, height = rgb.size
        if width < 100 or height < 100:
            raise ValueError("fixture dimensions are implausibly small")

        # The committed legacy female fixture has a decodable face/upper-body region
        # followed by damaged scan data. Keep only the intact upper portion, then fit
        # it to the same 4:5 fake-camera frame used by the browser QA harness.
        intact_height = max(100, min(height, int(height * 0.47)))
        horizontal_inset = int(width * 0.17)
        cropped = rgb.crop((horizontal_inset, 0, width - horizontal_inset, intact_height))
        repaired = ImageOps.fit(cropped, (320, 400), method=Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        repaired.save(dest, format="JPEG", quality=92, optimize=True)

    with Image.open(dest) as check:
        check.verify()
    if dest.stat().st_size < 1024:
        raise ValueError("repaired fixture is unexpectedly small")
    print(f"repaired QA fixture: {source} -> {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
