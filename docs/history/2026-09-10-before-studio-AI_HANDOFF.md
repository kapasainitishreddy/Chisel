# AI Development Handoff

## Current checkpoint: 2026-09-10

Continue draft PR #7, branch `feat/chisel-unisex-trainer-skin`, based on `feat/launch-machine-chisel`. Do not restart or replace the static Capacitor app. No merge, production deployment, new model import, purchase configuration or store submission was performed by the accuracy/reliability update.

The current change fixes invalid-data acceptance, unobserved/frozen-camera holds, sustained-smile overcounting, guided-rep misclassification and camera-aspect distortion. It also hardens skin sampling, Precision quality data, and full-frame cloud try-on preparation/consent. Read [Accuracy and realism status](ACCURACY_RELIABILITY.md) for exact scope, limitations and acceptance work.

Local Node verification is 184/184 passing. The exact-head GitHub workflows are authoritative for CI status. Local browser navigation was blocked; do not re-label it as tested. Eight canonical feature modules have byte-identical Android packaged copies. A new signed Android build and physical-device acceptance have not been performed here.

## Next work

Verify real camera behaviour and empirical error using labelled/reference data. Validate the new capture rejection thresholds, repeatability across devices and skin tones, and actual provider outputs. Skin signals remain photographic heuristics; local hair remains a placement guide. No blanket high-accuracy or photorealism claim is justified by passing software tests.

The prior handoff is preserved in [historical handoff](history/2026-09-10-before-reliability-AI_HANDOFF.md). Its August percentages, tool versions and old test totals are historical, not current release evidence.
