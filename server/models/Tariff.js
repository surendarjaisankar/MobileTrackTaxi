const mongoose = require("mongoose");

const tariffSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  baseFare: { type: Number, required: true },
  perKmRate: { type: Number, required: true },
  minKm: { type: Number, default: 3 },
});

module.exports = mongoose.model("Tariff", tariffSchema);
