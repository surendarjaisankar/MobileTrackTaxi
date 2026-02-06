'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Trash2, Edit2, Plus, Phone } from 'lucide-react'
import { toast } from 'sonner'

interface Driver {
  _id: string
  name: string
  phone: string
  licenseNumber: string
  vehicleType: 'MINI' | 'SEDAN' | 'SUV_MUV'
  registrationNumber: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_TRIP' | 'ON_BREAK'
  rating: number
  totalTrips: number
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const emptyForm: Partial<Driver> = {
    name: '',
    phone: '',
    licenseNumber: '',
    registrationNumber: '',
    status: 'ACTIVE',
    rating: 5,
    totalTrips: 0,
    vehicleType: 'SEDAN'
  }

  const [formData, setFormData] = useState<Partial<Driver>>(emptyForm)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/drivers')
      const data = await res.json()
      setDrivers(data.drivers || data)
    } catch {
      toast.error('Failed to load drivers')
    }
  }

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search) ||
    d.licenseNumber.includes(search)
  )

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingId(driver._id)
      setFormData({ ...driver })
    } else {
      setEditingId(null)
      setFormData(emptyForm)
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (
      !formData.name?.trim() ||
      !formData.phone?.trim() ||
      !formData.licenseNumber?.trim() ||
      !formData.registrationNumber?.trim()
    ) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await fetch(
        editingId
          ? `http://localhost:5000/api/drivers/${editingId}`
          : 'http://localhost:5000/api/drivers',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Operation failed')
      }

      toast.success(
        editingId ? 'Driver updated successfully' : 'Driver created successfully'
      )

      await fetchDrivers()
      setIsOpen(false)
      setFormData(emptyForm)
      setEditingId(null)

    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return

    try {
      const res = await fetch(`http://localhost:5000/api/drivers/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error()

      toast.success('Driver deleted successfully')
      await fetchDrivers()
    } catch {
      toast.error('Delete failed')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400'
      case 'ON_TRIP':
        return 'bg-blue-500/20 text-blue-400'
      case 'ON_BREAK':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'INACTIVE':
      default:
        return 'bg-slate-700/20 text-slate-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Driver Management
            </h1>
            <p className="text-slate-400">Manage all taxi drivers</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingId ? 'Edit Driver' : 'Add Driver'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">

<Input
  placeholder="Driver Name"
  value={formData.name || ''}
  onChange={(e) =>
    setFormData({ ...formData, name: e.target.value })
  }
  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600"
/>

<Input
  placeholder="Phone"
  value={formData.phone || ''}
  onChange={(e) =>
    setFormData({ ...formData, phone: e.target.value })
  }
  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600"
/>

<Input
  placeholder="License Number"
  value={formData.licenseNumber || ''}
  onChange={(e) =>
    setFormData({ ...formData, licenseNumber: e.target.value })
  }
  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600"
/>

<Input
  placeholder="Registration Number"
  value={formData.registrationNumber || ''}
  onChange={(e) =>
    setFormData({
      ...formData,
      registrationNumber: e.target.value
    })
  }
  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600"
/>


                {/* Vehicle Type */}
                <select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleType: e.target.value as Driver['vehicleType']
                    })
                  }
                  className="w-full p-2 bg-slate-800 text-white rounded border border-slate-700"
                >
                  <option value="MINI">Mini</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV_MUV">SUV/MUV</option>
                </select>

                {/* Status */}
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Driver['status']
                    })
                  }
                  className="w-full p-2 bg-slate-800 text-white rounded border border-slate-700"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_TRIP">ON_TRIP</option>
                  <option value="ON_BREAK">ON_BREAK</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>

                <Button
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {editingId ? 'Update Driver' : 'Create Driver'}
                </Button>

              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-slate-300">
          <th className="px-6 py-4 text-left">Name</th>
          <th className="px-6 py-4 text-left">Phone</th>
          <th className="px-6 py-4 text-left">License</th>
          <th className="px-6 py-4 text-left">Vehicle Type</th>
          <th className="px-6 py-4 text-left">Registration</th>
          <th className="px-6 py-4 text-left">Rating</th>
          <th className="px-6 py-4 text-left">Total Trips</th>
          <th className="px-6 py-4 text-left">Status</th>
          <th className="px-6 py-4 text-left">Actions</th>
        </tr>
      </thead>

      <tbody>
        {filteredDrivers.map((driver) => (
          <tr key={driver._id} className="border-b border-slate-800">

            <td className="px-6 py-4 text-white font-medium">
              {driver.name}
            </td>

            <td className="px-6 py-4 text-slate-400">
              {driver.phone}
            </td>

            <td className="px-6 py-4 text-slate-400">
              {driver.licenseNumber}
            </td>

            <td className="px-6 py-4 text-slate-400">
              {driver.vehicleType}
            </td>

            <td className="px-6 py-4 text-slate-400">
              {driver.registrationNumber}
            </td>

            <td className="px-6 py-4 text-slate-400">
              ⭐ {driver.rating?.toFixed(1)}
            </td>

            <td className="px-6 py-4 text-slate-400">
              {driver.totalTrips}
            </td>

            <td className="px-6 py-4">
              <span
                className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                  driver.status
                )}`}
              >
                {driver.status}
              </span>
            </td>

            <td className="px-6 py-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenDialog(driver)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(driver._id)}
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
</Card>

      </main>
    </div>
  )
}
