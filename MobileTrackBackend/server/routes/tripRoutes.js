const express = require('express');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, driverId, customerId, dateFrom, dateTo } = req.query;
    let query = {};

    if (status) query.status = status;
    if (driverId) query.driverId = mongoose.Types.ObjectId(driverId);
    if (customerId) query.customerId = mongoose.Types.ObjectId(customerId);

    if (dateFrom || dateTo) {
      query.startTime = {};
      if (dateFrom) query.startTime.$gte = new Date(dateFrom);
      if (dateTo) query.startTime.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const trips = await Trip.find(query)
      .populate('driverId', 'name phone vehicleType registrationNumber')
      .populate('customerId', 'name phone')
      .populate('bookingId', 'bookingId vehicleType bookingType')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ startTime: -1 });

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      trips,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('driverId')
      .populate('customerId')
      .populate('bookingId');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({
      success: true,
      trip,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update trip route
router.put('/:id/route', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude',
      });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.route.push({
      latitude,
      longitude,
      timestamp: new Date(),
    });

    await trip.save();

    res.json({
      success: true,
      message: 'Route updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trip statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { dateFrom, dateTo, driverId, customerId } = req.query;
    let query = { status: 'COMPLETED' };

    if (driverId) query.driverId = mongoose.Types.ObjectId(driverId);
    if (customerId) query.customerId = mongoose.Types.ObjectId(customerId);

    if (dateFrom || dateTo) {
      query.startTime = {};
      if (dateFrom) query.startTime.$gte = new Date(dateFrom);
      if (dateTo) query.startTime.$lte = new Date(dateTo);
    }

    const stats = await Trip.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$actualDistance' },
          totalRevenue: { $sum: '$fare.totalFare' },
          avgDistance: { $avg: '$actualDistance' },
          avgFare: { $avg: '$fare.totalFare' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalTrips: 0,
        totalDistance: 0,
        totalRevenue: 0,
        avgDistance: 0,
        avgFare: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
