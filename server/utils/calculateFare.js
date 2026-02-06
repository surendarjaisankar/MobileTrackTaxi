const Tariff = require("../models/Tariff");

module.exports = async function calculateFare(vehicleType, distanceKm) {
  const tariff = await Tariff.findOne({ vehicleType });

  if (!tariff) throw new Error("Tariff not configured");

  const billableKm = Math.max(distanceKm, tariff.minKm);

  return tariff.baseFare + (billableKm * tariff.perKmRate);
};
