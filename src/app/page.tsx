'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, LayoutDashboard, Store, Map, MessageCircle, BarChart3, Settings, 
  User, LogIn, LogOut, Moon, Sun, Bell, X, Plus, Search, Send, 
  ChevronRight, Check, Loader2, Globe, Menu, Sparkles, Languages
} from 'lucide-react'
import { useTranslation, uiStrings } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

// Dynamic import for map to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Dynamic import for location picker
const LocationPickerMap = dynamic(() => import('@/components/map/LocationPickerMap'), { ssr: false })

// Types
interface User {
  id: string
  email: string
  firstName: string
  avatar?: string
}

interface Listing {
  id: string
  title: string
  category: string
  quantity: number
  price: number
  location: string
  lat?: number
  lng?: number
  description?: string
  views: number
  sellerId: string
  sellerName: string
  createdAt: string
}

interface Chat {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  lastMessage?: string
  updatedAt: string
}

interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  timestamp: string
}

interface Notification {
  id: string
  title: string
  read: boolean
  timestamp: string
}

type Page = 'landing' | 'dashboard' | 'marketplace' | 'map' | 'chat' | 'analytics' | 'settings' | 'profile' | 'login' | 'register' | 'listing'

// Category colors
const categoryColors: Record<string, string> = {
  Plastic: 'bg-green-500/20 text-green-400 border-green-500/30',
  Metal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Paper: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Electronics: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Agricultural Waste': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  'Food Surplus': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  Textiles: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Glass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

const categoryChartColors = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#84cc16', '#f43f5e', '#ec4899', '#06b6d4']

// Category icons for map display
const categoryIcons: Record<string, string> = {
  Plastic: '♻️',
  Metal: '🔩',
  Paper: '📄',
  Electronics: '🔌',
  'Agricultural Waste': '🌾',
  'Food Surplus': '🍎',
  Textiles: '👕',
  Glass: '🫙',
}

// Time ago helper
function timeAgo(timestamp: string) {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function RecyConnect() {
  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  // Translation hook
  const { t, lang, setLang, toggleLang, isTranslating, translateBatch } = useTranslation()
  
  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  
  // Navigation
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Data
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  
  // Modals
  const [addListingModalOpen, setAddListingModalOpen] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  
  // Form states
  const [listingStep, setListingStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [listingForm, setListingForm] = useState({
    title: '',
    quantity: '',
    price: '',
    location: '',
    description: '',
    lat: 25.2048,
    lng: 55.2708,
  })
  const [formError, setFormError] = useState('')
  
  // Chat
  const [chatInput, setChatInput] = useState('')
  const [botMessages, setBotMessages] = useState<{role: 'user' | 'bot', text: string}[]>([])
  const [botLoading, setBotLoading] = useState(false)
  const [chatSessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const [msgInput, setMsgInput] = useState('')
  
  // Live users simulation
  const [liveUsers, setLiveUsers] = useState(127)
  
  // Define functions first
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) setCurrentUser(data.user)
    } catch (e) {
      console.error('Auth check failed')
    }
  }
  
  const seedDatabase = async () => {
    try {
      await fetch('/api/seed')
    } catch (e) {
      console.log('Seed skipped')
    }
  }
  
  const fetchListings = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.set('category', categoryFilter)
      if (searchQuery) params.set('search', searchQuery)
      if (sortBy) params.set('sort', sortBy)
      
      const res = await fetch(`/api/listings?${params}`)
      const data = await res.json()
      setListings(data.listings || [])
    } catch (e) {
      console.error('Failed to fetch listings')
    }
  }, [categoryFilter, searchQuery, sortBy])
  
  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats')
      const data = await res.json()
      setChats(data.chats || [])
    } catch (e) {
      console.error('Failed to fetch chats')
    }
  }
  
  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/messages?chatId=${chatId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (e) {
      console.error('Failed to fetch messages')
    }
  }
  
  const fetchNotifications = async () => {
    if (!currentUser) return
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (e) {
      console.error('Failed to fetch notifications')
    }
  }
  
  // Load theme and check auth on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load initial theme from localStorage on client
    setTheme(savedTheme as 'light' | 'dark')
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    
    const savedLang = localStorage.getItem('lang') || 'en'
    if (savedLang === 'ar') {
      setLang('ar')
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    }
    
    checkAuth()
    seedDatabase()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Live users simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(100 + Math.floor(Math.random() * 50))
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  
  // Fetch data when page changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch data when navigation changes
    if (currentPage === 'marketplace' || currentPage === 'landing') fetchListings()
    if (currentPage === 'dashboard' && currentUser) fetchListings()
    if (currentPage === 'chat' && currentUser) fetchChats()
    if (currentPage === 'analytics') fetchListings()
  }, [currentPage, currentUser, fetchListings])
  
  // Fetch messages when chat changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch messages when chat is selected
    if (currentChat) fetchMessages(currentChat.id)
  }, [currentChat])
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })
      
      const data = await res.json()
      if (data.user) {
        setCurrentUser(data.user)
        setCurrentPage('dashboard')
        toast.success('Welcome back!')
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch (e) {
      toast.error('Login failed')
    }
    setAuthLoading(false)
  }
  
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.get('firstName'),
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })
      
      const data = await res.json()
      if (data.user) {
        setCurrentUser(data.user)
        setCurrentPage('dashboard')
        toast.success('Account created!')
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (e) {
      toast.error('Registration failed')
    }
    setAuthLoading(false)
  }
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setCurrentUser(null)
    setCurrentPage('landing')
    toast.success('Logged out')
  }
  
  const viewListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`)
      const data = await res.json()
      if (data.listing) {
        setSelectedListing(data.listing)
        setCurrentPage('listing')
      }
    } catch (e) {
      toast.error('Failed to load listing')
    }
  }
  
  const deleteListing = async () => {
    if (!selectedListing || !confirm('Delete this listing?')) return
    
    try {
      await fetch(`/api/listings/${selectedListing.id}`, { method: 'DELETE' })
      toast.success('Listing deleted')
      setCurrentPage('marketplace')
      fetchListings()
    } catch (e) {
      toast.error('Failed to delete')
    }
  }
  
  const submitListing = async () => {
    if (!currentUser) {
      toast.error('Please login first')
      setAddListingModalOpen(false)
      setCurrentPage('login')
      return
    }
    
    // Validation
    if (!listingForm.title.trim()) {
      setFormError('Title is required')
      setListingStep(2)
      return
    }
    if (!listingForm.quantity || parseFloat(listingForm.quantity) <= 0) {
      setFormError('Valid quantity is required')
      setListingStep(2)
      return
    }
    if (!listingForm.price || parseFloat(listingForm.price) <= 0) {
      setFormError('Valid price is required')
      setListingStep(2)
      return
    }
    if (!listingForm.location.trim()) {
      setFormError('Location is required')
      setListingStep(2)
      return
    }
    
    setFormError('')
    
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listingForm.title,
          category: selectedCategory,
          quantity: listingForm.quantity,
          price: listingForm.price,
          location: listingForm.location,
          description: listingForm.description,
          lat: listingForm.lat,
          lng: listingForm.lng,
        }),
      })
      
      const data = await res.json()
      if (data.listing) {
        setListingStep(4)
        fetchListings()
        toast.success('Listing published!')
      } else {
        toast.error(data.error || 'Failed to create listing')
      }
    } catch (e) {
      toast.error('Failed to create listing')
    }
  }
  
  const sendMessage = async () => {
    if (!msgInput.trim() || !currentChat || !currentUser) return
    
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChat.id,
          text: msgInput,
        }),
      })
      setMsgInput('')
      fetchMessages(currentChat.id)
    } catch (e) {
      toast.error('Failed to send message')
    }
  }
  
  const contactSeller = async () => {
    if (!currentUser) {
      toast.error('Please login first')
      setCurrentPage('login')
      return
    }
    if (!selectedListing) return
    
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: selectedListing.sellerId }),
      })
      const data = await res.json()
      if (data.chat) {
        setCurrentChat(data.chat)
        setCurrentPage('chat')
      }
    } catch (e) {
      toast.error('Failed to start chat')
    }
  }
  
  const sendBotMessage = async () => {
    if (!chatInput.trim() || botLoading) return
    
    const userMessage = chatInput.trim()
    setBotMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setChatInput('')
    setBotLoading(true)
    
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          sessionId: chatSessionId 
        }),
      })
      
      const data = await res.json()
      
      if (data.success && data.response) {
        setBotMessages(prev => [...prev, { role: 'bot', text: data.response }])
      } else {
        setBotMessages(prev => [...prev, { 
          role: 'bot', 
          text: 'Sorry, I encountered an error. Please try again.' 
        }])
      }
    } catch (error) {
      setBotMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Failed to connect to AI. Please check your connection and try again.' 
      }])
    } finally {
      setBotLoading(false)
    }
  }
  
  const navigateTo = (page: Page) => {
    setCurrentPage(page)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }
  
  // Stats for dashboard
  const userListings = currentUser ? listings.filter(l => l.sellerId === currentUser.id) : []
  const totalViews = userListings.reduce((sum, l) => sum + l.views, 0)
  const totalRevenue = userListings.reduce((sum, l) => sum + l.price, 0)
  
  // Analytics data
  const categoryData = listings.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))
  
  const priceData = [
    { month: 'Jan', price: 320 },
    { month: 'Feb', price: 350 },
    { month: 'Mar', price: 280 },
    { month: 'Apr', price: 420 },
    { month: 'May', price: 380 },
    { month: 'Jun', price: 450 },
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 h-full w-[72px] hover:w-56 transition-all duration-300 z-50 
          bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border flex flex-col
          ${sidebarOpen ? 'translate-x-0 w-56' : ''} max-md:translate-x-[-100%] max-md:w-56
          ${sidebarOpen ? 'max-md:translate-x-0' : ''}`}
        >
          {/* Brand */}
          <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0 group-hover:shadow-primary/50 transition-shadow">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <span className="font-display font-bold text-lg whitespace-nowrap overflow-hidden transition-opacity duration-300 opacity-0 hover:opacity-100">
              <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">RecyConnect</span>
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {[
              { id: 'landing', icon: Home, label: t('Home', 'Home') },
              { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard', 'Dashboard') },
              { id: 'marketplace', icon: Store, label: t('Market', 'Market') },
              { id: 'map', icon: Map, label: t('Map', 'Map') },
              { id: 'chat', icon: MessageCircle, label: t('Chat', 'Chat') },
              { id: 'analytics', icon: BarChart3, label: t('Analytics', 'Analytics') },
              { id: 'settings', icon: Settings, label: t('Settings', 'Settings') },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id as Page)}
                className={`group w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200
                  ${currentPage === item.id 
                    ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10' 
                    : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'}`}
              >
                <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
          
          {/* Bottom section */}
          <div className="p-3 border-t border-sidebar-border space-y-1">
            <button
              onClick={toggleTheme}
              className="group w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5 shrink-0" /> : <Sun className="w-5 h-5 shrink-0" />}
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{t('Theme', 'Theme')}</span>
            </button>
            
            {/* Language Toggle Button - More Prominent */}
            <button
              onClick={toggleLang}
              className={`group w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${
                lang === 'ar' 
                  ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                  : 'hover:bg-sidebar-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Languages className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {lang === 'en' ? 'العربية' : 'English'}
              </span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); fetchNotifications(); }}
                className="group w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="relative">
                  <Bell className="w-5 h-5 shrink-0" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{t('Alerts', 'Alerts')}</span>
              </button>
              
              {notifDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-border flex justify-between items-center">
                    <span className="text-xs font-semibold">{t('Notifications', 'Notifications')}</span>
                    <button onClick={() => setNotifications([])} className="text-[10px] text-primary hover:underline">{t('Clear All', 'Clear All')}</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-border last:border-0 hover:bg-muted/50">
                        <p className="text-xs font-medium">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo(n.timestamp)}</p>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-xs text-muted-foreground">{t('No notifications', 'No notifications')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {currentUser ? (
              <>
                <button
                  onClick={() => navigateTo('profile')}
                  className="group w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {currentUser.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">{currentUser.firstName}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{t('Logout', 'Logout')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigateTo('login')}
                className="group w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-primary/10 text-primary transition-colors"
              >
                <LogIn className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{t('Login', 'Login')}</span>
              </button>
            )}
          </div>
        </aside>
        
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar/95 backdrop-blur-xl border-b border-border z-40 flex items-center px-4 justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-bold">RecyConnect</span>
          <div className="w-10" />
        </div>
        
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        {/* Floating Translation Button - Always Visible */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          onClick={toggleLang}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
            lang === 'ar' 
              ? 'bg-gradient-to-r from-primary to-teal-500 text-white shadow-primary/30' 
              : 'bg-card border border-border text-foreground hover:border-primary/50 hover:shadow-primary/20'
          }`}
        >
          <Languages className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {lang === 'en' ? 'العربية' : 'English'}
          </span>
          {isTranslating && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
        </motion.button>
        
        {/* Main content */}
        <main className="ml-0 md:ml-[72px] min-h-screen pt-16 md:pt-0">
          {/* Background effects - Landing page only */}
          {currentPage === 'landing' && (
            <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
              <div className="grid-mesh opacity-30" />

              {/* Light beam from top-left */}
              <div className="light-glow-1" />
              <div className="light-glow-2" />

              {/* Moving lines */}
              <div className="moving-line" style={{ top: '20%' }} />
              <div className="moving-line" style={{ top: '50%', animationDelay: '3s' }} />
              <div className="moving-line" style={{ top: '80%', animationDelay: '6s' }} />

              {/* Floating shapes */}
              <div className="floating-shape" style={{ top: '15%', left: '10%' }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="5" y="5" width="30" height="30" stroke="#22c55e" strokeWidth="1" fill="none" rx="4"/></svg>
              </div>
              <div className="floating-shape" style={{ top: '60%', left: '5%', animationDelay: '2s' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="12" stroke="#22c55e" strokeWidth="1" fill="none"/></svg>
              </div>
              <div className="floating-shape" style={{ top: '80%', left: '20%', animationDelay: '4s' }}>
                <svg width="35" height="35" viewBox="0 0 35 35" fill="none"><polygon points="17.5,2 32,27 3,27" stroke="#22c55e" strokeWidth="1" fill="none"/></svg>
              </div>
              <div className="floating-shape" style={{ top: '30%', left: '85%', animationDelay: '1s' }}>
                <svg width="45" height="45" viewBox="0 0 45 45" fill="none"><path d="M22.5 2L43 22.5L22.5 43L2 22.5Z" stroke="#22c55e" strokeWidth="1" fill="none"/></svg>
              </div>
            </div>
          )}

          {/* Site name - top left - Landing page only */}
          {currentPage === 'landing' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="fixed top-8 left-[100px] md:left-[100px] z-40 max-md:hidden"
            >
              <div className="relative group cursor-pointer">
                {/* Glow effect behind text */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-emerald-500/20 to-teal-500/20 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

                {/* Main brand name */}
                <div className="relative flex flex-col">
                  <span className="text-3xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
                      Recy
                    </span>
                    <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Connect
                    </span>
                  </span>

                  {/* Decorative line */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-[2px] w-8 bg-gradient-to-r from-primary to-transparent rounded-full" />
                    <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground/70">
                      Sustainable Trading
                    </span>
                  </div>
                </div>

                {/* Subtle shine animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-lg" />
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* LANDING PAGE */}
            {currentPage === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden"
              >
                {/* User badge - top right */}
                {currentUser && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-6 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {currentUser.firstName[0]}
                    </div>
                    <span className="text-sm font-medium">{t('Hi', 'Hi')}, {currentUser.firstName}</span>
                  </motion.div>
                )}
                
                <section className="min-h-screen flex items-center py-20">
                  <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <div className="text-center lg:text-left">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs text-primary mb-8"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          {t('FULL STACK PLATFORM', 'FULL STACK PLATFORM')}
                        </motion.div>
                        
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] mb-8"
                        >
                          {t('Turn Waste', 'Turn')} <span className="animate-shimmer">{t('Waste', 'Waste')}</span>
                          <br />{t('Into Wealth.', 'Into Wealth.')}
                        </motion.h1>
                        
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0"
                        >
                          {t('The premium full-stack marketplace connecting recyclers globally with real-time data and secure transactions.', 'The premium full-stack marketplace connecting recyclers globally with real-time data and secure transactions.')}
                        </motion.p>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex gap-4 justify-center lg:justify-start"
                        >
                          <Button size="lg" onClick={() => navigateTo('marketplace')} className="bg-white text-black hover:bg-gray-100">
                            {t('Explore Materials', 'Explore Materials')}
                          </Button>
                          <Button size="lg" variant="outline" onClick={() => navigateTo('register')}>
                            {t('Join Network', 'Join Network')}
                          </Button>
                        </motion.div>
                      </div>
                      
                      <div className="hidden lg:flex items-center justify-center h-[600px] relative w-full">
                        {/* Static rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {[150, 220, 300, 380].map((size, i) => (
                            <div
                              key={size}
                              className="absolute rounded-full border border-dashed border-primary/15"
                              style={{ width: size, height: size }}
                            />
                          ))}
                        </div>
                        
                        {/* Ripples from center */}
                        {[80, 120, 160, 200, 250].map((size, i) => (
                          <div
                            key={size}
                            className="absolute rounded-full border border-primary/20 animate-ripple"
                            style={{ 
                              width: size, 
                              height: size,
                              animationDelay: `${i * 0.4}s`,
                              top: '50%',
                              left: '50%',
                            }}
                          />
                        ))}
                        
                        {/* Glow orbs orbiting around center */}
                        {[ 
                          { delay: '0s', radius: 50, duration: 8, angle: 0 },
                          { delay: '-2s', radius: 80, duration: 10, angle: 36 },
                          { delay: '-4s', radius: 110, duration: 12, angle: 72 },
                          { delay: '-6s', radius: 140, duration: 14, angle: 108 },
                          { delay: '-8s', radius: 170, duration: 16, angle: 144 },
                          { delay: '-10s', radius: 200, duration: 18, angle: 180 },
                          { delay: '-12s', radius: 230, duration: 20, angle: 216 },
                          { delay: '-14s', radius: 260, duration: 22, angle: 252 },
                          { delay: '-16s', radius: 290, duration: 24, angle: 288 },
                          { delay: '-18s', radius: 320, duration: 26, angle: 324 },
                        ].map((orb, i) => (
                          <div
                            key={i}
                            className="glow-orb"
                            style={{
                              '--delay': orb.delay,
                              '--radius': `${orb.radius}px`,
                              '--duration': `${orb.duration}s`,
                              '--start-angle': `${orb.angle}deg`,
                            } as React.CSSProperties}
                          />
                        ))}
                        
                        {/* Center logo - spinning */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                          className="relative z-20"
                        >
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary via-teal-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-primary/60 relative overflow-hidden">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-teal-600 animate-pulse opacity-50" />
                            <motion.div 
                              className="absolute inset-0 flex items-center justify-center"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            >
                              <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="m14 16-3 3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8.293 13.596 7.196 9.5 3.1 10.598" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="m9.344 5.811 1.653-2.861a1.83 1.83 0 0 1 1.571-.888 1.784 1.784 0 0 1 1.54.879l4.468 7.744" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="m13.378 9.633 4.096 1.097 1.097-4.096" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        {/* 4 Cards rotating randomly around center */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {[
                            { text: t('Agricultural Waste', 'Agricultural Waste'), icon: '🌾', angle: 0, radius: 280, duration: 25 },
                            { text: t('Surplus Food', 'Surplus Food'), icon: '🍎', angle: 90, radius: 260, duration: 22 },
                            { text: t('Job Opportunities', 'Job Opportunities'), icon: '💼', angle: 180, radius: 290, duration: 28 },
                            { text: t('Recycle Anything', 'Recycle Anything'), icon: '♻️', angle: 270, radius: 270, duration: 24 },
                          ].map((item, i) => (
                            <div
                              key={item.text}
                              className="floating-card"
                              style={{
                                '--radius': `${item.radius}px`,
                                '--duration': `${item.duration}s`,
                                '--start-angle': `${item.angle}deg`,
                              } as React.CSSProperties}
                            >
                              {item.icon} {item.text}
                            </div>
                          ))}
                        </div>
                        
                        {/* Live badge */}
                        <motion.div 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="absolute top-0 right-0 flex items-center gap-2 px-4 py-2 glass rounded-full"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-xs font-semibold">{t('Live:', 'Live:')} <span className="text-primary">{liveUsers}</span> {t('users', 'users')}</span>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Features - Professional Section */}
                    <div className="py-24 mt-10 relative overflow-hidden">
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
                      
                      <div className="relative">
                        {/* Section Header */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-center mb-16"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary mb-6">
                            <Sparkles className="w-3 h-3" />
                            {t('WHY CHOOSE US', 'WHY CHOOSE US')}
                          </div>
                          <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            {t('Platform', 'Platform')} <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">{t('Features', 'Features')}</span>
                          </h2>
                          <p className="text-muted-foreground max-w-lg mx-auto">
                            {t('Built for the future of recycling with cutting-edge technology', 'Built for the future of recycling with cutting-edge technology')}
                          </p>
                        </motion.div>
                        
                        {/* Features Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {[
                            { icon: Map, title: t('Geo-Located', 'Geo-Located'), desc: t('Find materials near you instantly with precise location tracking', 'Find materials near you instantly with precise location tracking'), color: 'primary', gradient: 'from-green-500 to-emerald-600' },
                            { icon: MessageCircle, title: t('Secure Chat', 'Secure Chat'), desc: t('End-to-end encrypted negotiations for safe trading', 'End-to-end encrypted negotiations for safe trading'), color: 'blue-500', gradient: 'from-blue-500 to-cyan-600' },
                            { icon: BarChart3, title: t('Smart Offers', 'Smart Offers'), desc: t('AI-powered pricing and transparent market insights', 'AI-powered pricing and transparent market insights'), color: 'amber-500', gradient: 'from-amber-500 to-orange-600' },
                            { icon: Sparkles, title: t('Fast Trading', 'Fast Trading'), desc: t('Instant connections with verified recyclers globally', 'Instant connections with verified recyclers globally'), color: 'teal-500', gradient: 'from-teal-500 to-cyan-600' },
                          ].map((feature, i) => (
                            <motion.div
                              key={feature.title}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                              className="group relative"
                            >
                              {/* Card glow effect */}
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              
                              <Card className="relative h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden">
                                {/* Top accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />
                                
                                <CardContent className="p-6">
                                  {/* Icon container */}
                                  <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                                      <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                  </div>
                                  
                                  {/* Content */}
                                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                                  
                                  {/* Learn more link */}
                                  <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>{t('Learn more', 'Learn more')}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Bottom stats */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 }}
                          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                          {[
                            { value: '10K+', label: t('Active Users', 'Active Users') },
                            { value: '50K+', label: t('Transactions', 'Transactions') },
                            { value: '99.9%', label: t('Uptime', 'Uptime') },
                            { value: '24/7', label: t('Support', 'Support') },
                          ].map((stat, i) => (
                            <div key={stat.label} className="text-center">
                              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                                {stat.value}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                          ))}
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Trending Materials - Professional Section */}
                    <div className="py-20 relative overflow-hidden">
                      {/* Background pattern */}
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="relative">
                        {/* Section Header */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
                        >
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs text-amber-500 mb-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              {t('HOT RIGHT NOW', 'HOT RIGHT NOW')}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">
                              {t('Trending', 'Trending')} <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{t('Materials', 'Materials')}</span>
                            </h2>
                            <p className="text-sm text-muted-foreground mt-2">{t('High-demand recyclable materials in your area', 'Most viewed items this week')}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="group border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
                            onClick={() => navigateTo('marketplace')}
                          >
                            {t('View All', 'View All')} 
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                        
                        {/* Materials Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {listings.slice(0, 4).map((listing, i) => (
                            <motion.div
                              key={listing.id}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                              className="group"
                            >
                              <Card
                                className="relative h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                                onClick={() => viewListing(listing.id)}
                              >
                                {/* Category badge - top right */}
                                <div className="absolute top-3 right-3 z-10">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] font-medium backdrop-blur-sm ${categoryColors[listing.category]}`}
                                  >
                                    {listing.category}
                                  </Badge>
                                </div>
                                
                                {/* Image placeholder with gradient */}
                                <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                                  {/* Category icon */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    {listing.category === 'Plastic' && (
                                      <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10h20V10c0-1.1-.9-2-2-2zM9 6h6v2H9V6zm11 12H4v-6h3v1h2v-1h6v1h2v-1h3v6z"/></svg>
                                    )}
                                    {listing.category === 'Metal' && (
                                      <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                    )}
                                    {listing.category === 'Paper' && (
                                      <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                                    )}
                                    {listing.category === 'Electronics' && (
                                      <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/></svg>
                                    )}
                                  </div>
                                  {/* Hover overlay */}
                                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                <CardContent className="p-4">
                                  {/* Title */}
                                  <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{listing.title}</h3>
                                  
                                  {/* Location */}
                                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                    <Map className="w-3 h-3" />
                                    <span className="truncate">{listing.location}</span>
                                  </div>
                                  
                                  {/* Stats row */}
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                      <span>{listing.views} views</span>
                                    </div>
                                    <div className="text-lg font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                                      ${listing.price}
                                    </div>
                                  </div>
                                  
                                  {/* Seller info */}
                                  <div className="flex items-center gap-2 mt-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-[10px] text-white font-bold">
                                      {listing.sellerName?.[0] || 'S'}
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate">{listing.sellerName}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Empty state */}
                        {listings.length === 0 && (
                          <div className="text-center py-16">
                            <Store className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No trending materials yet</p>
                            <Button variant="outline" className="mt-4" onClick={() => setAddListingModalOpen(true)}>
                              Add Listing
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
            
            {/* DASHBOARD PAGE */}
            {currentPage === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 max-w-7xl mx-auto"
              >
                {!currentUser ? (
                  <div className="min-h-[80vh] flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mb-6">
                        <User className="w-10 h-10 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{t('Welcome back', 'Welcome to Dashboard')}</h2>
                      <p className="text-muted-foreground mb-6">{t('Please login first', 'Please login to access your dashboard')}</p>
                      <Button size="lg" onClick={() => navigateTo('login')} className="bg-gradient-to-r from-primary to-teal-500 hover:opacity-90">
                        <LogIn className="w-4 h-4 mr-2" /> {t('Login', 'Login Now')}
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
                    >
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          {t('OVERVIEW', 'OVERVIEW')}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                          {t('Welcome back', 'Good ' + (new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'))}, <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">{currentUser.firstName}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1">{t("Here's what's happening with your listings", "Here's what's happening with your account")}</p>
                      </div>
                      <Button 
                        onClick={() => setAddListingModalOpen(true)}
                        className="bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 shadow-lg shadow-primary/25"
                      >
                        <Plus className="w-4 h-4 mr-2" /> {t('Add New Listing', 'Create Listing')}
                      </Button>
                    </motion.div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {[
                        { label: t('Total Listings', 'Active Listings'), value: userListings.length, change: '+12%', icon: Store, gradient: 'from-green-500 to-emerald-600' },
                        { label: t('Messages', 'Messages'), value: chats.length, change: '+5', icon: MessageCircle, gradient: 'from-blue-500 to-cyan-600' },
                        { label: t('Total Views', 'Total Views'), value: totalViews, change: '+28%', icon: BarChart3, gradient: 'from-amber-500 to-orange-600' },
                        { label: t('Est. Revenue', 'Est. Revenue'), value: `$${totalRevenue}`, change: '+15%', icon: Sparkles, gradient: 'from-teal-500 to-cyan-600' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="group"
                        >
                          <Card className="relative h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                            {/* Top accent */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                            
                            <CardContent className="p-5">
                              <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-[1px]`}>
                                  <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 text-primary" />
                                  </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-500`}>
                                  {stat.change}
                                </span>
                              </div>
                              <div className="text-3xl font-bold mb-1">{stat.value}</div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Quick Actions */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-8"
                    >
                      <Card className="bg-gradient-to-r from-primary/10 via-teal-500/5 to-primary/10 border-primary/20">
                        <CardContent className="p-6">
                          <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            {t('Quick Actions', 'Quick Actions')}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { icon: Plus, label: t('Add Listing', 'Add Listing'), action: () => setAddListingModalOpen(true) },
                              { icon: MessageCircle, label: t('Chat', 'Messages'), action: () => navigateTo('chat') },
                              { icon: Map, label: t('Map', 'Explore Map'), action: () => navigateTo('map') },
                              { icon: BarChart3, label: t('Analytics', 'Analytics'), action: () => navigateTo('analytics') },
                            ].map((action) => (
                              <button
                                key={action.label}
                                onClick={action.action}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 hover:bg-background border border-border/50 hover:border-primary/30 transition-all group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <action.icon className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-medium">{action.label}</span>
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    {/* Recent Activity */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                              <Store className="w-4 h-4 text-primary" />
                              {t('Recent Activity', 'Recent Activity')}
                            </h3>
                            {userListings.length > 0 && (
                              <Button variant="ghost" size="sm" onClick={() => navigateTo('marketplace')}>
                                {t('View All', 'View All')} <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {userListings.slice(0, 5).map((listing, idx) => (
                              <motion.div
                                key={listing.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + idx * 0.05 }}
                                className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/30 cursor-pointer transition-all group"
                                onClick={() => viewListing(listing.id)}
                              >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center shrink-0">
                                  <Store className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate group-hover:text-primary transition-colors">{listing.title}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span>{listing.location}</span>
                                    <span>•</span>
                                    <span>{listing.views} views</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="font-bold text-primary">${listing.price}</div>
                                  <div className="text-xs text-muted-foreground">{timeAgo(listing.createdAt)}</div>
                                </div>
                              </motion.div>
                            ))}
                            {userListings.length === 0 && (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                                  <Store className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-muted-foreground mb-4">No listings yet</p>
                                <Button variant="outline" onClick={() => setAddListingModalOpen(true)}>
                                  <Plus className="w-4 h-4 mr-2" /> Create Your First Listing
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
            
            {/* MARKETPLACE PAGE */}
            {currentPage === 'marketplace' && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 max-w-7xl mx-auto"
              >
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary mb-3">
                      <Store className="w-3 h-3" />
                      {t('BROWSE MATERIALS', 'BROWSE MATERIALS')}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">{t('Marketplace', 'Marketplace')}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {listings.length} {t('materials', 'materials')} {t('found', 'available from verified sellers')}
                    </p>
                  </div>
                  <Button 
                    onClick={() => { if(!currentUser) { toast.error(t('Please login first', 'Please login first')); navigateTo('login'); } else { setAddListingModalOpen(true); }}}
                    className="bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 shadow-lg shadow-primary/25"
                  >
                    <Plus className="w-4 h-4 mr-2" /> {t('Add Listing', 'Add Listing')}
                  </Button>
                </motion.div>
                
                {/* Filters Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-8">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder={t('Search materials...', 'Search materials, locations, sellers...')}
                            className="pl-11 h-11 bg-muted/50 border-border/50 focus:border-primary/50"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setTimeout(fetchListings, 300); }}
                          />
                        </div>
                        
                        {/* Categories */}
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { value: '', label: t('All', 'All'), icon: '🌐' },
                            { value: 'Plastic', label: t('Plastic', 'Plastic'), icon: '♻️' },
                            { value: 'Metal', label: t('Metal', 'Metal'), icon: '🔩' },
                            { value: 'Paper', label: t('Paper', 'Paper'), icon: '📄' },
                            { value: 'Electronics', label: t('Electronics', 'Electronics'), icon: '🔌' },
                            { value: 'Agricultural Waste', label: t('Agricultural Waste', 'Agri Waste'), icon: '🌾' },
                            { value: 'Food Surplus', label: t('Food Surplus', 'Food'), icon: '🍎' },
                            { value: 'Textiles', label: t('Textiles', 'Textiles'), icon: '👕' },
                            { value: 'Glass', label: t('Glass', 'Glass'), icon: '🫙' },
                          ].map(cat => (
                            <button
                              key={cat.value}
                              onClick={() => { setCategoryFilter(cat.value); fetchListings(); }}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                                ${categoryFilter === cat.value 
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                                  : 'bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30'}`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </div>
                        
                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); fetchListings(); }}>
                          <SelectTrigger className="w-[180px] h-11 bg-muted/50 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">{t('Newest', 'Newest First')}</SelectItem>
                            <SelectItem value="price-low">{t('Price: Low to High', 'Price: Low to High')}</SelectItem>
                            <SelectItem value="price-high">{t('Price: High to Low', 'Price: High to Low')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Listings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((listing, i) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                      className="group"
                    >
                      <Card
                        className="relative h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                        onClick={() => viewListing(listing.id)}
                      >
                        {/* Category badge - top right */}
                        <div className="absolute top-3 right-3 z-10">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-medium backdrop-blur-sm ${categoryColors[listing.category]}`}
                          >
                            {listing.category}
                          </Badge>
                        </div>
                        
                        {/* Image placeholder */}
                        <div className="relative h-36 bg-gradient-to-br from-muted via-muted/80 to-muted/50 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                          {/* Category icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            {listing.category === 'Plastic' && (
                              <svg className="w-20 h-20 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10h20V10c0-1.1-.9-2-2-2zM9 6h6v2H9V6zm11 12H4v-6h3v1h2v-1h6v1h2v-1h3v6z"/></svg>
                            )}
                            {listing.category === 'Metal' && (
                              <svg className="w-20 h-20 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                            )}
                            {listing.category === 'Paper' && (
                              <svg className="w-20 h-20 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                            )}
                            {listing.category === 'Electronics' && (
                              <svg className="w-20 h-20 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/></svg>
                            )}
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <CardContent className="p-4">
                          {/* Title */}
                          <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{listing.title}</h3>
                          
                          {/* Quantity & Location */}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-full bg-muted">{listing.quantity} kg</span>
                            <span className="truncate">{listing.location}</span>
                          </div>
                          
                          {/* Price & Views */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                            <div className="text-lg font-bold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                              ${listing.price}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              {listing.views} views
                            </div>
                          </div>
                          
                          {/* Seller */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center text-[10px] text-white font-bold">
                              {listing.sellerName?.[0] || 'S'}
                            </div>
                            <span className="text-xs text-muted-foreground truncate">{listing.sellerName}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {/* Empty State */}
                {listings.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24"
                  >
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6">
                      <Store className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => { setSearchQuery(''); setCategoryFilter(''); fetchListings(); }}>
                        Clear Filters
                      </Button>
                      {currentUser && (
                        <Button onClick={() => setAddListingModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" /> Add Listing
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {/* LISTING DETAIL PAGE */}
            {currentPage === 'listing' && selectedListing && (
              <motion.div
                key="listing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 max-w-4xl mx-auto"
              >
                <Card className="glass overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
                    <Badge className={`absolute top-4 left-4 ${categoryColors[selectedListing.category]}`}>
                      {selectedListing.category}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-background/50"
                      onClick={() => navigateTo('marketplace')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-2xl font-bold mb-1">{selectedListing.title}</h1>
                        <p className="text-sm text-muted-foreground">{selectedListing.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${selectedListing.price}</div>
                        <div className="text-xs text-muted-foreground">per {selectedListing.quantity} kg</div>
                      </div>
                    </div>
                    
                    <p className="border-l-2 border-primary pl-4 mb-8 text-sm text-muted-foreground">
                      {selectedListing.description || 'No description available.'}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted/50">
                      <Avatar>
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {selectedListing.sellerName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{selectedListing.sellerName}</div>
                        <div className="text-xs text-muted-foreground">Seller</div>
                      </div>
                    </div>
                    
                    {currentUser?.id === selectedListing.sellerId ? (
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1">Edit</Button>
                        <Button variant="destructive" className="flex-1" onClick={deleteListing}>Delete</Button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button className="flex-1" onClick={() => { toast.success('Offer sent!'); contactSeller(); }}>
                          Make Offer
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={contactSeller}>
                          Message
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* MAP PAGE */}
            {currentPage === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-4rem)] md:h-screen relative"
              >
                {/* Map Controls Overlay */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]"
                >
                  <Card className="bg-card/90 backdrop-blur-xl border-border/50 shadow-2xl shadow-black/20">
                    <CardContent className="p-3 flex items-center gap-2 overflow-x-auto max-w-full">
                      <div className="flex items-center gap-1 mr-2 shrink-0">
                        <Map className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">{t('Filter by category', 'Filter:')}</span>
                      </div>
                      {[
                        { value: '', label: t('All', 'All'), icon: '🌍' },
                        { value: 'Plastic', label: t('Plastic', 'Plastic'), icon: '♻️' },
                        { value: 'Metal', label: t('Metal', 'Metal'), icon: '🔩' },
                        { value: 'Paper', label: t('Paper', 'Paper'), icon: '📄' },
                        { value: 'Electronics', label: t('Electronics', 'Electronics'), icon: '🔌' },
                        { value: 'Agricultural Waste', label: t('Agricultural Waste', 'Agri'), icon: '🌾' },
                        { value: 'Food Surplus', label: t('Food Surplus', 'Food'), icon: '🍎' },
                        { value: 'Textiles', label: t('Textiles', 'Textiles'), icon: '👕' },
                        { value: 'Glass', label: t('Glass', 'Glass'), icon: '🫙' },
                      ].map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => setCategoryFilter(cat.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                            ${categoryFilter === cat.value 
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                              : 'bg-muted/50 hover:bg-muted border border-border/50'}`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Stats Overlay */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-4 left-4 z-[1000] max-w-xs"
                >
                  <Card className="bg-card/90 backdrop-blur-xl border-border/50 shadow-2xl shadow-black/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Map className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{t('Map', 'Map View')}</div>
                          <div className="text-xs text-muted-foreground">{listings.filter(l => l.lat && l.lng).length} {t('locations', 'locations')}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground">{t('Showing', 'Showing')}</div>
                          <div className="font-bold text-primary">
                            {listings.filter(l => categoryFilter ? l.category === categoryFilter : true).filter(l => l.lat && l.lng).length} {t('pins', 'pins')}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground">{t('Region', 'Region')}</div>
                          <div className="font-bold">UAE</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <div className="h-full w-full">
                  {typeof window !== 'undefined' && (
                    <MapContainer
                      center={[25.0, 55.0]}
                      zoom={6}
                      className="h-full w-full z-0"
                      style={{ background: 'var(--background)' }}
                    >
                      <TileLayer
                        attribution=''
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      />
                      {listings.filter(l => categoryFilter ? l.category === categoryFilter : true).map(listing => (
                        listing.lat && listing.lng && (
                          <CircleMarker
                            key={listing.id}
                            center={[listing.lat, listing.lng]}
                            radius={12}
                            pathOptions={{
                              color: '#22c55e',
                              fillColor: '#22c55e',
                              fillOpacity: 0.8,
                              weight: 3,
                              opacity: 1,
                              className: 'glow-marker'
                            }}
                            eventHandlers={{
                              click: () => viewListing(listing.id),
                            }}
                          >
                            <Popup>
                              <div className="p-1 min-w-[150px]">
                                <Badge className={`mb-2 ${categoryColors[listing.category]}`}>
                                  {listing.category}
                                </Badge>
                                <div className="font-semibold text-sm">{listing.title}</div>
                                <div className="text-primary font-bold text-lg">${listing.price}</div>
                                <div className="text-xs text-muted-foreground">{listing.location}</div>
                              </div>
                            </Popup>
                          </CircleMarker>
                        )
                      ))}
                    </MapContainer>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* CHAT PAGE */}
            {currentPage === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-4rem)] md:h-screen flex flex-col md:flex-row"
              >
                {/* Conversations List */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full md:w-80 border-r border-border bg-sidebar/95 backdrop-blur-xl flex flex-col"
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        {t('Messages', 'Messages')}
                      </h2>
                      <Badge variant="secondary" className="text-[10px]">
                        {chats.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('Your conversations', 'Your conversations')}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {currentUser ? (
                      chats.length > 0 ? chats.map((chat, idx) => {
                        const otherId = chat.participants.find(p => p !== currentUser.id)
                        const name = chat.participantNames[otherId || ''] || 'Unknown'
                        return (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setCurrentChat(chat)}
                            className={`p-4 hover:bg-muted/50 cursor-pointer border-b border-border flex items-center gap-3 transition-all
                              ${currentChat?.id === chat.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
                          >
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-teal-500 text-white font-bold">
                                  {name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="font-medium truncate">{name}</p>
                                <span className="text-[10px] text-muted-foreground">{timeAgo(chat.updatedAt)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || t('No messages yet', 'No messages yet')}</p>
                            </div>
                          </motion.div>
                        )
                      }) : (
                        <div className="p-6 text-center">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm text-muted-foreground">{t('No conversations yet', 'No conversations yet')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('Start by contacting a seller', 'Start by contacting a seller')}</p>
                        </div>
                      )
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                          <User className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{t('Please login first', 'Please login to view messages')}</p>
                        <Button onClick={() => navigateTo('login')} className="bg-gradient-to-r from-primary to-teal-500">
                          <LogIn className="w-4 h-4 mr-2" /> {t('Login', 'Login')}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-background">
                  {currentChat ? (
                    <>
                      {/* Chat Header */}
                      <div className="border-b border-border p-4 flex items-center gap-3 bg-sidebar/95 backdrop-blur-xl">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-teal-500 text-white font-bold text-sm">
                            {currentChat.participantNames[currentChat.participants.find(p => p !== currentUser?.id) || '']}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span className="font-semibold">
                            {currentChat.participantNames[currentChat.participants.find(p => p !== currentUser?.id) || '']}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-green-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {t('Online', 'Online')}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Messages */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/20">
                        {messages.map((msg, idx) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${msg.senderId === currentUser?.id ? 'chat-bubble-user' : 'chat-bubble-other'}`}>
                              <p className="text-sm">{msg.text}</p>
                              <p className="text-[10px] opacity-70 mt-1 text-right">{timeAgo(msg.timestamp)}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Input */}
                      <div className="border-t border-border p-3 flex gap-2 bg-sidebar/95 backdrop-blur-xl">
                        <Input
                          placeholder={t('Type a message...', 'Type your message...')}
                          className="flex-1 bg-background/50"
                          value={msgInput}
                          onChange={(e) => setMsgInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button size="icon" onClick={sendMessage} className="bg-gradient-to-r from-primary to-teal-500 shrink-0">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                          <MessageCircle className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground font-medium">{t('Select a conversation', 'Select a conversation')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('Choose from your existing conversations', 'Choose from your existing conversations')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* ANALYTICS PAGE */}
            {currentPage === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 max-w-7xl mx-auto"
              >
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary mb-3">
                    <BarChart3 className="w-3 h-3" />
                    {t('INSIGHTS', 'INSIGHTS')}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">{t('Analytics', 'Analytics')}</span>
                  </h1>
                  <p className="text-muted-foreground mt-1">{t('Track your performance and market trends', 'Track your performance and market trends')}</p>
                </motion.div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: t('Total Listings', 'Total Listings'), value: listings.length, change: '+12%', icon: Store, gradient: 'from-green-500 to-emerald-600' },
                    { label: t('Total Views', 'Total Views'), value: listings.reduce((sum, l) => sum + l.views, 0), change: '+28%', icon: BarChart3, gradient: 'from-blue-500 to-cyan-600' },
                    { label: t('Avg. Listing Price', 'Avg Price'), value: `$${listings.length > 0 ? Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length) : 0}`, change: '+5%', icon: Sparkles, gradient: 'from-amber-500 to-orange-600' },
                    { label: t('Categories', 'Categories'), value: Object.keys(categoryData).length, change: t('Active', 'Active'), icon: Map, gradient: 'from-teal-500 to-cyan-600' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="relative h-full bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} p-[1px]`}>
                              <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                                <stat.icon className="w-4 h-4 text-primary" />
                              </div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-500`}>
                              {stat.change}
                            </span>
                          </div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-primary" />
                            </div>
                            {t('Category Distribution', 'Listings by Category')}
                          </h3>
                          <Badge variant="secondary" className="text-[10px]">{pieData.length} {t('categories', 'categories')}</Badge>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              dataKey="value"
                              paddingAngle={4}
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={categoryChartColors[index % categoryChartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                background: 'var(--card)', 
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 justify-center mt-4">
                          {pieData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2 text-xs">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ background: categoryChartColors[index % categoryChartColors.length] }}
                              />
                              <span>{item.name}</span>
                              <span className="text-muted-foreground">({item.value})</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-teal-500" />
                            </div>
                            {t('Price Trends', 'Price Trends')}
                          </h3>
                          <Badge variant="secondary" className="text-[10px]">6 {t('months', 'months')}</Badge>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={priceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ 
                                background: 'var(--card)', 
                                border: '1px solid var(--border)',
                                borderRadius: '8px'
                              }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#22c55e" 
                              strokeWidth={3} 
                              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, fill: '#22c55e' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            {/* SETTINGS PAGE */}
            {currentPage === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 max-w-3xl mx-auto"
              >
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary mb-3">
                    <Settings className="w-3 h-3" />
                    {t('PREFERENCES', 'PREFERENCES')}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">{t('Settings', 'Settings')}</span>
                  </h1>
                  <p className="text-muted-foreground mt-1">{t('Customize your experience', 'Customize your experience')}</p>
                </motion.div>
                
                {/* Appearance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary via-teal-500 to-emerald-500" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-bold">{t('Appearance', 'Appearance')}</h3>
                          <p className="text-xs text-muted-foreground">{t('Customize how the app looks', 'Customize how the app looks')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                              <Moon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{t('Theme', 'Theme')}</p>
                              <p className="text-xs text-muted-foreground">{t('Current mode', 'Current')}: {theme === 'dark' ? t('Dark Mode', 'Dark') : t('Light Mode', 'Light')} {t('mode', 'mode')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { if(theme === 'dark') toggleTheme(); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                              {t('Light Mode', 'Light')}
                            </button>
                            <button
                              onClick={() => { if(theme === 'light') toggleTheme(); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                              {t('Dark Mode', 'Dark')}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{t('Language', 'Language')}</p>
                              <p className="text-xs text-muted-foreground">{t('Current language', 'Current')}: {lang === 'en' ? t('English', 'English') : t('Arabic', 'العربية')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { if(lang === 'ar') toggleLang(); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                              EN
                            </button>
                            <button
                              onClick={() => { if(lang === 'en') toggleLang(); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${lang === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                            >
                              عربي
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Notifications */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-bold">{t('Notifications', 'Notifications')}</h3>
                          <p className="text-xs text-muted-foreground">{t('Manage your notification preferences', 'Manage your notification preferences')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { label: t('Email Notifications', 'Email Notifications'), desc: t('Receive updates via email', 'Receive updates via email'), icon: '📧' },
                          { label: t('Push Notifications', 'Push Notifications'), desc: t('Browser push notifications', 'Browser push notifications'), icon: '🔔' },
                          { label: t('Price Alerts', 'Price Alerts'), desc: t('Get notified about price changes', 'Get notified about price changes'), icon: '📈' },
                          { label: t('New Messages', 'New Messages'), desc: t('Instant message notifications', 'Instant message notifications'), icon: '💬' },
                        ].map((item, i) => (
                          <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{item.icon}</span>
                              <div>
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                              </div>
                            </div>
                            <Switch defaultChecked={i < 2} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Data Management */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-bold">{t('Data Management', 'Data Management')}</h3>
                          <p className="text-xs text-muted-foreground">{t('Export or delete your data', 'Export or delete your data')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start h-auto py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{t('Export Data', 'Export My Data')}</p>
                              <p className="text-xs text-muted-foreground">{t('Download all your data', 'Download all your data as JSON')}</p>
                            </div>
                          </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-auto py-3 text-destructive border-destructive/30 hover:bg-destructive/10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                              <X className="w-4 h-4 text-destructive" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{t('Clear All Data', 'Clear All Data')}</p>
                              <p className="text-xs text-muted-foreground">{t('Permanently delete all your data', 'Permanently delete all your data')}</p>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
            
            {/* PROFILE PAGE */}
            {currentPage === 'profile' && currentUser && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 max-w-4xl mx-auto"
              >
                <Card className="glass text-center">
                  <CardContent className="p-8">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarFallback className="bg-primary/20 text-primary text-2xl border-2 border-primary">
                        {currentUser.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">{currentUser.firstName}</h1>
                    <p className="text-sm text-muted-foreground mb-6">{currentUser.email}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="text-xl font-bold">{userListings.length}</div>
                        <div className="text-xs text-muted-foreground">{t('Total Listings', 'Listings')}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="text-xl font-bold">{totalViews}</div>
                        <div className="text-xs text-muted-foreground">{t('Total Views', 'Views')}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="text-xl font-bold">{chats.length}</div>
                        <div className="text-xs text-muted-foreground">{t('Chat', 'Chats')}</div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="text-destructive border-destructive/50" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> {t('Logout', 'Logout')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* LOGIN PAGE */}
            {currentPage === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-screen flex items-center justify-center p-4 pt-28"
              >
                <div className="w-full max-w-md">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('Welcome back', 'Welcome Back')}</h1>
                    <p className="text-sm text-muted-foreground mt-2">{t('Sign in to your account', 'Sign in to your account')}</p>
                  </div>
                  <Card className="glass">
                    <CardContent className="p-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label className="text-xs">{t('Email', 'Email')}</Label>
                          <Input name="email" type="email" placeholder="your@email.com" required className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">{t('Password', 'Password')}</Label>
                          <Input name="password" type="password" placeholder="••••••••" required className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full" disabled={authLoading}>
                          {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Sign In', 'Sign In')}
                        </Button>
                      </form>
                      
                      <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          {t("Don't have an account?", "Don't have an account?")}{' '}
                          <button 
                            onClick={() => navigateTo('register')} 
                            className="text-primary font-semibold hover:underline"
                          >
                            {t('Create Account', 'Create Account')}
                          </button>
                        </p>
                      </div>
                      
                      <p className="text-center text-xs mt-4 p-3 rounded-lg bg-muted/50 text-muted-foreground">
                        Demo: ahmed@demo.com / demo123
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
            
            {/* REGISTER PAGE */}
            {currentPage === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-screen flex items-center justify-center p-4 pt-28"
              >
                <div className="w-full max-w-md">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">{t('Create Account', 'Create Account')}</h1>
                    <p className="text-sm text-muted-foreground mt-2">{t('Join the recycling network', 'Join the recycling marketplace')}</p>
                  </div>
                  <Card className="glass">
                    <CardContent className="p-6">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                          <Label className="text-xs">{t('First Name', 'First Name')}</Label>
                          <Input name="firstName" placeholder={t('Your name', 'Your name')} required className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">{t('Email', 'Email')}</Label>
                          <Input name="email" type="email" placeholder="your@email.com" required className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">{t('Password', 'Password')}</Label>
                          <Input name="password" type="password" placeholder={t('Min 6 characters', 'Min 6 characters')} required minLength={6} className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full" disabled={authLoading}>
                          {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Create Account', 'Create Account')}
                        </Button>
                      </form>
                      
                      <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          {t('Already have an account?', 'Already have an account?')}{' '}
                          <button 
                            onClick={() => navigateTo('login')} 
                            className="text-primary font-semibold hover:underline"
                          >
                            {t('Sign in', 'Sign In')}
                          </button>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Chatbot Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-shadow"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          {!chatbotOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
          )}
        </motion.button>
        
        {/* Chatbot Window */}
        <AnimatePresence>
          {chatbotOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-28 right-6 z-40 w-[400px] h-[550px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-4 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 border-b border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-teal-500/5" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">RecyBot AI</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {t('Online', 'Online')} • {t('Powered by AI', 'Powered by AI')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setBotMessages([])} 
                      className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      title={t('Clear chat', 'Clear chat')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/20">
                {botMessages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{t('Hi', 'Hi')}! {t('I\'m RecyBot', 'I\'m RecyBot')} ♻️</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('Your AI assistant for recycling marketplace', 'Your AI assistant for recycling marketplace')}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        t('Plastic prices?', 'Plastic prices?'),
                        t('Find copper', 'Find copper'),
                        t('Recycling tips', 'Recycling tips'),
                        t('How to sell?', 'How to sell?')
                      ].map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setChatInput(suggestion)
                            setTimeout(() => {
                              const inputEl = document.querySelector('input[placeholder*="Ask"]') as HTMLInputElement
                              if (inputEl) inputEl.focus()
                            }, 100)
                          }}
                          className="px-3 py-1.5 text-xs rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {botMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center mr-2 shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`px-4 py-3 text-sm max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-primary to-teal-500 text-white rounded-2xl rounded-tr-md shadow-lg shadow-primary/20' 
                        : 'bg-card border border-border/50 rounded-2xl rounded-tl-md shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing indicator */}
                {botLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center mr-2 shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 bg-card border border-border/50 rounded-2xl rounded-tl-md shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Input */}
              <div className="p-4 border-t border-border/50 bg-card/50">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      placeholder={t('Ask me anything about recycling...', 'Ask about materials, prices...')}
                      className="w-full h-12 pr-4 pl-4 bg-muted/50 border-border/50 rounded-xl focus:border-primary/50 text-sm"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !botLoading && sendBotMessage()}
                      disabled={botLoading}
                    />
                  </div>
                  <Button 
                    size="icon" 
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:opacity-90 shadow-lg shadow-primary/30 shrink-0"
                    onClick={sendBotMessage}
                    disabled={botLoading || !chatInput.trim()}
                  >
                    {botLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                  {t('AI may make mistakes. Verify important info.', 'RecyBot may make mistakes. Verify important info.')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Add Listing Modal */}
        <Dialog open={addListingModalOpen} onOpenChange={(open) => {
          setAddListingModalOpen(open)
          if (!open) {
            setListingStep(1)
            setFormError('')
          }
        }}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('Create New Listing', 'New Listing')}</DialogTitle>
            </DialogHeader>
            
            {/* Error message */}
            {formError && (
              <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg">
                {formError}
              </div>
            )}
            
            {/* Progress steps */}
            <div className="flex gap-2 justify-center mb-4">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    listingStep > step ? 'bg-primary text-primary-foreground' :
                    listingStep === step ? 'bg-primary/20 text-primary border border-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {listingStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && <div className={`w-5 h-0.5 ${listingStep > step ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
            
            {/* Step 1: Category */}
            {listingStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-center text-muted-foreground">Select category</p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {[
                    { name: 'Plastic', icon: '♻️', desc: 'Bottles, containers, packaging' },
                    { name: 'Metal', icon: '🔩', desc: 'Scrap metal, aluminum, copper' },
                    { name: 'Paper', icon: '📄', desc: 'Cardboard, newspapers, books' },
                    { name: 'Electronics', icon: '🔌', desc: 'E-waste, devices, components' },
                    { name: 'Agricultural Waste', icon: '🌾', desc: 'Crop residues, organic waste' },
                    { name: 'Food Surplus', icon: '🍎', desc: 'Excess food, perishables' },
                    { name: 'Textiles', icon: '👕', desc: 'Clothes, fabrics, shoes' },
                    { name: 'Glass', icon: '🫙', desc: 'Bottles, jars, windows' },
                  ].map(cat => (
                    <div
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedCategory === cat.name ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-lg mb-1">{cat.icon}</div>
                      <div className="font-semibold text-sm">{cat.name}</div>
                      <div className="text-[10px] text-muted-foreground">{cat.desc}</div>
                    </div>
                  ))}
                </div>
                <Button className="w-full" disabled={!selectedCategory} onClick={() => { setFormError(''); setListingStep(2); }}>
                  Continue
                </Button>
              </div>
            )}
            
            {/* Step 2: Details */}
            {listingStep === 2 && (
              <div className="space-y-3">
                <Input
                  placeholder="Listing Title *"
                  value={listingForm.title}
                  onChange={(e) => { setListingForm({ ...listingForm, title: e.target.value }); setFormError(''); }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Quantity (kg) *"
                    type="number"
                    value={listingForm.quantity}
                    onChange={(e) => { setListingForm({ ...listingForm, quantity: e.target.value }); setFormError(''); }}
                  />
                  <Input
                    placeholder="Price ($) *"
                    type="number"
                    value={listingForm.price}
                    onChange={(e) => { setListingForm({ ...listingForm, price: e.target.value }); setFormError(''); }}
                  />
                </div>
                <Input
                  placeholder="Location name (e.g., Dubai) *"
                  value={listingForm.location}
                  onChange={(e) => { setListingForm({ ...listingForm, location: e.target.value }); setFormError(''); }}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={listingForm.description}
                  onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setListingStep(1)}>Back</Button>
                  <Button className="flex-1" onClick={() => {
                    if (!listingForm.title.trim()) { setFormError('Title is required'); return; }
                    if (!listingForm.quantity || parseFloat(listingForm.quantity) <= 0) { setFormError('Valid quantity is required'); return; }
                    if (!listingForm.price || parseFloat(listingForm.price) <= 0) { setFormError('Valid price is required'); return; }
                    if (!listingForm.location.trim()) { setFormError('Location is required'); return; }
                    setFormError('');
                    setListingStep(3);
                  }}>Continue</Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Location on Map */}
            {listingStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-center text-muted-foreground">Click on the map to set your location</p>
                <div className="h-[200px] rounded-xl overflow-hidden border border-border relative">
                  <LocationPickerMap 
                    lat={listingForm.lat}
                    lng={listingForm.lng}
                    locationName={listingForm.location}
                    onLocationChange={(lat, lng) => setListingForm({ ...listingForm, lat, lng })}
                    height="200px"
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Coordinates: {listingForm.lat.toFixed(4)}, {listingForm.lng.toFixed(4)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setListingStep(2)}>Back</Button>
                  <Button className="flex-1" onClick={() => { setFormError(''); setListingStep(4); }}>Continue</Button>
                </div>
              </div>
            )}
            
            {/* Step 4: Review */}
            {listingStep === 4 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold">Review Listing</h3>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Category:</span> <span className="font-medium">{selectedCategory}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Title:</span> <span className="font-medium">{listingForm.title}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Quantity:</span> <span className="font-medium">{listingForm.quantity} kg</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Price:</span> <span className="font-medium text-primary">${listingForm.price}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Location:</span> <span className="font-medium">{listingForm.location}</span></div>
                  {listingForm.description && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-muted-foreground">Description:</span>
                      <p className="mt-1">{listingForm.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setListingStep(3)}>Back</Button>
                  <Button className="flex-1" onClick={submitListing}>Publish Listing</Button>
                </div>
              </div>
            )}
            
            {/* Step 5: Success */}
            {listingStep === 5 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-bold mb-2">Published Successfully!</h2>
                <p className="text-sm text-muted-foreground mb-4">Your listing is now live on the marketplace</p>
                <Button
                  className="w-full"
                  onClick={() => {
                    setAddListingModalOpen(false)
                    setListingStep(1)
                    setListingForm({ title: '', quantity: '', price: '', location: '', description: '', lat: 25.2048, lng: 55.2708 })
                    setSelectedCategory('')
                    setFormError('')
                    navigateTo('marketplace')
                  }}
                >
                  View in Marketplace
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
