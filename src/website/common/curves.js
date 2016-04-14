function distance(p1, p2) {
  return Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
}

function sub(p1, p2) {
  return [p1[0] - p2[0], p1[1] - p2[1]];
}

function add(p1, p2) {
  return [p1[0] + p2[0], p1[1] + p2[1]];
}

function computeCatmullRomGlobalParameter(controlPoints, globalParameter, alpha) {
  globalParameter[0] = 0.0;
  globalParameter[controlPoints.length - 1] = 1.0;
  let cumDist = [];
  cumDist[0] = 0.0;
  let totalDist = 0.0;

  for (let i = 1; i < controlPoints.length; ++i) {
    let dist = Math.pow(distance(controlPoints[i - 1], controlPoints[i]), alpha);
    cumDist[i] = cumDist[i - 1] + dist;
    totalDist += dist;
  }

  for (let i = 1; i < controlPoints.length - 1; ++i) {
    globalParameter[i] = cumDist[i] / totalDist;
  }
}

function computeSegmentIndex(t, controlPoints, globalParameter) {
  if (t === 0.0) {
    return 0;
  } else if (t === 1.0) {
    return controlPoints.length - 1;
  } else {
    let i = 0;

    while (t >= globalParameter[i + 1]) {
      ++i;
    }

    return i;
  }
}

function computeBezierSegmentControlPoints(pBefore, pStart, pEnd, pAfter, bezierSegmentControlPoints, alpha) {
  bezierSegmentControlPoints.push(pStart);
  let d1 = distance(pBefore, pStart);
  let d2 = distance(pStart, pEnd);
  let d3 = distance(pEnd, pAfter);
  let d1alpha = Math.pow(d1, alpha);
  let d12alpha = Math.pow(d1, 2 * alpha);
  let d2alpha = Math.pow(d2, alpha);
  let d22alpha = Math.pow(d2, 2 * alpha);
  let d3alpha = Math.pow(d3, alpha);
  let d32alpha = Math.pow(d3, 2 * alpha);
  bezierSegmentControlPoints.push([(d12alpha * pEnd[0] - d22alpha * pBefore[0] + (2 * d12alpha + 3 * d1alpha * d2alpha + d22alpha) * pStart[0]) / (3 * d1alpha * (d1alpha + d2alpha)), (d12alpha * pEnd[1] - d22alpha * pBefore[1] + (2 * d12alpha + 3 * d1alpha * d2alpha + d22alpha) * pStart[1]) / (3 * d1alpha * (d1alpha + d2alpha))]);
  bezierSegmentControlPoints.push([(d32alpha * pStart[0] - d22alpha * pAfter[0] + (2 * d32alpha + 3 * d3alpha * d2alpha + d22alpha) * pEnd[0]) / (3 * d3alpha * (d3alpha + d2alpha)), (d32alpha * pStart[1] - d22alpha * pAfter[1] + (2 * d32alpha + 3 * d3alpha * d2alpha + d22alpha) * pEnd[1]) / (3 * d3alpha * (d3alpha + d2alpha))]);
  bezierSegmentControlPoints.push(pEnd);
}

function computeCatmullRomPointImpl(controlPoints, t, globalParameter, closedCurve, alpha) {
  let i = computeSegmentIndex(t, controlPoints, globalParameter);
  let localT = 0.0;

  if (t >= 1.0) {
    localT = 1.0;
  } else if (t !== 0.0) {
    localT = (t - globalParameter[i]) / (globalParameter[i + 1] - globalParameter[i]);
  }

  let bezierControlPoints = [];

  if (i === 0) {
    computeBezierSegmentControlPoints(closedCurve ? controlPoints[controlPoints.length - 2] : sub(controlPoints[i], sub(controlPoints[i + 1], controlPoints[i])), controlPoints[i], controlPoints[i + 1], controlPoints[i + 2], bezierControlPoints, alpha);
  } else if (i === controlPoints.length - 2) {
    computeBezierSegmentControlPoints(controlPoints[i - 1], controlPoints[i], controlPoints[i + 1], closedCurve ? controlPoints[1] : add(controlPoints[i + 1], sub(controlPoints[i + 1], controlPoints[i])), bezierControlPoints, alpha);
  } else if (i === controlPoints.length - 1) {
    computeBezierSegmentControlPoints(controlPoints[i - 2], controlPoints[i - 1], controlPoints[i], closedCurve ? controlPoints[1] : add(controlPoints[i], sub(controlPoints[i], controlPoints[i - 1])), bezierControlPoints, alpha);
  } else {
    computeBezierSegmentControlPoints(controlPoints[i - 1], controlPoints[i], controlPoints[i + 1], controlPoints[i + 2], bezierControlPoints, alpha);
  }

  let t2 = localT * localT;
  let t3 = t2 * localT;
  let s = 1.0 - localT;
  let s2 = s * s;
  let s3 = s2 * s;
  let x = bezierControlPoints[0][0] * s3 + bezierControlPoints[1][0] * 3.0 * localT * s2 + bezierControlPoints[2][0] * 3.0 * t2 * s + bezierControlPoints[3][0] * t3;
  let y = bezierControlPoints[0][1] * s3 + bezierControlPoints[1][1] * 3.0 * localT * s2 + bezierControlPoints[2][1] * 3.0 * t2 * s + bezierControlPoints[3][1] * t3;

  return [x, y];
}

export function computeCatmullRomPoint(controlPoints, t, closedCurve, alpha) {
  if (controlPoints.length < 3) return [0, 0];
  let globalParameter = {};
  let controlPointsCp = controlPoints.slice();

  if (closedCurve) {
    controlPointsCp.push(controlPoints[0]);
  }

  computeCatmullRomGlobalParameter(controlPointsCp, globalParameter, alpha);
  return computeCatmullRomPointImpl(controlPointsCp, t, globalParameter, closedCurve, alpha);
}

export function computeCatmullRomPoints(controlPoints, closedCurve = false, nbCurvePoints = 100, alpha = 0.5) {

  if (controlPoints.length <= 2)
    return [];

  let globalParameter = {};
  let controlPointsCp = controlPoints.slice();

  if (closedCurve) {
    controlPointsCp.push(controlPoints[0]);
  }

  computeCatmullRomGlobalParameter(controlPointsCp, globalParameter, alpha);

  let curvePoints = [];

  for (let i = 0; i < nbCurvePoints; ++i) {
    curvePoints[i] = computeCatmullRomPointImpl(controlPointsCp, i / (nbCurvePoints - 1), globalParameter, closedCurve, alpha);
  }

  return curvePoints;
}
