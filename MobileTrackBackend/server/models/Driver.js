const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    licenseExpiry: {
      type: Date,
    },
    vehicleType: {
  type: String,
  enum: ["MINI", "SEDAN", "SUV_MUV"],
  required: true,
},

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_TRIP', 'ON_BREAK'],
      default: 'ACTIVE',
    },
    Location: {
      lat: Number,
      lng: Number,
    },
    attendanceHistory: [
      {
        status: String,
        date: Date,
      },
    ],
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
 totalEarnings: {
  type: Number,
  default: 0,
},

    photo: String,
    address: String,
    city: String,
    bankAccountName: String,
    bankAccountNumber: String,
    bankIFSC: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
