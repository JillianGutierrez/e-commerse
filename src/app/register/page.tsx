'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload, User, Store, Truck } from 'lucide-react'

interface Province {
  name: string
  municipalities: string[]
}

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState('BUYER')
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [barangays, setBarangays] = useState<string[]>([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    sex: '',
    email: '',
    password: '',
    contactNo: '',
    birthday: '',
    age: '',
    address: '',
    province: '',
    municipality: '',
    barangay: '',
    street: '',
    houseNumber: '',
    idImage: '',
    businessName: '',
    lineOfBusiness: '',
    businessPermit: '',
    vehicleType: '',
    plateNumber: '',
    orCrImage: '',
    licenseImage: '',
  })

  useEffect(() => {
    fetch('/api/address?type=provinces')
      .then(res => res.json())
      .then(data => {
        if (data.provinces) {
          setProvinces(data.provinces.map((name: string) => ({ name, municipalities: [] })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (formData.province) {
      fetch(`/api/address?type=municipalities&province=${encodeURIComponent(formData.province)}`)
        .then(res => res.json())
        .then(data => {
          if (data.municipalities) {
            setMunicipalities(data.municipalities)
            setBarangays([])
            setFormData(prev => ({ ...prev, municipality: '', barangay: '' }))
          }
        })
        .catch(() => {})
    }
  }, [formData.province])

  useEffect(() => {
    if (formData.province && formData.municipality) {
      fetch(`/api/address?type=barangays&province=${encodeURIComponent(formData.province)}&municipality=${encodeURIComponent(formData.municipality)}`)
        .then(res => res.json())
        .then(data => {
          if (data.barangays) {
            setBarangays(data.barangays)
            setFormData(prev => ({ ...prev, barangay: '' }))
          }
        })
        .catch(() => {})
    }
  }, [formData.province, formData.municipality])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Registration successful! Please wait for admin approval.')
        router.push('/register/success')
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'birthday') {
        updated.age = calculateAge(value).toString()
      }
      return updated
    })
  }

  const calculateAge = (birthday: string): number => {
    if (!birthday) return 0
    const birth = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateField(field, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Fill in your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">I want to *</Label>
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYER">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Buy products
                  </div>
                </SelectItem>
                <SelectItem value="SELLER">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Sell products
                  </div>
                </SelectItem>
                <SelectItem value="COURIER">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Deliver packages
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="middleInitial">Middle Initial</Label>
            <Input
              id="middleInitial"
              value={formData.middleInitial}
              onChange={(e) => updateField('middleInitial', e.target.value)}
              maxLength={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sex *</Label>
            <Select value={formData.sex} onValueChange={(value) => updateField('sex', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNo">Contact Number *</Label>
            <Input
              id="contactNo"
              value={formData.contactNo}
              onChange={(e) => updateField('contactNo', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday *</Label>
            <div className="flex gap-2">
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => updateField('birthday', e.target.value)}
                required
                className="flex-1"
              />
              {formData.age && (
                <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  Age: {formData.age}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address *</Label>
            <div className="space-y-2">
              <Select value={formData.province} onValueChange={(value) => updateField('province', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.name} value={province.name}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {municipalities.length > 0 && (
                <Select value={formData.municipality} onValueChange={(value) => updateField('municipality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((muni) => (
                      <SelectItem key={muni} value={muni}>
                        {muni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {barangays.length > 0 && (
                <Select value={formData.barangay} onValueChange={(value) => updateField('barangay', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                  <SelectContent>
                    {barangays.map((brgy) => (
                      <SelectItem key={brgy} value={brgy}>
                        {brgy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Input
                placeholder="Street / House Number"
                value={formData.street}
                onChange={(e) => updateField('street', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idImage">Upload ID *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="idImage"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('idImage', e)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('idImage')?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {formData.idImage ? 'ID Uploaded' : 'Upload ID'}
              </Button>
            </div>
          </div>

          {role === 'SELLER' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineOfBusiness">Line of Business (Category) *</Label>
                <Input
                  id="lineOfBusiness"
                  value={formData.lineOfBusiness}
                  onChange={(e) => updateField('lineOfBusiness', e.target.value)}
                  placeholder="e.g., Electronics, Clothing"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPermit">Upload Business Permit *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="businessPermit"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('businessPermit', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('businessPermit')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {formData.businessPermit ? 'Business Permit Uploaded' : 'Upload Business Permit'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {role === 'COURIER' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Choose Vehicle *</Label>
                <Input
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => updateField('vehicleType', e.target.value)}
                  placeholder="e.g., Motorcycle, Van, Truck"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plateNumber">Enter Plate Number *</Label>
                <Input
                  id="plateNumber"
                  value={formData.plateNumber}
                  onChange={(e) => updateField('plateNumber', e.target.value)}
                  placeholder="e.g., ABC 1234"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orCrImage">Upload OR/CR *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="orCrImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('orCrImage', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('orCrImage')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {formData.orCrImage ? 'OR/CR Uploaded' : 'Upload OR/CR'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseImage">Upload ID/Driver&apos;s License *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="licenseImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('licenseImage', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('licenseImage')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {formData.licenseImage ? 'License Uploaded' : 'Upload License'}
                  </Button>
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
