const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const calculateFare = require("../utils/calculateFare");
const generateBookingId = require("../utils/generateBookingId");
const sendWhatsAppMessage = require("../utils/whatsappService");


/* =====================================================
   GET ALL BOOKINGS
===================================================== */
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("driver")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings: bookings
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* =====================================================
   CREATE BOOKING
===================================================== */
exports.createBooking = async (req, res) => {
  try {
    const {
      driver,
      distanceKm,
      acRequired,
      customerPhone,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      vehicleType,
      bookingType,
    } = req.body;

    if (
      !customerPhone ||
      !pickupLocation?.address ||
      !dropoffLocation?.address ||
      !pickupTime ||
      !vehicleType ||
      !bookingType
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Calculate Fare
    const fareDetails = await calculateFare(vehicleType, distanceKm || 0);

    const bookingData = {
      bookingId: generateBookingId(),
      customerPhone,
      pickupLocation,
      dropoffLocation,
      pickupTime: new Date(pickupTime),
      vehicleType,
      bookingType,
      distanceKm: distanceKm || 0,
      acRequired: acRequired ?? true,
      fare: fareDetails,
      status: driver ? "ASSIGNED" : "PENDING",
    };

    let selectedDriver = null;

    // Manual driver assignment
    if (driver) {
      selectedDriver = await Driver.findById(driver);

      if (!selectedDriver)
        return res.status(404).json({ message: "Driver not found" });

      if (selectedDriver.status !== "ACTIVE")
        return res.status(400).json({ message: "Driver not available" });

      bookingData.driver = selectedDriver._id;

      selectedDriver.status = "ON_TRIP";
      selectedDriver.totalTrips += 1;
      await selectedDriver.save();
    }

    const booking = await Booking.create(bookingData);

    // WhatsApp Notification (optional)
    if (selectedDriver) {
      const message = `
🚖 New Trip Assigned

Booking ID: ${booking.bookingId}
Pickup: ${booking.pickupLocation.address}
Drop: ${booking.dropoffLocation.address}
Customer: ${booking.customerPhone}
Fare: ₹${booking.fare?.totalFare || 0}
      `;

      try {
        await sendWhatsAppMessage(selectedDriver.phone, message);
      } catch (err) {
        console.error("WhatsApp failed:", err.message);
      }
    }

    res.status(201).json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* =====================================================
   ASSIGN DRIVER (Manual from Admin Panel)
===================================================== */
exports.assignDriver = async (req, res) => {
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
    driver.totalTrips += 1;
    await driver.save();

    // Fetch customer
    const customer = await Customer.findOne({
      phone: booking.customerPhone,
    });

    const formatNumber = (num) => {
      const digits = num.replace(/\D/g, "");
      return digits.startsWith("91") ? digits : `91${digits}`;
    };

    const driverNumber = formatNumber(driver.phone);
    const customerNumber = formatNumber(customer?.phone || "");

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
};


/* =====================================================
   COMPLETE TRIP
===================================================== */
exports.completeTrip = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = "COMPLETED";
    booking.paymentStatus = "COLLECTED";
    booking.actualDropoffTime = new Date();
    await booking.save();

    if (booking.driver) {
      const driver = await Driver.findById(booking.driver);

      if (driver) {
        driver.status = "ACTIVE";
        driver.totalEarnings += booking.fare?.totalFare || 0;
        await driver.save();
      }
    }

    res.json({
      success: true,
      message: "Trip completed successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   GET BOOKING BY ID
===================================================== */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("driver");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    res.json({ success: true, booking });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   UPDATE TRIP STATUS
===================================================== */
exports.updateTripStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = status;

    if (status === "ON_TRIP") {
      booking.startedAt = new Date();
    }

    if (status === "COMPLETED") {
      booking.completedAt = new Date();
    }

    await booking.save();

    res.json({
      success: true,
      message: "Trip status updated",
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};
