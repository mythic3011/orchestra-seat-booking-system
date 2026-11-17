import { describe, it, expect } from "vitest";
import {
  displayedSeatNumber,
  layoutSeatFullId,
  shouldOmitSeatIndex,
} from "../seatIdHelper.js";

describe("layout seat IDs (UI-2)", () => {
  const numbering = { startNumber: 5, skipSeatIndices: [1], emptySeatIndices: [3] };

  it("diverges from seatIndex + 1 when startNumber is not 1", () => {
    expect(displayedSeatNumber(numbering, 0)).toBe(5);
    expect(displayedSeatNumber({ startNumber: 1 }, 0)).toBe(1);
  });

  it("omits skip and empty indices the same way for generator and BookingPage", () => {
    expect(shouldOmitSeatIndex(numbering, 1)).toBe(true);
    expect(shouldOmitSeatIndex(numbering, 3)).toBe(true);
    expect(shouldOmitSeatIndex(numbering, 0)).toBe(false);
  });

  it("produces one fullId for a non-default startNumber", () => {
    const id = layoutSeatFullId("Orchestra", "A", numbering, 0);
    expect(id).toBe("orchestra-a5");
    expect(id).not.toBe("orchestra-a1");
  });
});
