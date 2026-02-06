const Driver = require("../models/Driver");

exports.createDriver = async (req, res) => {
  try {
    const { name, phone, license, vehicle, status } = req.body;

    // 🔥 Normalize phone number
    let cleanPhone = phone.replace(/\D/g, "");

    // Add country code if missing (India example)
    if (!cleanPhone.startsWith("91")) {
      cleanPhone = "91" + cleanPhone;
    }

    const driver = await Driver.create({
      name,
      phone: cleanPhone,
      license,
      vehicle,
      status: status || "Available",
    });

    res.status(201).json({ success: true, driver });

  } catch (error) {
    console.error("CREATE DRIVER ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
