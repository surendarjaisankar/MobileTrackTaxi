'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Edit2, Plus, Search, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'

interface Customer {
  _id: string
  name: string
  phone: string
  address: string
  totalBookings?: number
  totalSpent?: number
  createdAt?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Customer>>({})

  // ✅ Fetch customers
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/customers')
      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setCustomers(data.customers || data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customers')
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer._id)
      setFormData(customer)
    } else {
      setEditingId(null)
      setFormData({})
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await fetch(
        editingId
          ? `http://localhost:5000/api/customers/${editingId}`
          : 'http://localhost:5000/api/customers',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success(editingId ? 'Customer updated successfully' : 'Customer added successfully')

      await fetchCustomers()
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success('Customer deleted successfully')
      await fetchCustomers()
    } catch (error: any) {
      toast.error(error.message || 'Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Customer Management</h1>
            <p className="text-slate-400">Manage all customers and their bookings</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingId ? 'Edit Customer' : 'Add New Customer'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Customer name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Input
                  placeholder="Phone number"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Input
                  placeholder="Customer address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingId ? 'Update' : 'Add'}
                  </Button>
                  <Button
onClick={() => setIsOpen(false)}
  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
>
  Cancel
</Button>

                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-800 text-white"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-slate-300">Name</th>
                  <th className="px-6 py-4 text-left text-slate-300">Phone</th>
                  <th className="px-6 py-4 text-left text-slate-300">Address</th>
                  <th className="px-6 py-4 text-left text-slate-300">Bookings</th>
                  <th className="px-6 py-4 text-left text-slate-300">Total Spent</th>
                  <th className="px-6 py-4 text-left text-slate-300">Join Date</th>
                  <th className="px-6 py-4 text-left text-slate-300">Actions</th>
                </tr>
              </thead>

             <tbody>
  {filteredCustomers.map((customer) => (
    <tr
      key={customer._id}
      className="border-b border-slate-800 hover:bg-slate-800/50 transition"
    >
      {/* Name */}
      <td className="px-6 py-4 text-white font-medium">
        {customer.name}
      </td>

      {/* Phone */}
      <td className="px-6 py-4 text-slate-400">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          {customer.phone}
        </div>
      </td>

      {/* Address */}
      <td className="px-6 py-4 text-slate-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {customer.address}
        </div>
      </td>

      {/* Bookings */}
      <td className="px-6 py-4 text-slate-400">
        {customer.totalBookings ?? 0}
      </td>

      {/* Total Spent */}
      <td className="px-6 py-4 text-green-400 font-medium">
        ₹{(customer.totalSpent ?? 0).toLocaleString()}
      </td>

      {/* Join Date = CreatedAt */}
      <td className="px-6 py-4 text-slate-400">
        {customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString()
          : "-"}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDialog(customer)}
            className="border-slate-700 hover:bg-slate-800"
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(customer._id)}
            className="border-red-700 hover:bg-red-900/20 text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
