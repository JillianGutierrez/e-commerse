'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Lock, MapPin, LogOut, Sparkles } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    address: '',
    province: '',
    municipality: '',
    barangay: '',
    street: '',
    houseNumber: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        firstName: (session.user as any).firstName || '',
        lastName: (session.user as any).lastName || '',
        email: session.user.email || '',
        contactNo: (session.user as any).contactNo || '',
        address: (session.user as any).address || '',
        province: (session.user as any).province || '',
        municipality: (session.user as any).municipality || '',
        barangay: (session.user as any).barangay || '',
        street: (session.user as any).street || '',
        houseNumber: (session.user as any).houseNumber || '',
      })
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

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (res.ok) {
        toast.success('Password updated successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update password')
      }
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Settings</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Account Management</h1>
        <p className="text-neutral-600 mt-2">Manage your profile and preferences</p>
      </div>

      <div className="flex gap-1 border-b border-neutral-200">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'bg-black text-white rounded-none border-b-2 border-black' : 'rounded-none hover:bg-neutral-50'}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button
          variant={activeTab === 'password' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('password')}
          className={activeTab === 'password' ? 'bg-black text-white rounded-none border-b-2 border-black' : 'rounded-none hover:bg-neutral-50'}
        >
          <Lock className="mr-2 h-4 w-4" />
          Password
        </Button>
        <Button
          variant={activeTab === 'address' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('address')}
          className={activeTab === 'address' ? 'bg-black text-white rounded-none border-b-2 border-black' : 'rounded-none hover:bg-neutral-50'}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Address
        </Button>
      </div>

      {activeTab === 'profile' && (
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">First Name</Label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="rounded-xl border-neutral-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last Name</Label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="rounded-xl border-neutral-200 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Contact Number</Label>
                <Input
                  value={profileData.contactNo}
                  onChange={(e) => setProfileData(prev => ({ ...prev, contactNo: e.target.value }))}
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <Button type="submit" disabled={saving} className="rounded-full bg-black text-white hover:bg-neutral-800 h-12">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updatePassword} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Password</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">New Password</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <Button type="submit" disabled={saving} className="rounded-full bg-black text-white hover:bg-neutral-800 h-12">
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'address' && (
        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Province</Label>
                  <Input
                    value={profileData.province}
                    onChange={(e) => setProfileData(prev => ({ ...prev, province: e.target.value }))}
                    className="rounded-xl border-neutral-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Municipality</Label>
                  <Input
                    value={profileData.municipality}
                    onChange={(e) => setProfileData(prev => ({ ...prev, municipality: e.target.value }))}
                    className="rounded-xl border-neutral-200 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Barangay</Label>
                <Input
                  value={profileData.barangay}
                  onChange={(e) => setProfileData(prev => ({ ...prev, barangay: e.target.value }))}
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Street</Label>
                  <Input
                    value={profileData.street}
                    onChange={(e) => setProfileData(prev => ({ ...prev, street: e.target.value }))}
                    className="rounded-xl border-neutral-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">House Number</Label>
                  <Input
                    value={profileData.houseNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, houseNumber: e.target.value }))}
                    className="rounded-xl border-neutral-200 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Full Address</Label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <Button type="submit" disabled={saving} className="rounded-full bg-black text-white hover:bg-neutral-800 h-12">
                {saving ? 'Saving...' : 'Save Address'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border border-red-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-900">Logout</h3>
              <p className="text-sm text-red-600 mt-1">Sign out of your account</p>
            </div>
            <Button variant="destructive" onClick={handleLogout} className="rounded-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
