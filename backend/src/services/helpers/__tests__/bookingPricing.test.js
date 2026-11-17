import { applyServerAuthoritativePricing } from "../bookingPricing.js";
import { BadRequestError } from "#utils/errors.js";

const performance = { id: "perf-1" };
const priceFn = (seatId) => ({ "A-1": 120, "A-2": 80 }[seatId]);

describe("applyServerAuthoritativePricing (T4)", () => {
  it("persists server prices when the client omits price and amount", () => {
    const result = applyServerAuthoritativePricing(
      [{ seatId: "A-1", seatLabel: "A1" }, { seatId: "A-2", seatLabel: "A2" }],
      performance,
      undefined,
      priceFn
    );

    expect(result.totalAmount).toBe(200);
    expect(result.seatTickets.map((t) => t.price)).toEqual([120, 80]);
  });

  it("accepts a client amount that matches the server total", () => {
    const result = applyServerAuthoritativePricing(
      [{ seatId: "A-1", price: 120 }, { seatId: "A-2", price: 80 }],
      performance,
      200,
      priceFn
    );
    expect(result.totalAmount).toBe(200);
  });

  it("rejects client ticket prices that undershoot the server price", () => {
    expect(() =>
      applyServerAuthoritativePricing(
        [{ seatId: "A-1", price: 1 }, { seatId: "A-2", price: 1 }],
        performance,
        2,
        priceFn
      )
    ).toThrow(BadRequestError);
  });

  it("rejects a client amount that undershoots the server total", () => {
    expect(() =>
      applyServerAuthoritativePricing(
        [{ seatId: "A-1" }, { seatId: "A-2" }],
        performance,
        2,
        priceFn
      )
    ).toThrow(/Total amount mismatch/);
  });
});
