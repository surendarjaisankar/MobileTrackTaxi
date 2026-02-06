const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipientType',
      required: true,
    },
    recipientType: {
      type: String,
      enum: ['Driver', 'Customer'],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'BOOKING_CREATED',
        'DRIVER_ASSIGNED',
        'TRIP_STARTED',
        'TRIP_COMPLETED',
        'FARE_GENERATED',
        'PAYMENT_RECEIVED',
        'CANCELLATION',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    relatedTripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    relatedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    relatedCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    metadata: {
      driverName: String,
      driverPhone: String,
      vehicleType: String,
      vehicleNumber: String,
      fare: Number,
      distance: Number,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentVia: {
      type: String,
      enum: ['WHATSAPP', 'SMS', 'IN_APP'],
      default: 'IN_APP',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
