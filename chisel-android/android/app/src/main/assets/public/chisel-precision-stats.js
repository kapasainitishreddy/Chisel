(function attachChiselPrecisionStats(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ChiselPrecisionStats = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPrecisionStats() {
  'use strict';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const round = (value, digits = 3) => { const factor = 10 ** digits; return Math.round((Number(value) || 0) * factor) / factor; };
  const finite = (value) => Number.isFinite(Number(value));
  const numeric = (values) => (values || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);

  function quantile(values, q) {
    const sorted = numeric(values); if (!sorted.length) return null;
    const position = clamp(q, 0, 1) * (sorted.length - 1); const lower = Math.floor(position); const upper = Math.ceil(position);
    if (lower === upper) return sorted[lower]; const weight = position - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
  const median = (values) => quantile(values, 0.5);
  function mad(values, center) { const list = numeric(values); if (!list.length) return null; const pivot = finite(center) ? Number(center) : median(list); return median(list.map((v) => Math.abs(v - pivot))); }
  function mean(values) { const list = numeric(values); return list.length ? list.reduce((sum, v) => sum + v, 0) / list.length : null; }
  function standardDeviation(values, center) {
    const list = numeric(values); if (list.length < 2) return 0; const pivot = finite(center) ? Number(center) : mean(list);
    return Math.sqrt(list.reduce((sum, v) => sum + (v - pivot) ** 2, 0) / (list.length - 1));
  }
  function robustConsensus(values, options = {}) {
    const sorted = numeric(values); const minimum = Math.max(1, Number(options.minimum) || 3);
    if (sorted.length < minimum) return { valid: false, reason: 'not-enough-samples', count: sorted.length, used: 0, value: null, ci95: null, relativeSpread: null };
    const rawMedian = median(sorted); const rawMad = mad(sorted, rawMedian) || 0; const sigma = rawMad * 1.4826;
    const floor = Math.max(Math.abs(rawMedian) * 0.002, Number(options.absoluteFloor) || 0.0001);
    const limit = Math.max(floor, sigma * (Number(options.outlierSigma) || 3.5));
    const filtered = sorted.filter((v) => Math.abs(v - rawMedian) <= limit);
    if (filtered.length < minimum) return { valid: false, reason: 'unstable-after-outlier-filter', count: sorted.length, used: filtered.length, value: null, ci95: null, relativeSpread: null };
    const value = median(filtered); const robustSd = (mad(filtered, value) || 0) * 1.4826; const conventionalSd = standardDeviation(filtered, mean(filtered));
    const spread = Math.max(robustSd, conventionalSd * 0.65); const ci95 = 1.96 * spread / Math.sqrt(filtered.length);
    const relativeSpread = Math.abs(value) > 1e-9 ? spread / Math.abs(value) : spread;
    const maxRelativeSpread = finite(options.maxRelativeSpread) ? Number(options.maxRelativeSpread) : Infinity;
    const valid = relativeSpread <= maxRelativeSpread; const digits = options.digits == null ? 4 : options.digits;
    return { valid, reason: valid ? null : 'spread-too-high', count: sorted.length, used: filtered.length, rejected: sorted.length - filtered.length,
      value: round(value, digits), ci95: round(ci95, digits), lower: round(value - ci95, digits), upper: round(value + ci95, digits), relativeSpread: round(relativeSpread, 5) };
  }
  function linearScore(value, idealMin, idealMax, hardMin, hardMax) {
    const v = Number(value); if (!Number.isFinite(v)) return 0; if (v >= idealMin && v <= idealMax) return 1;
    if (v <= hardMin || v >= hardMax) return 0; return v < idealMin ? (v - hardMin) / (idealMin - hardMin) : (hardMax - v) / (hardMax - idealMax);
  }
  function srgbToLinear(value) { const c = clamp(value, 0, 255) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
  function rgbToLab(rgb = {}) {
    const r = srgbToLinear(rgb.r), g = srgbToLinear(rgb.g), b = srgbToLinear(rgb.b);
    const x = (r * .4124564 + g * .3575761 + b * .1804375) / .95047; const y = r * .2126729 + g * .7151522 + b * .072175; const z = (r * .0193339 + g * .119192 + b * .9503041) / 1.08883;
    const f = (v) => v > .008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116; return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  }
  function deltaE76(a, b) { return Array.isArray(a) && Array.isArray(b) ? Math.hypot((a[0] || 0) - (b[0] || 0), (a[1] || 0) - (b[1] || 0), (a[2] || 0) - (b[2] || 0)) : Infinity; }
  function ellipseCircumference(width, depth) {
    const a = Math.max(0, Number(width) || 0) / 2, b = Math.max(0, Number(depth) || 0) / 2; if (!a || !b) return null;
    const h = ((a - b) ** 2) / ((a + b) ** 2); return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  }
  function compatibleSetup(a = {}, b = {}) {
    const sameKind = a.kind === b.kind, sameCamera = !a.camera || !b.camera || a.camera === b.camera;
    const sameMethod = !a.methodVersion || !b.methodVersion || a.methodVersion === b.methodVersion;
    const sameView = !a.view || !b.view || a.view === b.view;
    const sameOrientation = !a.orientation || !b.orientation || a.orientation === b.orientation;
    const aspectDiff = Math.abs((Number(a.aspect) || 0) - (Number(b.aspect) || 0)); const fillDiff = Math.abs((Number(a.fill) || 0) - (Number(b.fill) || 0)); const lightDiff = Math.abs((Number(a.brightness) || 0) - (Number(b.brightness) || 0));
    const distanceA = Number(a.distanceCm), distanceB = Number(b.distanceCm); const distanceComparable = !Number.isFinite(distanceA) || !Number.isFinite(distanceB) || Math.abs(distanceA-distanceB)/Math.max(Math.abs(distanceA),Math.abs(distanceB),1) <= .12;
    const strictCompatible = sameKind && sameCamera && sameMethod && sameView && sameOrientation && aspectDiff <= .08 && fillDiff <= .055 && lightDiff <= 18 && distanceComparable;
    const usable = sameKind && sameCamera && sameMethod && sameView && sameOrientation && aspectDiff <= .11 && fillDiff <= .075 && lightDiff <= 26 && (!Number.isFinite(distanceA) || !Number.isFinite(distanceB) || Math.abs(distanceA-distanceB)/Math.max(Math.abs(distanceA),Math.abs(distanceB),1) <= .18);
    const reasons = [];
    if (!sameKind) reasons.push('different scan type'); if (!sameCamera) reasons.push('different camera'); if (!sameMethod) reasons.push('different measurement method'); if (!sameView) reasons.push('different view'); if (!sameOrientation) reasons.push('different orientation'); if (aspectDiff > .08) reasons.push('different framing'); if (fillDiff > .055) reasons.push('different distance/framing'); if (lightDiff > 18) reasons.push('different lighting'); if (!distanceComparable) reasons.push('different camera distance');
    return { compatible: strictCompatible, label: strictCompatible ? 'matched' : usable ? 'usable' : 'not-comparable', reasons };
  }
  function compareTrackedMetric(previous = {}, current = {}, options = {}) {
    if (!finite(previous.value) || !finite(current.value)) return { meaningful: false, reason: 'missing-value' };
    const delta = Number(current.value) - Number(previous.value); const threshold = Math.max(Math.abs(Number(previous.ci95) || 0) + Math.abs(Number(current.ci95) || 0), Math.abs(Number(previous.value)) * (Number(options.minimumRelativeChange) || .01), Number(options.absoluteFloor) || 0);
    const meaningful = Math.abs(delta) > threshold; const digits = options.digits == null ? 4 : options.digits;
    return { meaningful, delta: round(delta, digits), threshold: round(threshold, digits), direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'steady', reason: meaningful ? null : 'change-within-uncertainty' };
  }
  function precisionLabel(score, accepted) { if (!accepted) return 'RETRY REQUIRED'; if (score >= 97) return 'EXCEPTIONAL PROTOCOL'; if (score >= 94) return 'HIGH PRECISION'; return 'PRECISION READY'; }
  return { clamp, round, finite, quantile, median, mad, robustConsensus, linearScore, rgbToLab, deltaE76, ellipseCircumference, compatibleSetup, compareTrackedMetric, precisionLabel };
});
