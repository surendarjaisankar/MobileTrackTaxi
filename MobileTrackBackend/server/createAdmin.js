const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Admin.create({
    email: 'admin@mobiletrack.com',
    password: 'admin123',
  });

  console.log('Admin created');
  process.exit();
});
