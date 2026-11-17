import { ConflictError } from "#utils/errors.js";

export const OCCUPYING_BOOKING_STATUSES = ["pending", "confirmed"];

export const normalizeShowtimeKey = (showtimeId) =>
  showtimeId === undefined || showtimeId === null ? "" : String(showtimeId);

export const normalizeSeatId = (seatId) => String(seatId).toLowerCase();

export const isUniqueConstraintError = (error) =>
  error?.name === "SequelizeUniqueConstraintError" ||
  error?.original?.code === "23505" ||
  error?.parent?.code === "23505";

/**
 * Insert one occupancy row per seat inside the caller's transaction.
 * A unique (performance, showtime, seat) conflict becomes a 409.
 *
 * @param {Object} params
 * @param {number} params.performanceId
 * @param {string|null|undefined} params.showtimeId
 * @param {string[]} params.seatIds
 * @param {number} params.bookingId
 * @param {import("sequelize").Transaction} params.transaction
 * @param {typeof SeatOccupancy} [params.model]
 * @returns {Promise<void>}
 */
const resolveModel = async (model) => {
  if (model) {
    return model;
  }
  const { SeatOccupancy } = await import("#models/index.js");
  return SeatOccupancy;
};

export const claimSeatOccupancies = async ({
  performanceId,
  showtimeId,
  seatIds,
  bookingId,
  transaction,
  model,
}) => {
  const occupancyModel = await resolveModel(model);
  const showtimeKey = normalizeShowtimeKey(showtimeId);
  const rows = seatIds.map((seatId) => ({
    performanceId,
    showtimeKey,
    seatId: normalizeSeatId(seatId),
    bookingId,
  }));

  try {
    await occupancyModel.bulkCreate(rows, { transaction, validate: true });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ConflictError("One or more seats are already booked");
    }
    throw error;
  }
};

export const releaseSeatOccupancies = async ({ bookingId, transaction, model }) => {
  const occupancyModel = await resolveModel(model);
  await occupancyModel.destroy({ where: { bookingId }, transaction });
};
