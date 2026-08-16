'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Lock, Building2, LogOut } from 'lucide-react'

export default function SellerAccountPage() {
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

  const [businessData, setBusinessData] = useState({
    businessName: '',
    lineOfBusiness: '',
    businessPermit: '',
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
      setBusinessData({
        businessName: (session.user as any).sellerProfile?.businessName || '',
        lineOfBusiness: (session.user as any).sellerProfile?.lineOfBusiness || '',
        businessPermit: (session.user as any).sellerProfile?.businessPermit || '',
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

  const updateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/seller/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData),
      })

      if (res.ok) {
        toast.success('Business info updated successfully!')
        update()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update business info')
      }
    } catch (error) {
      toast.error('Failed to update business info')
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Account Management</h1>
        <p className="text-slate-600 mt-1">Manage your profile and business settings</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('profile')}
          className="rounded-none border-b-2 border-transparent"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button
          variant={activeTab === 'business' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('business')}
          className="rounded-none border-b-2 border-transparent"
        >
          <Building2 className="mr-2 h-4 w-4" />
          Business
        </Button>
        <Button
          variant={activeTab === 'password' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('password')}
          className="rounded-none border-b-2 border-transparent"
        >
          <Lock className="mr-2 h-4 w-4" />
          Password
        </Button>
      </div>

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
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
                <Label>Full Address</Label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input
                    value={profileData.province}
                    onChange={(e) => setProfileData(prev => ({ ...prev, province: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Municipality</Label>
                  <Input
                    value={profileData.municipality}
                    onChange={(e) => setProfileData(prev => ({ ...prev, municipality: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Barangay</Label>
                  <Input
                    value={profileData.barangay}
                    onChange={(e) => setProfileData(prev => ({ ...prev, barangay: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Street / House Number</Label>
                  <Input
                    value={profileData.houseNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, houseNumber: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'business' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateBusiness} className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, businessName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Line of Business</Label>
                <Input
                  value={businessData.lineOfBusiness}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, lineOfBusiness: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Business Permit (URL or reference)</Label>
                <Input
                  value={businessData.businessPermit}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, businessPermit: e.target.value }))}
                  placeholder="Enter business permit reference or URL"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Business Info'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

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
