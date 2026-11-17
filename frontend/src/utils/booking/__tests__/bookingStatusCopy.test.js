import { describe, it, expect } from "vitest";
import {
  bookingOutcomeCopy,
  formatMoney,
  placeBookingButtonLabel,
} from "../bookingStatusCopy.js";

describe("booking status copy (UI-4)", () => {
  it("does not say confirmed or paid for a pending booking", () => {
    const copy = bookingOutcomeCopy({ status: "pending", paymentStatus: "pending" });
    expect(copy.title).toBe("Booking Received");
    expect(copy.body.toLowerCase()).not.toMatch(/confirmed/);
    expect(copy.body.toLowerCase()).toMatch(/pending/);
    expect(copy.notify).toBe("pending");
  });

  it("keeps confirmed/paid copy when the server says so", () => {
    const copy = bookingOutcomeCopy({ status: "confirmed", paymentStatus: "paid" });
    expect(copy.title).toBe("Booking Confirmed");
    expect(copy.notify).toBe("confirmed");
  });

  it("uses a single HKD helper instead of a $ amount string", () => {
    expect(formatMoney(120)).toBe("HKD 120.00");
    expect(placeBookingButtonLabel(120)).toBe("Place booking · HKD 120.00");
    expect(placeBookingButtonLabel(120)).not.toMatch(/\$/);
  });
});
