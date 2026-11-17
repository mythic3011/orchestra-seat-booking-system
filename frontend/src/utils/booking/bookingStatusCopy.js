export function formatMoney(amount, currency = "HKD") {
  const value = Number(amount);
  const shown = Number.isFinite(value) ? value.toFixed(2) : "0.00";
  return `${currency} ${shown}`;
}

/**
 * Copy for submit success / confirmation pages.
 * Do not say confirmed or paid unless the server status says so.
 */
export function bookingOutcomeCopy(booking = {}) {
  const status = String(booking.status || "").toLowerCase();
  const paymentStatus = String(booking.paymentStatus || "").toLowerCase();
  const confirmed = status === "confirmed";
  const paid = paymentStatus === "paid";

  if (confirmed && paid) {
    return {
      title: "Booking Confirmed",
      body: "Your booking has been confirmed and paid.",
      notify: "confirmed",
      documentTitle: "Booking Confirmed | User",
    };
  }

  if (confirmed) {
    return {
      title: "Booking Confirmed",
      body: "Your booking is confirmed and is not marked as paid yet.",
      notify: "confirmed",
      documentTitle: "Booking Confirmed | User",
    };
  }

  return {
    title: "Booking Received",
    body: "Your booking is pending and has not been paid.",
    notify: "pending",
    documentTitle: "Booking Received | User",
  };
}

export function placeBookingButtonLabel(amount) {
  return `Place booking · ${formatMoney(amount)}`;
}
