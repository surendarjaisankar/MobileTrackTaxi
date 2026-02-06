const express = require('express');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const mongoose = require('mongoose'); // Import mongoose

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const customers = await Customer.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      customers,
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

// Get single customer with booking history
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const bookings = await Booking.find({ customerId: req.params.id })
      .select('bookingId pickupLocation dropoffLocation status fare.totalFare createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      customer,
      recentBookings: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, city, state, zipCode, preferredPaymentMethod } = req.body;

    // Validate required fields
    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, and address',
      });
    }

    const customer = new Customer({
      name,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      preferredPaymentMethod: preferredPaymentMethod || 'CASH',
    });

    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'email',
      'address',
      'city',
      'state',
      'zipCode',
      'status',
      'preferredPaymentMethod',
      'notes',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const customer = await Customer.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update customer status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Customer status updated',
      customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get customer statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const totalBookings = await Booking.countDocuments({ customerId: req.params.id });
    const completedBookings = await Booking.countDocuments({
      customerId: req.params.id,
      status: 'COMPLETED',
    });

    const bookingStats = await Booking.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$fare.totalFare' },
          avgFare: { $avg: '$fare.totalFare' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        completedBookings,
        totalSpent: bookingStats[0]?.totalSpent || 0,
        avgFare: bookingStats[0]?.avgFare || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
