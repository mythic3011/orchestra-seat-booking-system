/**
 * Vertical aisle pattern and seat X placement.
 * Positions may be numbers or aisle records. Do not drop numeric positions
 * by re-filtering them as `a.type === "vertical"`.
 */

export function normalizeVerticalAislePositions(rawAisles = []) {
  return rawAisles
    .map((aisle) => {
      if (typeof aisle === "number" && Number.isFinite(aisle)) {
        return aisle;
      }
      if (!aisle || typeof aisle !== "object") {
        return null;
      }
      if (aisle.type && aisle.type !== "vertical") {
        return null;
      }
      if (aisle.position !== undefined) {
        return aisle.position;
      }
      if (aisle.afterSeat !== undefined) {
        return aisle.afterSeat;
      }
      return null;
    })
    .filter((position) => position !== null && position !== undefined)
    .sort((a, b) => a - b);
}

export function extractAislePattern(section, rawAisles) {
  const verticalAisles = normalizeVerticalAislePositions(rawAisles);

  if (verticalAisles.length === 0) {
    return [section.seatsPerRow];
  }

  const pattern = [];
  let lastPos = 0;

  verticalAisles.forEach((aislePos) => {
    pattern.push(aislePos - lastPos);
    lastPos = aislePos;
  });

  pattern.push(section.seatsPerRow - lastPos);
  return pattern;
}

export function calculateSeatPosition(
  seatNum,
  aislePattern,
  spacingX,
  verticalAisleWidths,
  startX
) {
  let currentSeatInPattern = seatNum;
  let seatsBefore = 0;
  let patternIndex = 0;

  for (let i = 0; i < aislePattern.length; i++) {
    if (currentSeatInPattern <= aislePattern[i]) {
      patternIndex = i;
      break;
    }
    currentSeatInPattern -= aislePattern[i];
    seatsBefore += aislePattern[i];
  }

  const aisleOffset = (verticalAisleWidths || [])
    .slice(0, patternIndex)
    .reduce((sum, width) => sum + width, 0);

  return (
    startX +
    seatsBefore * spacingX +
    aisleOffset +
    (seatNum - seatsBefore - 1) * spacingX
  );
}
