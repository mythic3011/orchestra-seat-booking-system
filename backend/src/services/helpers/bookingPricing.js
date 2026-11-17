import { BadRequestError } from "#utils/errors.js";

const PRICE_TOLERANCE = 0.01;

const hasClientValue = (value) => value !== undefined && value !== null && value !== "";

/**
 * Replace client ticket prices with server `calculateSeatPrice` results.
 * Rejects a request when a provided ticket price or total amount does not match.
 *
 * @param {Array<Object>} seatTickets
 * @param {Object} performance
 * @param {number|string|null|undefined} clientAmount
 * @param {Function} priceFn
 * @returns {{seatTickets: Array<Object>, totalAmount: number}}
 * @throws {BadRequestError}
 */
export const applyServerAuthoritativePricing = (
  seatTickets,
  performance,
  clientAmount,
  priceFn
) => {
  const priced = [];

  for (const seatTicket of seatTickets) {
    let serverPrice;
    try {
      serverPrice = Number(priceFn(seatTicket.seatId, performance));
    } catch {
      throw new BadRequestError(`Unable to price seat ${seatTicket.seatId}`);
    }

    if (!Number.isFinite(serverPrice) || serverPrice <= 0) {
      throw new BadRequestError(`Unable to price seat ${seatTicket.seatId}`);
    }

    if (hasClientValue(seatTicket.price) && Math.abs(Number(seatTicket.price) - serverPrice) > PRICE_TOLERANCE) {
      throw new BadRequestError("Ticket price does not match server price");
    }

    priced.push({
      ...seatTicket,
      price: serverPrice,
      basePrice: serverPrice,
    });
  }

  const totalAmount = parseFloat(priced.reduce((sum, ticket) => sum + ticket.price, 0).toFixed(2));

  if (hasClientValue(clientAmount) && Math.abs(totalAmount - Number(clientAmount)) > PRICE_TOLERANCE) {
    throw new BadRequestError(
      `Total amount mismatch: calculated ${totalAmount} from seatTickets, but received ${clientAmount}`
    );
  }

  return { seatTickets: priced, totalAmount };
};

export const NEW_BOOKING_STATUS = "pending";
export const NEW_BOOKING_PAYMENT_STATUS = "pending";
