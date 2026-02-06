exports.getStats = async (req, res) => {
  const drivers = await Driver.countDocuments({ status: "Available" });
  const customers = await Customer.countDocuments();
  const activeTrips = await Booking.countDocuments({ status: "On Trip" });

  res.json({ drivers, customers, activeTrips });
};
