module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("seat_occupancies", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      performanceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "performances", key: "id" },
        onDelete: "CASCADE",
      },
      showtimeKey: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
        comment: "Normalized showtime id; empty string when the booking has no showtime",
      },
      seatId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "bookings", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("seat_occupancies", {
      type: "unique",
      name: "seat_occupancies_performance_showtime_seat_unique",
      fields: ["performanceId", "showtimeKey", "seatId"],
    });

    await queryInterface.addIndex("seat_occupancies", ["bookingId"], {
      name: "seat_occupancies_booking_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("seat_occupancies");
  },
};
