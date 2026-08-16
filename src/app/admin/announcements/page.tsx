'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Megaphone, Eye } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setIsActive(true)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, isActive }),
      })
      if (res.ok) {
        toast.success(editingId ? 'Announcement updated successfully' : 'Announcement created successfully')
        resetForm()
        fetchAnnouncements()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save announcement')
      }
    } catch (error) {
      toast.error('Failed to save announcement')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setTitle(announcement.title)
    setContent(announcement.content)
    setIsActive(announcement.isActive)
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Announcement deleted successfully')
        fetchAnnouncements()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete announcement')
      }
    } catch (error) {
      toast.error('Failed to delete announcement')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      })
      if (res.ok) {
        toast.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error('Failed to update announcement')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-600 mt-1">Create and manage platform announcements</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancel' : 'New Announcement'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
            <CardDescription>{editingId ? 'Update announcement details' : 'Create a new platform announcement'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter announcement content"
                  className="w-full min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>Manage your platform announcements</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-slate-500">Loading announcements...</div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Megaphone className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                      <Megaphone className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(announcement.id, announcement.isActive)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
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
