'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Eye, CheckCircle, XCircle, Users, Clock, Filter } from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  role: string
  status: string
  firstName: string
  lastName: string
  contactNo: string
  address: string
  createdAt: string
  buyerProfile?: any
  sellerProfile?: any
  courierProfile?: any
  adminProfile?: any
}

export default function AdminApprovalsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const fetchPendingUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', 'PENDING')
      if (filterRole !== 'ALL') params.set('role', filterRole)
      if (searchQuery) params.set('q', searchQuery)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch pending users:', error)
      toast.error('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [filterRole])

  const updateUserStatus = async (userId: string, status: string) => {
    setUpdatingId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      })
      if (res.ok) {
        toast.success(`User ${status.toLowerCase()} successfully`)
        fetchPendingUsers()
        setSelectedUser(null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update user')
      }
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setUpdatingId(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      SELLER: 'bg-green-100 text-green-800',
      BUYER: 'bg-blue-100 text-blue-800',
      COURIER: 'bg-orange-100 text-orange-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      (user.name && user.name.toLowerCase().includes(query))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account Approvals</h1>
          <p className="text-slate-600 mt-1">Review and approve new user registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium text-slate-600">
            {users.length} pending
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="BUYER">Buyer</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="COURIER">Courier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading approvals...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
              <p className="text-slate-600">No pending approvals</p>
              <p className="text-sm text-slate-500 mt-1">All registrations have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name || `${user.firstName} ${user.lastName}`}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'APPROVED')}
                      disabled={updatingId === user.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateUserStatus(user.id, 'REJECTED')}
                      disabled={updatingId === user.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
