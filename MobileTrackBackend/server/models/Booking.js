const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },

    // ❌ Removed required: true (admin portal)
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },

    // ✅ Uppercase to match frontend
    vehicleType: {
      type: String,
      enum: ['MINI', 'SEDAN', 'SUV_MUV'],
      required: true,
    },

    bookingType: {
      type: String,
      enum: ['LOCAL', 'DAY_RENT', 'OUTSTATION', 'PACKAGE'],
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    pickupLocation: {
      address: { type: String, required: true },
      latitude: Number,
      longitude: Number,
    },

    dropoffLocation: {
      address: { type: String, required: true },
      latitude: Number,
      longitude: Number,
    },

    pickupTime: {
      type: Date,
      required: true,
    },

    estimatedDropoffTime: Date,
    actualDropoffTime: Date,

    distanceKm: Number,
    durationMinutes: Number,

    acRequired: {
      type: Boolean,
      default: true,
    },

    specialRequests: String,
    estimatedFare: Number,

status: {
  type: String,
  enum: ['PENDING', 'ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED'],
  default: 'PENDING'
},
invoiceNumber: {
  type: String,
  unique: true,
  sparse: true
},
startedAt: Date,
completedAt: Date,

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COLLECTED', 'FAILED'],
      default: 'PENDING',
    },

    paymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE'],
      default: 'CASH',
    },

fare: {
  baseFare: Number,
  distanceCharge: Number,
  waitingCharge: Number,
  driverBatta: Number,
  dayHalt: Number,
  nightHalt: Number,
  totalFare: Number
},
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
