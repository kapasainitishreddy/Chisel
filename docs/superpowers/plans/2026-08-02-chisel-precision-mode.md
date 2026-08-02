# Chisel Precision Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax for tracking.

**Goal:** Build a strict local-only multi-photo precision workflow that saves only repeatable 90+ capture batches.

**Architecture:** Isolate robust statistics, protocol gates, measurement fusion, MediaPipe analysis and UI. Use Face Landmarker for facial/skin metrics and Pose Landmarker Full with segmentation masks for front/side body geometry. Compare progress only beyond uncertainty.

**Tech Stack:** Capacitor Android, JavaScript, MediaPipe Tasks Vision 0.10.20, Node test runner, Android WebView.

## Global Constraints
- Never claim perfect, medical or laboratory accuracy.
- Process photos locally and persist numeric summaries only.
- Require quality score >=90 before storage.
- Require at least seven face photos or three front plus three side body photos.
- Reject incompatible progress comparisons.

### Task 1: Robust statistics and protocol scoring
- [x] Add median/MAD outlier filtering and 95% confidence intervals.
- [x] Add strict face, skin, open-mouth, body-front and body-side gates.
- [x] Test minimum counts, outliers and 90-point acceptance.

### Task 2: Measurement fusion
- [x] Fuse facial geometry, skin colour, neck skin and open-mouth correction.
- [x] Fuse front/side body dimensions and optional tape calibration.
- [x] Test stable acceptance and unstable rejection.

### Task 3: Local MediaPipe analyzers
- [x] Use Face Landmarker with blendshapes and transformation matrices enabled.
- [x] Use Pose Landmarker Full with segmentation masks.
- [x] Keep selected images out of storage and network payloads.

### Task 4: Precision Mode UI and history
- [x] Add guided multi-file protocols and explicit rejection reasons.
- [x] Store only accepted 90+ numeric records.
- [x] Add uncertainty-aware compatible progress tracking.

### Task 5: Android packaging and verification
- [x] Package canonical assets into Android public assets.
- [ ] Update native injection order and CI.
- [ ] Run the complete repository suite and merge only when green.
