const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    startLocation: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
    endLocation: {
      address: String,
      latitude: Number,
      longitude: Number,
    },
    actualDistance: {
      type: Number,
      required: true,
    },
    actualDuration: Number, // in minutes
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED'],
      default: 'ACTIVE',
    },
    fare: {
      baseFare: Number,
      distanceCharge: Number,
      waitingCharge: Number,
      tollCharge: Number,
      discount: {
        type: Number,
        default: 0,
      },
      totalFare: {
        type: Number,
        required: true,
      },
    },
    route: [
      {
        latitude: Number,
        longitude: Number,
        timestamp: Date,
      },
    ],
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
