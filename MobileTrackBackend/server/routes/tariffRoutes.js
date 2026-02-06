const express = require('express');
const Tariff = require('../models/Tariff');

const router = express.Router();

// Get all tariffs
router.get('/', async (req, res) => {
  try {
    const tariffs = await Tariff.find().sort({ vehicleType: 1 });

    res.json({
      success: true,
      tariffs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get tariff by vehicle type
router.get('/:vehicleType', async (req, res) => {
  try {
    const tariff = await Tariff.findOne({ vehicleType: req.params.vehicleType });

    if (!tariff) {
      return res.status(404).json({ success: false, message: 'Tariff not found' });
    }

    res.json({
      success: true,
      tariff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create tariff
router.post('/', async (req, res) => {
  try {
    const { vehicleType, localTariff, dayRent, outstationTariff, packageTariff } = req.body;

    if (!vehicleType || !localTariff || !dayRent || !outstationTariff) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required tariff details',
      });
    }

    // Check if tariff already exists
    const existingTariff = await Tariff.findOne({ vehicleType });
    if (existingTariff) {
      return res.status(400).json({
        success: false,
        message: 'Tariff already exists for this vehicle type',
      });
    }

    const tariff = new Tariff({
      vehicleType,
      localTariff,
      dayRent,
      outstationTariff,
      packageTariff,
    });

    await tariff.save();

    res.status(201).json({
      success: true,
      message: 'Tariff created successfully',
      tariff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update tariff
router.put('/:vehicleType', async (req, res) => {
  try {
    const { localTariff, dayRent, outstationTariff, packageTariff, isActive } = req.body;

    const updates = {};
    if (localTariff) updates.localTariff = localTariff;
    if (dayRent) updates.dayRent = dayRent;
    if (outstationTariff) updates.outstationTariff = outstationTariff;
    if (packageTariff) updates.packageTariff = packageTariff;
    if (isActive !== undefined) updates.isActive = isActive;

    const tariff = await Tariff.findOneAndUpdate({ vehicleType: req.params.vehicleType }, updates, {
      new: true,
      runValidators: true,
    });

    if (!tariff) {
      return res.status(404).json({ success: false, message: 'Tariff not found' });
    }

    res.json({
      success: true,
      message: 'Tariff updated successfully',
      tariff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete tariff
router.delete('/:vehicleType', async (req, res) => {
  try {
    const tariff = await Tariff.findOneAndDelete({ vehicleType: req.params.vehicleType });

    if (!tariff) {
      return res.status(404).json({ success: false, message: 'Tariff not found' });
    }

    res.json({
      success: true,
      message: 'Tariff deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
