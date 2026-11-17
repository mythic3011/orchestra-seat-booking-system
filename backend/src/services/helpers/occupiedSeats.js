/**
 * Collect occupying seat IDs from booking rows (seats ∪ seatTickets).
 * Occupying statuses are pending and confirmed, matching P0-3.
 */

export const OCCUPYING_BOOKING_STATUSES = ["pending", "confirmed"];

export const normalizeOccupiedSeatId = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value).toLowerCase();
};

export const seatIdFromValue = (seat) => {
  if (seat === undefined || seat === null || seat === "") {
    return null;
  }
  if (typeof seat === "string") {
    return normalizeOccupiedSeatId(seat);
  }
  return normalizeOccupiedSeatId(seat.fullId || seat.seatId || seat.id);
};

export const collectOccupiedSeatIdsFromBookings = (bookings = []) => {
  const ids = new Set();
  for (const booking of bookings) {
    for (const seat of booking.seats || []) {
      const id = seatIdFromValue(seat);
      if (id) {
        ids.add(id);
      }
    }
    for (const ticket of booking.seatTickets || []) {
      const id = seatIdFromValue(ticket);
      if (id) {
        ids.add(id);
      }
    }
  }
  return [...ids];
};

export const mergeOccupiedSeatIds = (...lists) => {
  const ids = new Set();
  for (const list of lists) {
    for (const value of list || []) {
      const id = normalizeOccupiedSeatId(value);
      if (id) {
        ids.add(id);
      }
    }
  }
  return [...ids];
};
