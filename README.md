# Mobile Track - Taxi Management System

A modern **Next.js 16** admin dashboard for managing taxi operations, drivers, customers, and bookings with WhatsApp integration and dynamic tariff management.

## ✨ Features

### Admin Dashboard
- Real-time statistics (active drivers, customers, trips, revenue)
- Driver and customer overview
- Quick action buttons
- Professional dark theme with modern UI

### Driver Management
- Complete CRUD operations (Add, Edit, Delete)
- Driver status tracking (Active, Inactive, On Trip)
- License and vehicle registration management
- Search and filter functionality
- Driver rating and trip statistics

### Customer Management
- Full customer lifecycle management
- Contact information and address storage
- Booking history and total spending tracking
- Search and filter by name, phone, or address
- Edit and delete customer records

### Booking System
- Create new bookings via admin interface
- Customer call-based booking entry
- Vehicle type selection (Mini, Sedan, SUV/MUV)
- Driver assignment for trips
- Booking status tracking (Pending, Assigned, In Progress, Completed)
- Distance and fare tracking

### WhatsApp Integration
- One-click WhatsApp Web integration
- Pre-filled booking confirmation messages
- Customer phone number validation
- Send directly from booking card
- No API keys required initially

### Tariff Management
- Three vehicle types with independent pricing:
  - **Mini**: 4+1 seater
  - **Sedan**: 4+1 seater
  - **SUV/MUV**: 7+1 / 9+1 seater
- Local tariff: Base fare + per-KM charges
- AC/Non-AC rate differentiation
- Waiting charge configuration per minute
- Real-time tariff updates

### Settings & Configuration
- Company information management
- Commission percentage settings
- Tariff rate configuration for all vehicle types
- Base fare and per-KM pricing

## 📂 Project Structure

```
app/
├── page.tsx                 # Dashboard home page
├── drivers/
│   └── page.tsx            # Driver management
├── customers/
│   └── page.tsx            # Customer management
├── bookings/
│   └── page.tsx            # Booking management
├── settings/
│   └── page.tsx            # Settings & tariff config
├── layout.tsx              # Root layout
└── globals.css             # Global styles

components/
└── ui/                      # shadcn/ui components

public/                      # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2 with server/client components
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner
- **State**: React Hooks (useState, useEffect)

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```

### Project Pages

| Page | URL | Features |
|------|-----|----------|
| Dashboard | `/` | Overview, stats, quick actions |
| Drivers | `/drivers` | Add, edit, delete drivers, CRUD |
| Customers | `/customers` | Customer management, history |
| Bookings | `/bookings` | Create bookings, WhatsApp send |
| Settings | `/settings` | Tariff config, company info |

## 📋 Tariff Structure

### Local Tariff (3km Base + Per KM)
- Base fare for first 3km
- Additional per-KM charges (AC & Non-AC)
- Waiting charges per minute
- Applied automatically to bookings

### Day Rent (200km, 12 hours)
- Fixed rate for duration and distance
- Extra KM charges beyond 200km

### Outstation (400km+)
- Long-distance per-KM rates
- Driver batta charges
- Day and night halt charges

### Package Tariff (2-13 hours)
- Fixed hourly rates with KM limits
- Limited waiting hours
- Extra waiting charges

## 📱 How to Use

### Create a Booking
1. Navigate to **Bookings** page
2. Click **"New Booking"**
3. Fill customer name, phone, locations
4. Select vehicle type and distance
5. Submit to create booking
6. Click **WhatsApp** to send to customer
7. Update driver assignment when ready

### Manage Drivers
1. Go to **Drivers** page
2. **Add Driver**: Click green button, fill details
3. **Edit Driver**: Click edit icon, modify info
4. **Delete Driver**: Click trash icon, confirm
5. **Search/Filter**: Use search bar to find driver

### Manage Customers
1. Navigate to **Customers** page
2. **Add Customer**: Fill name, phone, address
3. **Track Spending**: View total spent per customer
4. **View History**: See customer bookings
5. **Edit/Delete**: Manage customer records

### Configure Tariffs
1. Open **Settings** page
2. Update company information
3. Set tariff rates for each vehicle type:
   - Base fare
   - Per-KM rates (AC & Non-AC)
   - Waiting charges
4. Click **Save Tariff Settings**
5. Changes apply immediately

## 🔗 WhatsApp Integration

The app uses **WhatsApp Web** with `window.open()`:

1. Fill in customer **phone number** (format: 91xxxxxxxxxx)
2. Click **WhatsApp** button on booking
3. Pre-filled message window opens
4. Message includes: pickup, dropoff, vehicle, time
5. Admin reviews and sends

**Message Format:**
```
Hello {Name}, your taxi booking is confirmed!

Pickup: {Location}
Dropoff: {Location}
Time: {Pickup Time}
Vehicle: {Type}

Thank you for using Mobile Track!
```

## 🎨 UI Features

- **Dark Theme**: Professional slate/blue color scheme
- **Responsive**: Desktop, tablet, mobile support
- **Modern Components**: shadcn/ui + Radix UI
- **Toast Notifications**: Success/error feedback
- **Modals**: Clean dialog interfaces
- **Search/Filter**: Find data quickly
- **Status Badges**: Color-coded status indicators

## 📊 Data Structure

### Driver
```
- Name, Phone
- License Number, Vehicle Type
- Registration Number
- Status: Active/Inactive/On Trip
- Rating, Total Trips
```

### Customer
```
- Name, Phone, Address
- Total Bookings, Total Spent
- Join Date
- Booking History
```

### Booking
```
- Customer Name, Phone
- Pickup/Dropoff Locations
- Pickup Time, Vehicle Type
- Driver Assignment (optional)
- Status, Distance, Fare
- Booking Date
```

## 🔮 Future Enhancements

1. **MongoDB Integration** - Persistent database backend
2. **Authentication** - Admin login system
3. **API Routes** - Implement `/api` endpoints
4. **Trip Tracking** - Real-time GPS location
5. **Advanced Reports** - Analytics dashboard
6. **Auto-Assignment** - Smart driver matching
7. **Rating System** - Driver/customer reviews
8. **Payment Gateway** - Online transactions
9. **SMS Notifications** - SMS alongside WhatsApp
10. **Mobile Apps** - Native driver/customer apps

## 🔒 Before Production

- [ ] Connect MongoDB for data persistence
- [ ] Implement authentication & authorization
- [ ] Add input validation & sanitization
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add error logging
- [ ] Setup database backups
- [ ] Create API documentation
- [ ] Add test coverage
- [ ] Performance optimization

## 📝 Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start

# Or deploy to Vercel
# Push to GitHub and connect to Vercel
# Automatic deployments on push
```

## 🐛 Troubleshooting

**Q: Data not persisting after refresh?**
A: Currently uses in-memory state. Implement MongoDB for persistence.

**Q: WhatsApp not opening?**
A: Check popup blocker, ensure valid phone number format (91xxxxxxxxxx)

**Q: Styles looking broken?**
A: Run `npm run build` to ensure Tailwind compiles properly

**Q: Pages not found?**
A: Ensure you're in development mode with `npm run dev`

## 📄 License

This project is proprietary and confidential for Mobile Track Taxi Services.

---

**Built with Next.js 16, React 19, and Tailwind CSS**
"# MobileTrackTaxiApp" 
"# MobileTrackTaxiApp" 
"# MobileTrackTaxi" 
