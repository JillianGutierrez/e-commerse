'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Truck, LogOut } from 'lucide-react'

export default function CourierAccountPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    address: '',
  })

  const [vehicleData, setVehicleData] = useState({
    vehicleType: '',
    plateNumber: '',
  })

  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        firstName: (session.user as any).firstName || '',
        lastName: (session.user as any).lastName || '',
        email: session.user.email || '',
        contactNo: (session.user as any).contactNo || '',
        address: (session.user as any).address || '',
      })
      setVehicleData({
        vehicleType: (session.user as any).courierProfile?.vehicleType || '',
        plateNumber: (session.user as any).courierProfile?.plateNumber || '',
      })
      setIsAvailable((session.user as any).courierProfile?.isAvailable ?? true)
      setLoading(false)
    }
  }, [session])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (res.ok) {
        toast.success('Profile updated successfully!')
        update()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const updateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/courier/vehicle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      })

      if (res.ok) {
        toast.success('Vehicle info updated successfully!')
        update()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update vehicle info')
      }
    } catch (error) {
      toast.error('Failed to update vehicle info')
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailability = async () => {
    try {
      const res = await fetch('/api/courier/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      })
      if (res.ok) {
        toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for deliveries`)
        setIsAvailable(!isAvailable)
        update()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update availability')
      }
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-slate-500">Loading account...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Account Management</h1>
        <p className="text-slate-600 mt-1">Manage your profile, vehicle, and availability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input
                value={profileData.contactNo}
                onChange={(e) => setProfileData(prev => ({ ...prev, contactNo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateVehicle} className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Input
                value={vehicleData.vehicleType}
                onChange={(e) => setVehicleData(prev => ({ ...prev, vehicleType: e.target.value }))}
                placeholder="e.g., Motorcycle, Van, Truck"
              />
            </div>
            <div className="space-y-2">
              <Label>Plate Number</Label>
              <Input
                value={vehicleData.plateNumber}
                onChange={(e) => setVehicleData(prev => ({ ...prev, plateNumber: e.target.value }))}
                placeholder="e.g., ABC 1234"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Vehicle Info'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Toggle whether you are available for new deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{isAvailable ? 'Available for deliveries' : 'Unavailable'}</p>
              <p className="text-sm text-slate-500 mt-1">
                {isAvailable ? 'You will receive delivery notifications' : 'You will not receive new delivery requests'}
              </p>
            </div>
            <Button
              variant={isAvailable ? 'default' : 'outline'}
              onClick={toggleAvailability}
            >
              {isAvailable ? 'Go Unavailable' : 'Go Available'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-900">Logout</h3>
              <p className="text-sm text-red-600 mt-1">Sign out of your account</p>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
