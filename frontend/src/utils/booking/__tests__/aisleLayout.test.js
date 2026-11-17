import { describe, it, expect } from "vitest";
import {
  calculateSeatPosition,
  extractAislePattern,
} from "../aisleLayout.js";

describe("vertical aisle layout (UI-3)", () => {
  const section = { seatsPerRow: 8 };

  it("keeps mid-row positions when they are passed as numbers", () => {
    expect(extractAislePattern(section, [4])).toEqual([4, 4]);
  });

  it("does not drop aisle records that already lost their type field", () => {
    expect(extractAislePattern(section, [{ position: 4, width: 15 }])).toEqual([4, 4]);
  });

  it("offsets seat X after a mid-row aisle by aisle.width", () => {
    const pattern = extractAislePattern(section, [{ position: 4, width: 20 }]);
    const widths = [20];
    const seat4 = calculateSeatPosition(4, pattern, 28, widths, 0);
    const seat5 = calculateSeatPosition(5, pattern, 28, widths, 0);
    expect(seat5 - seat4).toBe(28 + 20);
    const aisleXStart = seat4 + 28;
    // seat 5 should start after the aisle width, not overlap it
    expect(seat5).toBeGreaterThanOrEqual(aisleXStart + 20);
  });
});
