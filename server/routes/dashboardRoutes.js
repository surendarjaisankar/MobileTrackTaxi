const express = require('express')
const Booking = require('../models/Booking')
const Driver = require('../models/Driver')
const Customer = require('../models/Customer')

const router = express.Router()

router.get("/", async (req, res) => {
  try {

    const totalCustomers = await Customer.countDocuments()
    const activeDrivers = await Driver.countDocuments({ status: "ACTIVE" })
    const activeTrips = await Booking.countDocuments({ status: "ASSIGNED" })
    const pendingBookings = await Booking.countDocuments({ status: "PENDING" })

    const revenueData = await Booking.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$fare.totalFare" }
        }
      }
    ])

    const totalRevenue = revenueData[0]?.total || 0

    res.json({
      success: true,
      stats: {
        totalCustomers,
        activeDrivers,
        activeTrips,
        pendingBookings,
        totalRevenue
      }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
