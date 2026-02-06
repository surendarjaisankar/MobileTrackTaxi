const calculateFare = async ({
  bookingType,
  vehicleType,
  distance = 0,
  duration = 0,
  acRequired = true,
  dayHalt = 0,
  nightHalt = 0
}) => {

  let totalFare = 0;
  let breakdown = {};

  const isSUV = vehicleType === "SUV" || vehicleType === "SUV_MUV";

  // ---------------- LOCAL ----------------
  if (bookingType === "LOCAL") {

    let minimumFare = isSUV ? 300 : 200;
    let perKmRate = isSUV ? 30 : 25;
    let waitingRate = isSUV ? 6 : 4;

    if (distance <= 3) {
      totalFare = minimumFare;
    } else {
      totalFare = minimumFare + ((distance - 3) * perKmRate);
    }

    const waitingCharge = Math.ceil(duration) * waitingRate;
    totalFare += waitingCharge;

    breakdown = {
      baseFare: minimumFare,
      distanceCharge: distance > 3 ? (distance - 3) * perKmRate : 0,
      waitingCharge,
      totalFare
    };
  }

  // ---------------- DAY RENT ----------------
  else if (bookingType === "DAY_RENT") {

    let baseRate;
    let extraKmRate;

    if (isSUV) {
      baseRate = acRequired ? 4600 : 4400;
      extraKmRate = acRequired ? 17 : 16;
    } else {
      baseRate = acRequired ? 3400 : 3200;
      extraKmRate = acRequired ? 14 : 13;
    }

    if (distance <= 200) {
      totalFare = baseRate;
    } else {
      totalFare = baseRate + ((distance - 200) * extraKmRate);
    }

    breakdown = {
      baseFare: baseRate,
      distanceCharge: distance > 200 ? (distance - 200) * extraKmRate : 0,
      totalFare
    };
  }

  // ---------------- OUTSTATION ----------------
  else if (bookingType === "OUTSTATION") {

    let perKmRate;

    if (isSUV) {
      perKmRate = acRequired ? 17 : 16;
    } else {
      perKmRate = acRequired ? 14 : 13;
    }

    const driverBatta = 500;

    totalFare =
      (distance * perKmRate) +
      driverBatta +
      (dayHalt * 1200) +
      (nightHalt * 700);

    breakdown = {
      distanceCharge: distance * perKmRate,
      driverBatta,
      dayHalt: dayHalt * 1200,
      nightHalt: nightHalt * 700,
      totalFare
    };
  }

  else {
    throw new Error("Invalid booking type");
  }

  return breakdown;
};

module.exports = { calculateFare };
