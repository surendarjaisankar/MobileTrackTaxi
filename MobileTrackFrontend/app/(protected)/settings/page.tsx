'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Save, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TariffSettings {
  vehicleType: 'mini' | 'sedan' | 'suv'
  basefare: number
  perKmRate: number
  waitingChargePerMin: number
  acChargesPerKm: number
  nonAcChargesPerKm: number
}

interface CompanySettings {
  companyName: string
  companyPhone: string
  companyEmail: string
  companyAddress: string
  commissionPercentage: number
}

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'Mobile Track Taxi Services',
    companyPhone: '080-12345678',
    companyEmail: 'info@mobiletrack.com',
    companyAddress: '10/3i, Arunagirinathar Street, Kuttalam-609 801',
    commissionPercentage: 10,
  })

  const [tariffs, setTariffs] = useState<TariffSettings[]>([
    {
      vehicleType: 'mini',
      basefare: 200,
      perKmRate: 25,
      waitingChargePerMin: 4,
      acChargesPerKm: 25,
      nonAcChargesPerKm: 25,
    },
    {
      vehicleType: 'sedan',
      basefare: 200,
      perKmRate: 25,
      waitingChargePerMin: 4,
      acChargesPerKm: 25,
      nonAcChargesPerKm: 25,
    },
    {
      vehicleType: 'suv',
      basefare: 300,
      perKmRate: 30,
      waitingChargePerMin: 6,
      acChargesPerKm: 30,
      nonAcChargesPerKm: 30,
    },
  ])

  const [editingTariff, setEditingTariff] = useState<TariffSettings | null>(null)

  const handleCompanySave = () => {
    toast.success('Company settings updated successfully!')
  }

  const handleTariffUpdate = (vehicleType: string, field: string, value: string | number) => {
    setTariffs(
      tariffs.map((t) =>
        t.vehicleType === vehicleType
          ? { ...t, [field]: typeof value === 'string' ? parseFloat(value) : value }
          : t
      )
    )
  }

  const handleTariffSave = () => {
    toast.success('Tariff settings updated successfully!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
     

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Manage company information and pricing</p>
        </div>

        {/* Company Settings */}
        <Card className="bg-slate-900 border-slate-800 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
              <Input
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Phone</label>
              <Input
                value={companySettings.companyPhone}
                onChange={(e) => setCompanySettings({ ...companySettings, companyPhone: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Email</label>
              <Input
                type="email"
                value={companySettings.companyEmail}
                onChange={(e) => setCompanySettings({ ...companySettings, companyEmail: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Commission Percentage (%)</label>
              <Input
                type="number"
                value={companySettings.commissionPercentage}
                onChange={(e) => setCompanySettings({ ...companySettings, commissionPercentage: parseFloat(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Company Address</label>
            <Input
              value={companySettings.companyAddress}
              onChange={(e) => setCompanySettings({ ...companySettings, companyAddress: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <Button onClick={handleCompanySave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Company Settings
          </Button>
        </Card>

        {/* Tariff Settings */}
        <Card className="bg-slate-900 border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Local Tariff Settings</h2>
          <p className="text-slate-400 text-sm mb-6">Configure pricing for each vehicle type (3km base fare + per km rates)</p>

          <div className="space-y-8">
            {tariffs.map((tariff) => (
              <div key={tariff.vehicleType} className="border border-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 capitalize">{tariff.vehicleType}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Base Fare (3km)</label>
                    <Input
                      type="number"
                      value={tariff.basefare}
                      onChange={(e) => handleTariffUpdate(tariff.vehicleType, 'basefare', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Per KM Rate (Non AC)</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={tariff.nonAcChargesPerKm}
                      onChange={(e) => handleTariffUpdate(tariff.vehicleType, 'nonAcChargesPerKm', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Per KM Rate (AC)</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={tariff.acChargesPerKm}
                      onChange={(e) => handleTariffUpdate(tariff.vehicleType, 'acChargesPerKm', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Waiting Charge (per min)</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={tariff.waitingChargePerMin}
                      onChange={(e) => handleTariffUpdate(tariff.vehicleType, 'waitingChargePerMin', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleTariffSave} className="bg-blue-600 hover:bg-blue-700 mt-8">
            <Save className="w-4 h-4 mr-2" />
            Save Tariff Settings
          </Button>
        </Card>

        {/* Information Alert */}
        <Card className="bg-amber-900/20 border-amber-700 p-6 mt-8">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-100 mb-1">Pricing Information</h3>
              <p className="text-sm text-amber-200">
                These are local tariff rates. Additional charges like outstation tariffs, day rent, and package rates can be managed through the admin panel. All changes take effect immediately.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
