const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const Trip = require("../models/Trip");
const { calculateFare } = require("../utils/tariffCalculator");


// =====================================================
// GENERATE BOOKING ID
// =====================================================
const generateBookingId = async () => {
  const count = await Booking.countDocuments();
  const date = new Date();
  const dateStr =
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");

  return `BK-${dateStr}-${String(count + 1).padStart(4, "0")}`;
};


// =====================================================
// CREATE BOOKING
// =====================================================
router.post("/", async (req, res) => {
  try {
    const {
      customerPhone,
      vehicleType,
      bookingType,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      acRequired,
      distanceKm,
      specialRequests,
    } = req.body;

    if (
      !customerPhone ||
      !vehicleType ||
      !bookingType ||
      !pickupLocation?.address ||
      !dropoffLocation?.address ||
      !pickupTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    let customer = await Customer.findOne({ phone: customerPhone });

    if (!customer) {
      customer = await Customer.create({
        name: "Walk-in Customer",
        phone: customerPhone,
        address: pickupLocation.address,
      });
    }

    const bookingId = await generateBookingId();

    const booking = await Booking.create({
      bookingId,
      customer: customer._id,
      customerPhone,
      vehicleType,
      bookingType,
      pickupLocation,
      dropoffLocation,
      pickupTime: new Date(pickupTime),
      acRequired: acRequired ?? true,
      distanceKm: distanceKm || 0,
      specialRequests,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// =====================================================
// GET ALL BOOKINGS (WITH FILTERS)
// =====================================================
router.get("/", async (req, res) => {
  try {
    const { status, bookingType, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate("customer", "name phone address")
      .populate("driver", "name phone registrationNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
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


// =====================================================
// GET BOOKING BY ID
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer")
      .populate("driver");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({
      success: true,
      booking,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// =====================================================
// ASSIGN DRIVER
// =====================================================
router.post("/assign", async (req, res) => {
  try {
    const { bookingId, driverId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    const driver = await Driver.findById(driverId);
    if (!driver)
      return res.status(404).json({ message: "Driver not found" });

    if (driver.status !== "ACTIVE")
      return res.status(400).json({ message: "Driver not available" });

    booking.driver = driver._id;
    booking.status = "ASSIGNED";
    await booking.save();

    driver.status = "ON_TRIP";
    await driver.save();

    const formatNumber = (num) => {
      const digits = num.replace(/\D/g, "");
      return digits.startsWith("91") ? digits : `91${digits}`;
    };

    const driverNumber = formatNumber(driver.phone);
    const customerNumber = formatNumber(booking.customerPhone);

    const driverMessage = `
🚖 New Trip Assigned

Pickup: ${booking.pickupLocation.address}
Drop: ${booking.dropoffLocation.address}
Customer: ${booking.customerPhone}
`;

    const customerMessage = `
✅ Driver Assigned

Driver: ${driver.name}
Phone: ${driver.phone}
Vehicle: ${driver.registrationNumber}
`;

    const driverWhatsAppURL =
      `https://wa.me/${driverNumber}?text=${encodeURIComponent(driverMessage)}`;

    const customerWhatsAppURL =
      `https://wa.me/${customerNumber}?text=${encodeURIComponent(customerMessage)}`;

    res.json({
      success: true,
      message: "Driver assigned successfully",
      driverWhatsAppURL,
      customerWhatsAppURL,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// =====================================================
// START TRIP
// =====================================================
router.post("/:id/start-trip", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.status !== "ASSIGNED")
      return res.status(400).json({
        success: false,
        message: "Booking must be assigned first",
      });

    const trip = await Trip.create({
      bookingId: booking._id,
      driverId: booking.driver,
      customerId: booking.customer,
      startTime: new Date(),
      startLocation: booking.pickupLocation,
      status: "ACTIVE",
    });

    booking.status = "STARTED";
    await booking.save();

    res.json({ success: true, trip });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const generateInvoiceNumber = async () => {
  const today = new Date();

  const dateStr =
    today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  const count = await Booking.countDocuments({
    invoiceNumber: { $exists: true }
  });

  return `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};



router.post('/:id/complete', async (req, res) => {
  try {
    const {
      actualDistance,
      durationMinutes = 0,
      dayHalt = 0,
      nightHalt = 0
    } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('driver');

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    const { calculateFare } = require('../utils/tariffCalculator');

    const fareDetails = await calculateFare({
      bookingType: booking.bookingType,
      vehicleType: booking.vehicleType,
      distance: actualDistance,
      duration: durationMinutes,
      acRequired: booking.acRequired,
      dayHalt,
      nightHalt
    });

    booking.status = "COMPLETED";
    booking.distanceKm = actualDistance;
    booking.actualDropoffTime = new Date();
    booking.fare = fareDetails;
    booking.paymentStatus = "COLLECTED";

    await booking.save();

    // Update driver earnings
    if (booking.driver) {
      booking.driver.status = "ACTIVE";
      booking.driver.totalEarnings =
        (booking.driver.totalEarnings || 0) + fareDetails.totalFare;

      booking.driver.totalTrips =
        (booking.driver.totalTrips || 0) + 1;

      await booking.driver.save();
    }

    res.json({
      success: true,
      message: "Trip completed successfully, Thank you for choosing Mobile Track Taxi!",
invoice: {
    invoiceNumber: booking.invoiceNumber,
    bookingId: booking.bookingId,
    distance: actualDistance,
    fare: fareDetails
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// =====================================================
// COMPLETE BOOKING
// =====================================================
router.post("/:id/complete", async (req, res) => {
  try {
    const { actualDistance } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    const trip = await Trip.findOne({ bookingId: booking._id, status: "ACTIVE" });
    if (!trip)
      return res.status(404).json({ success: false, message: "Active trip not found" });

    const endTime = new Date();

    const fareData = await calculateFare({
      bookingType: booking.bookingType,
      vehicleType: booking.vehicleType,
      distance: actualDistance,
      acRequired: booking.acRequired,
    });

    trip.endTime = endTime;
    trip.actualDistance = actualDistance;
    trip.status = "COMPLETED";
    trip.fare = fareData;
    await trip.save();

    booking.status = "COMPLETED";
    booking.fare = fareData;
    booking.actualDropoffTime = endTime;
    await booking.save();

    const invoiceMessage = `
🧾 MOBILE TRACK TAXI

Invoice No: ${invoiceNumber}
Booking ID: ${booking.bookingId}
Distance: ${actualDistance} KM

Base Fare: ₹${fareDetails.baseFare || 0}
Distance Charge: ₹${fareDetails.distanceCharge || 0}
Waiting: ₹${fareDetails.waitingCharge || 0}
Driver Batta: ₹${fareDetails.driverBatta || 0}

Total Amount: ₹${fareDetails.totalFare}

Thank you for choosing us!
`;

const formattedNumber = booking.customerPhone.startsWith("91")
  ? booking.customerPhone
  : `91${booking.customerPhone}`;

const whatsappURL =
  `https://wa.me/${formattedNumber}?text=${encodeURIComponent(invoiceMessage)}`;


    await Driver.findByIdAndUpdate(booking.driver, {
      status: "ACTIVE",
      $inc: { totalTrips: 1, totalEarnings: fareData.totalFare },
    });

    res.json({
      success: true,
      message: "Booking completed",
      booking,
      trip,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// =====================================================
// CANCEL BOOKING
// =====================================================
router.post("/:id/cancel", async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.status === "COMPLETED")
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking",
      });

    booking.status = "CANCELLED";
    booking.notes = reason;
    await booking.save();

    if (booking.driver) {
      await Driver.findByIdAndUpdate(booking.driver, { status: "ACTIVE" });
    }

    res.json({
      success: true,
      message: "Booking cancelled",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
