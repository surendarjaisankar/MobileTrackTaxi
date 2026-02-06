const Customer = require('../models/Customer')

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 })
    res.json({ success: true, customers })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" })
    }

    // 🔥 Normalize phone
    let cleanPhone = phone.replace(/\D/g, "")

    // Add India country code if missing
    if (!cleanPhone.startsWith("91")) {
      cleanPhone = "91" + cleanPhone
    }

    const customer = await Customer.create({
      name,
      phone: cleanPhone,
      address
    })

    res.status(201).json({ success: true, customer })

  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error)
    res.status(400).json({ success: false, message: error.message })
  }
}
