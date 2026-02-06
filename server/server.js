const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

dotenv.config()

const app = express()
const server = http.createServer(app)

// ----------------------
// CORS CONFIG
// ----------------------
const allowedOrigin =
  process.env.FRONTEND_URL || 'http://localhost:3000'

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
)

// ----------------------
// SOCKET.IO CONFIG
// ----------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('driverLocationUpdate', (data) => {
    io.emit('locationUpdate', data)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ----------------------
// ROUTES
// ----------------------
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/drivers', require('./routes/driverRoutes'))
app.use('/api/customers', require('./routes/customerRoutes'))
app.use('/api/bookings', require('./routes/bookingRoutes'))
app.use('/api/trips', require('./routes/tripRoutes'))
app.use('/api/tariffs', require('./routes/tariffRoutes'))
app.use('/api/notifications', require('./routes/notificationRoutes'))
app.use('/api/dashboard', require('./routes/dashboardRoutes'))

// ----------------------
// HEALTH CHECK
// ----------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// ----------------------
// ERROR HANDLER
// ----------------------
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// ----------------------
// 404 HANDLER
// ----------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ----------------------
// DATABASE
// ----------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err))

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
