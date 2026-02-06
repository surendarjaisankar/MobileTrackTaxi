const express = require('express');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const mongoose = require('mongoose'); // Import mongoose

const router = express.Router();

//router.get('/', getDrivers)
//router.post('/', createDriver)



// Get all drivers
router.get('/', async (req, res) => {
  try {
    const { status, vehicleType, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (vehicleType) query.vehicleType = vehicleType;

    const skip = (page - 1) * limit;

    const drivers = await Driver.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Driver.countDocuments(query);

    res.json({
      success: true,
      drivers,
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

// Get single driver with trip history
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const trips = await Trip.find({ driverId: req.params.id })
      .select('bookingId startTime endTime actualDistance fare.totalFare status')
      .sort({ startTime: -1 })
      .limit(50);

    res.json({
      success: true,
      driver,
      recentTrips: trips,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create driver
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      licenseNumber,
      vehicleType,
      registrationNumber,
      licenseExpiry,
      address,
      city,
      bankAccountName,
      bankAccountNumber,
      bankIFSC,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !licenseNumber || !vehicleType || !registrationNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [{ phone }, { licenseNumber }, { registrationNumber }],
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver with this phone, license, or registration already exists',
      });
    }

    const driver = new Driver({
      name,
      phone,
      licenseNumber,
      vehicleType,
      registrationNumber,
      licenseExpiry,
      address,
      city,
      bankAccountName,
      bankAccountNumber,
      bankIFSC,
    });

    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      driver,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver
router.put('/:id', async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'licenseNumber',
      'licenseExpiry',
      'vehicleType',
      'registrationNumber',
      'status',
      'address',
      'city',
      'bankAccountName',
      'bankAccountNumber',
      'bankIFSC',
      'notes',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const driver = await Driver.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({
      success: true,
      message: 'Driver updated successfully',
      driver,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update driver status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'ON_TRIP', 'ON_BREAK'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({
      success: true,
      message: 'Driver status updated',
      driver,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    // Check if driver has any active trips
    const activeTrip = await Trip.findOne({
      driverId: req.params.id,
      status: 'ACTIVE',
    });

    if (activeTrip) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver with active trips',
      });
    }

    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get driver statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const totalTrips = await Trip.countDocuments({ driverId: req.params.id });
    const completedTrips = await Trip.countDocuments({
      driverId: req.params.id,
      status: 'COMPLETED',
    });

    const tripStats = await Trip.aggregate([
      { $match: { driverId: mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$actualDistance' },
          totalEarnings: { $sum: '$fare.totalFare' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalTrips,
        completedTrips,
        totalDistance: tripStats[0]?.totalDistance || 0,
        totalEarnings: tripStats[0]?.totalEarnings || 0,
        rating: driver.rating,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
