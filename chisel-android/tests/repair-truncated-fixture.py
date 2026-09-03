#!/usr/bin/env python3
"""Create a deterministic valid browser-QA portrait from a damaged fixture.

This is test-fixture recovery only. It never runs in the shipped application.
If the legacy female JPEG is too damaged for Pillow to identify at all, the
script falls back to the repository's known-good portrait control. That
fallback exercises the female UI/try-on code path; it does not claim to
validate gender classification or appearance-model accuracy.
"""

from pathlib import Path
import sys

from PIL import Image, ImageFile, ImageOps, UnidentifiedImageError

ImageFile.LOAD_TRUNCATED_IMAGES = True


def load_fixture(source: Path) -> tuple[Image.Image, bool, Path]:
    try:
        with Image.open(source) as image:
            image.load()
            return image.convert("RGB"), False, source
    except (UnidentifiedImageError, OSError):
        fallback = source.with_name("portrait-male.jpg")
        if not fallback.exists():
            raise
        with Image.open(fallback) as image:
            image.load()
            return ImageOps.mirror(image.convert("RGB")), True, fallback


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: repair-truncated-fixture.py SOURCE DEST", file=sys.stderr)
        return 2

    source = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    rgb, used_fallback, decoded_source = load_fixture(source)
    width, height = rgb.size
    if width < 100 or height < 100:
        raise ValueError("fixture dimensions are implausibly small")

    if used_fallback:
        # Preserve the face region of the known-good control while making the
        # recovered frame deterministic and distinct from the male QA input.
        repaired = ImageOps.fit(
            rgb,
            (320, 400),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.35),
        )
        print(
            f"legacy fixture {source} is undecodable; using mirrored control {decoded_source} "
            "for female-mode browser QA only",
            file=sys.stderr,
        )
    else:
        # The legacy fixture may have an intact face/upper-body region followed
        # by damaged scan data. Keep only the upper region and normalize it to
        # the same 4:5 fake-camera frame used by the browser QA harness.
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
