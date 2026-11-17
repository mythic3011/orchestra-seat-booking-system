import { jest } from "@jest/globals";
import { ConflictError } from "#utils/errors.js";
import {
  claimSeatOccupancies,
  isUniqueConstraintError,
  normalizeSeatId,
  normalizeShowtimeKey,
} from "../seatOccupancy.js";

describe("seatOccupancy (T5 harness)", () => {
  it("normalizes showtime and seat identifiers", () => {
    expect(normalizeShowtimeKey(null)).toBe("");
    expect(normalizeShowtimeKey("st-1")).toBe("st-1");
    expect(normalizeSeatId("A-1")).toBe("a-1");
  });

  it("detects Postgres unique violations", () => {
    expect(isUniqueConstraintError({ name: "SequelizeUniqueConstraintError" })).toBe(true);
    expect(isUniqueConstraintError({ original: { code: "23505" } })).toBe(true);
    expect(isUniqueConstraintError({ message: "other" })).toBe(false);
  });

  it("lets the first claim succeed and maps a unique conflict on the second to 409", async () => {
    const model = {
      bulkCreate: jest
        .fn()
        .mockResolvedValueOnce([{ id: 1 }])
        .mockRejectedValueOnce({ name: "SequelizeUniqueConstraintError" }),
    };
    const args = {
      performanceId: 1,
      showtimeId: "st-1",
      seatIds: ["A-1"],
      bookingId: 10,
      transaction: { id: "t" },
      model,
    };

    await expect(claimSeatOccupancies(args)).resolves.toBeUndefined();
    await expect(claimSeatOccupancies({ ...args, bookingId: 11 })).rejects.toBeInstanceOf(ConflictError);
    expect(model.bulkCreate).toHaveBeenCalledTimes(2);
  });
});
