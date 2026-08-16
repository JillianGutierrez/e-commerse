'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { MessageSquare, Send, Search, Sparkles } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  orderId?: string
  createdAt: string
}

interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function SellerMessagesPage() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId)
    }
  }, [selectedUserId])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages?conversations=true')
      if (res.ok) {
        const data = await res.json()
        const filtered = searchQuery
          ? data.filter((c: Conversation) => c.userName.toLowerCase().includes(searchQuery.toLowerCase()))
          : data
        setConversations(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUserId,
          content: newMessage.trim(),
        }),
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages(selectedUserId)
        fetchConversations()
        toast.success('Message sent!')
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Messages</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="text-neutral-600 mt-2">Chat with buyers and support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1 border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  fetchConversations()
                }}
                className="pl-10 rounded-xl border-neutral-200 h-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                No conversations yet
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`w-full p-4 text-left hover:bg-neutral-50 transition-colors ${
                      selectedUserId === conv.userId ? 'bg-neutral-100' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{conv.userName}</p>
                        <p className="text-xs text-neutral-500 truncate">{conv.lastMessage}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs text-neutral-400">{formatTime(conv.lastMessageTime)}</p>
                        {conv.unreadCount > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-black text-white text-xs font-medium">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle>
              {selectedUserId
                ? conversations.find((c) => c.userId === selectedUserId)?.userName || 'Chat'
                : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[500px]">
            {!selectedUserId ? (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                Select a conversation to start chatting
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-neutral-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = currentUserId === msg.senderId
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-xl px-4 py-2 ${
                              isOwn
                                ? 'bg-black text-white'
                                : 'bg-neutral-100 text-neutral-900'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-neutral-300' : 'text-neutral-500'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="rounded-xl border-neutral-200 h-12"
                  />
                  <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="rounded-full bg-black text-white hover:bg-neutral-800">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
