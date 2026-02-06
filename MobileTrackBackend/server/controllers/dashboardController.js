const Driver = require("../models/Driver");
const Booking = require("../models/Booking");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ status: "ACTIVE" });
    const onTripDrivers = await Driver.countDocuments({ status: "ON_TRIP" });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "PENDING" });
    const completedBookings = await Booking.countDocuments({ status: "COMPLETED" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = await Booking.find({
      createdAt: { $gte: today },
      status: "COMPLETED",
    });

    const todayRevenue = todayBookings.reduce(
      (sum, booking) => sum + (booking.fare?.totalFare || 0),
      0
    );

    res.json({
      success: true,
      stats: {
        totalDrivers,
        activeDrivers,
        onTripDrivers,
        totalBookings,
        pendingBookings,
        completedBookings,
        todayRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getTopDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .sort({ totalEarnings: -1 })
      .limit(5);

    res.json({
      success: true,
      drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getDriverAvailability = async (req, res) => {
  try {
    const availability = await Driver.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      availability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


