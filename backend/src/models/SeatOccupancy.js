/**
 * @file SeatOccupancy.js
 * @description One occupying row per performance + showtime + seat
 */

import { DataTypes } from "sequelize";
import sequelize from "#config/database.js";

const SeatOccupancy = sequelize.define(
  "SeatOccupancy",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    performanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    showtimeKey: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    seatId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "seat_occupancies",
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: "seat_occupancies_performance_showtime_seat_unique",
        fields: ["performanceId", "showtimeKey", "seatId"],
      },
    ],
  }
);

export default SeatOccupancy;
