import {
  collectOccupiedSeatIdsFromBookings,
  mergeOccupiedSeatIds,
} from "../occupiedSeats.js";

describe("collectOccupiedSeatIdsFromBookings (UI-1)", () => {
  it("unions seats and seatTickets and lowercases ids", () => {
    const ids = collectOccupiedSeatIdsFromBookings([
      { seats: ["A-1", { fullId: "B-2" }], seatTickets: [{ seatId: "C-3" }] },
      { seats: [{ seatId: "a-1" }], seatTickets: [] },
    ]);
    expect(ids.sort()).toEqual(["a-1", "b-2", "c-3"]);
  });

  it("merges occupancy-table ids with booking-derived ids", () => {
    expect(mergeOccupiedSeatIds(["A-1"], ["a-2"]).sort()).toEqual(["a-1", "a-2"]);
  });
});
