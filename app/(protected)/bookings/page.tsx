'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import jsPDF from 'jspdf'
import { Plus, CheckCircle, XCircle, UserPlus } from 'lucide-react'


interface Customer {
  _id: string
  name: string
  phone: string
}

interface Driver {
  _id: string
  name: string
  phone: string
  registrationNumber?: string
  status: string
}

interface Booking {
  _id: string
  bookingId: string
  customerPhone: string
  pickupLocation: { address: string }
  dropoffLocation: { address: string }
  pickupTime: string
  vehicleType: string
  status: string
  driver?: Driver
}

export default function BookingsPage() {

  const [bookings, setBookings] = useState<Booking[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<{ [key: string]: string }>({})
  const [showModal, setShowModal] = useState(false)
const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actualDistance, setActualDistance] = useState('')

  const [formData, setFormData] = useState({
    customerPhone: '',
    pickup: '',
    drop: '',
    vehicleType: 'MINI',
  })

  useEffect(() => {
    fetchBookings()
    fetchCustomers()
    fetchDrivers()
  }, [])

  // ---------------- FETCH ----------------

  const fetchBookings = async () => {
    const res = await fetch('http://localhost:5000/api/bookings')
    const data = await res.json()
    setBookings(data.bookings || [])
  }

  const fetchCustomers = async () => {
    const res = await fetch('http://localhost:5000/api/customers')
    const data = await res.json()
    setCustomers(data.customers || [])
  }

  const fetchDrivers = async () => {
    const res = await fetch('http://localhost:5000/api/drivers')
    const data = await res.json()
    setDrivers(data.drivers || [])
  }

  // ---------------- CREATE BOOKING ----------------

  const handleCreateBooking = async () => {
    if (!formData.customerPhone || !formData.pickup || !formData.drop) {
      alert('Please provide all required fields')
      return
    }

    const payload = {
      customerPhone: formData.customerPhone,
      bookingType: 'LOCAL',
      vehicleType: formData.vehicleType,
      pickupLocation: {
        address: formData.pickup,
        latitude: 0,
        longitude: 0,
      },
      dropoffLocation: {
        address: formData.drop,
        latitude: 0,
        longitude: 0,
      },
      pickupTime: new Date().toISOString(),
      distanceKm: 10,
      acRequired: true,
    }

    const res = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    alert('Booking created successfully 🎉')

    setShowModal(false)
    setFormData({
      customerPhone: '',
      pickup: '',
      drop: '',
      vehicleType: 'MINI',
    })

    fetchBookings()
  }

  // ---------------- PDF ----------------

  const generateInvoicePDF = (invoice: any) => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("MOBILE TRACK TAXI", 20, 20)

    doc.setFontSize(12)
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 20, 40)
    doc.text(`Booking ID: ${invoice.bookingId}`, 20, 50)
    doc.text(`Distance: ${invoice.distance} KM`, 20, 60)

    doc.text(`Base Fare: ₹${invoice.fare.baseFare || 0}`, 20, 80)
    doc.text(`Distance Charge: ₹${invoice.fare.distanceCharge || 0}`, 20, 90)
    doc.text(`Waiting: ₹${invoice.fare.waitingCharge || 0}`, 20, 100)
    doc.text(`Driver Batta: ₹${invoice.fare.driverBatta || 0}`, 20, 110)

    doc.setFontSize(14)
    doc.text(`Total: ₹${invoice.fare.totalFare}`, 20, 130)

    doc.save(`${invoice.invoiceNumber}.pdf`)
  }

  // ---------------- ASSIGN DRIVER ----------------

  const assignDriver = async (bookingId: string, driverId: string) => {
    const res = await fetch('http://localhost:5000/api/bookings/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, driverId }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    fetchBookings()
  }

  // ---------------- COMPLETE TRIP ----------------

  const handleCompleteTrip = async () => {
    if (!selectedBooking) return

    const res = await fetch(
      `http://localhost:5000/api/bookings/${selectedBooking._id}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualDistance: Number(actualDistance),
          durationMinutes: 0
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

setGeneratedInvoice(data.invoice);
generateInvoicePDF(data.invoice);

    setShowCompleteModal(false)
    setActualDistance('')
    fetchBookings()
  }

  // ---------------- WHATSAPP ----------------

  const openDriverWhatsApp = (booking: Booking) => {
    if (!booking.driver) return
    const number = booking.driver.phone.replace(/\D/g, '')
    const formatted = number.startsWith('91') ? number : `91${number}`

    const message = `
🚖 New Trip Assigned

Pickup: ${booking.pickupLocation.address}
Drop: ${booking.dropoffLocation.address}
Customer: ${booking.customerPhone}
`

    window.location.href = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
  }

  const openCustomerWhatsApp = (booking: Booking) => {
    if (!booking.driver) return
    const number = booking.customerPhone.replace(/\D/g, '')
    const formatted = number.startsWith('91') ? number : `91${number}`

    const message = `
✅ Driver Assigned

Driver: ${booking.driver.name}
Phone: ${booking.driver.phone}
Vehicle: ${booking.driver.registrationNumber || ''}
`

    window.location.href = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
  }

  const shareInvoiceWhatsApp = () => {
  if (!generatedInvoice || !selectedBooking) return;

  const number = selectedBooking.customerPhone.replace(/\D/g, '');
  const formatted = number.startsWith('91') ? number : `91${number}`;

  const message = `
🧾 MOBILE TRACK TAXI

Invoice No: ${generatedInvoice.invoiceNumber}
Booking ID: ${generatedInvoice.bookingId}
Distance: ${generatedInvoice.distance} KM

Base Fare: ₹${generatedInvoice.fare.baseFare || 0}
Distance Charge: ₹${generatedInvoice.fare.distanceCharge || 0}
Waiting: ₹${generatedInvoice.fare.waitingCharge || 0}
Driver Batta: ₹${generatedInvoice.fare.driverBatta || 0}

Total: ₹${generatedInvoice.fare.totalFare}

Thank you for choosing Mobile Track 🚖
`;

  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};

const cancelTrip = async (bookingId: string) => {
  const confirmCancel = confirm("Are you sure you want to cancel this trip?");
  if (!confirmCancel) return;

  const res = await fetch(
    `http://localhost:5000/api/bookings/${bookingId}/cancel`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: "Cancelled by admin" }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Trip cancelled successfully");
  fetchBookings();
};

  // ---------------- UI ----------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Booking Management
          </h1>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">From</th>
                <th className="p-4">To</th>
                <th className="p-4">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-t border-slate-800">
                  <td className="p-4">{booking.customerPhone}</td>
                  <td className="p-4">{booking.pickupLocation.address}</td>
                  <td className="p-4">{booking.dropoffLocation.address}</td>
                  <td className="p-4">
                    {new Date(booking.pickupTime).toLocaleString()}
                  </td>
                  <td className="p-4">
  <div
    className={`w-2.5 h-2.5 rounded-full shadow-md ${
      booking.status === "PENDING"
        ? "bg-yellow-400 animate-pulse shadow-yellow-400/50"
        : booking.status === "ASSIGNED"
        ? "bg-blue-400 shadow-blue-400/50"
        : booking.status === "COMPLETED"
        ? "bg-green-400 shadow-green-400/50"
        : booking.status === "CANCELLED"
        ? "bg-red-400 shadow-red-400/50"
        : "bg-gray-400"
    }`}
  />
</td>


                  <td className="p-4">
  <div className="flex flex-col gap-3">

    {booking.status === "PENDING" && (
      <div className="flex gap-3 items-center">
        <select
          className="bg-slate-800 text-white p-2 rounded"
          value={selectedDriver[booking._id] || ""}
          onChange={(e) =>
            setSelectedDriver({
              ...selectedDriver,
              [booking._id]: e.target.value,
            })
          }
        >
          <option value="">Driver</option>
          {drivers
            .filter((d) => d.status === "ACTIVE")
            .map((driver) => (
              <option key={driver._id} value={driver._id}>
                {driver.name}
              </option>
            ))}
        </select>

        <Button
          onClick={() => {
            const driverId = selectedDriver[booking._id]
            if (!driverId) {
              alert("Please select a driver first")
              return
            }
            assignDriver(booking._id, driverId)
          }}
          className="bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50"
        >
          Assign
        </Button>
      </div>
    )}

    {booking.status === "ASSIGNED" && booking.driver && (
      <>
        <div className="flex gap-3">
          <Button
            onClick={() => openDriverWhatsApp(booking)}
            className="bg-transparent text-green-600 border border-green-600 hover:bg-green-50"
          >
            WhatsApp Driver
          </Button>

          <Button
            onClick={() => openCustomerWhatsApp(booking)}
            className="bg-transparent text-emerald-600 border border-emerald-600 hover:bg-emerald-50"
          >
            WhatsApp Customer
          </Button>
        </div>

        <Button
          onClick={() => {
            setSelectedBooking(booking)
            setShowCompleteModal(true)
          }}
          className="bg-transparent text-purple-600 border border-purple-600 hover:bg-purple-50"
        >
          Complete Trip
        </Button>
      </>
    )}

    {(booking.status === "PENDING" || booking.status === "ASSIGNED") && (
      <Button
        onClick={() => cancelTrip(booking._id)}
        className="bg-transparent text-red-600 border border-red-600 hover:bg-red-50"
      >
        Cancel Trip
      </Button>
    )}

  </div>
</td>


                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COMPLETE MODAL — MOVED OUTSIDE TABLE */}
       {showCompleteModal && selectedBooking && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="bg-slate-900 border-slate-800 p-6 w-96 space-y-4">
      <h3 className="text-xl font-bold text-white">
        Complete Trip
      </h3>

      <p className="text-slate-300">
        Booking ID: {selectedBooking.bookingId}
      </p>

      <input
        type="number"
        placeholder="Enter Distance (KM)"
        value={actualDistance}
        onChange={(e) => setActualDistance(e.target.value)}
        className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700"
      />

      <div className="flex flex-col gap-3">

        <Button
          onClick={handleCompleteTrip}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Complete & Print
        </Button>

        {generatedInvoice && (
          <Button
            onClick={shareInvoiceWhatsApp}
            className="bg-green-600 hover:bg-green-700"
          >
            Send Invoice via WhatsApp
          </Button>
        )}

        <Button
          onClick={() => setShowCompleteModal(false)}
          variant="ghost"
        >
          Cancel
        </Button>

      </div>
    </Card>
  </div>
)}

        {/* CREATE BOOKING MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-900 border-slate-800 p-6 w-96 space-y-4">
              <h3 className="text-xl font-bold text-white">
                Create Booking
              </h3>

              <select
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerPhone: e.target.value,
                  })
                }
                className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c.phone}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Pickup Location"
                value={formData.pickup}
                onChange={(e) =>
                  setFormData({ ...formData, pickup: e.target.value })
                }
                className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700"
              />

              <input
                placeholder="Drop Location"
                value={formData.drop}
                onChange={(e) =>
                  setFormData({ ...formData, drop: e.target.value })
                }
                className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700"
              />

              <select
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleType: e.target.value,
                  })
                }
                className="w-full bg-slate-800 text-white p-2 rounded border border-slate-700"
              >
                <option value="MINI">Mini</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV_MUV">SUV/MUV</option>
              </select>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateBooking}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Create
                </Button>

                <Button
                  onClick={() => setShowModal(false)}
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

      </main>
    </div>
  )
}
