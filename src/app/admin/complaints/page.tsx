'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Eye, XCircle, CheckCircle, MessageSquareWarning } from 'lucide-react'

interface Complaint {
  id: string
  reason: string
  description: string
  status: string
  resolution?: string
  createdAt: string
  updatedAt: string
  complainant: { id: string; firstName: string; lastName: string; email: string }
  against: { id: string; firstName: string; lastName: string; email: string }
  order?: { id: string; orderNumber: string }
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [resolutionText, setResolutionText] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'ALL') params.set('status', filterStatus)
      if (filterType !== 'ALL') params.set('type', filterType)
      if (searchQuery) params.set('q', searchQuery)
      const res = await fetch(`/api/admin/complaints?${params}`)
      if (res.ok) {
        const data = await res.json()
        setComplaints(data)
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [filterStatus, filterType])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handleStatusUpdate = async (complaintId: string, status: string, resolution?: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution }),
      })
      if (res.ok) {
        toast.success(`Complaint ${status.toLowerCase()} successfully`)
        fetchComplaints()
        setSelectedComplaint(null)
        setResolutionText('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update complaint')
      }
    } catch (error) {
      toast.error('Failed to update complaint')
    } finally {
      setUpdating(false)
    }
  }

  const openComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setResolutionText(complaint.resolution || '')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Complaints & Disputes</h1>
          <p className="text-slate-600 mt-1">Manage and resolve user complaints</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PRODUCT">Product</SelectItem>
                <SelectItem value="DELIVERY">Delivery</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading complaints...</div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <MessageSquareWarning className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600">No complaints found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-md flex items-center justify-center shrink-0">
                      <MessageSquareWarning className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{complaint.reason}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{complaint.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          From: {complaint.complainant.firstName} {complaint.complainant.lastName}
                        </span>
                        <span className="text-xs text-slate-400">&rarr;</span>
                        <span className="text-xs text-slate-500">
                          Against: {complaint.against.firstName} {complaint.against.lastName}
                        </span>
                        {complaint.order && (
                          <>
                            <span className="text-xs text-slate-400">&bull;</span>
                            <span className="text-xs text-slate-500">Order: #{complaint.order.orderNumber}</span>
                          </>
                        )}
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => openComplaint(complaint)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedComplaint} onOpenChange={(open) => { if (!open) { setSelectedComplaint(null); setResolutionText('') } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              View and resolve complaint
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Reason:</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <p className="text-sm text-slate-800">{selectedComplaint.reason}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Description:</span>
                <p className="text-sm text-slate-800">{selectedComplaint.description}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Complainant:</span>
                <p className="text-sm text-slate-800">
                  {selectedComplaint.complainant.firstName} {selectedComplaint.complainant.lastName} ({selectedComplaint.complainant.email})
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Against:</span>
                <p className="text-sm text-slate-800">
                  {selectedComplaint.against.firstName} {selectedComplaint.against.lastName} ({selectedComplaint.against.email})
                </p>
              </div>
              {selectedComplaint.order && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">Related Order:</span>
                  <p className="text-sm text-slate-800">#{selectedComplaint.order.orderNumber}</p>
                </div>
              )}
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-600">Filed On:</span>
                <p className="text-sm text-slate-800">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
              </div>
              {selectedComplaint.resolution && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">Resolution:</span>
                  <p className="text-sm text-slate-800">{selectedComplaint.resolution}</p>
                </div>
              )}
              {selectedComplaint.status === 'OPEN' && (
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution Note</Label>
                  <textarea
                    id="resolution"
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Enter resolution details..."
                    className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  />
                </div>
              )}
              <DialogFooter className="flex gap-2">
                {selectedComplaint.status === 'OPEN' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate(selectedComplaint.id, 'RESOLVED', resolutionText)}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedComplaint.id, 'CLOSED')}
                      disabled={updating}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </>
                )}
                {selectedComplaint.status === 'RESOLVED' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'CLOSED')}
                    disabled={updating}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
