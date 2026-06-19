import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  avatar?: string
}

export interface Listing {
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

export interface Chat {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  lastMessage?: string
  updatedAt: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  timestamp: string
}

export interface Notification {
  id: string
  title: string
  read: boolean
  timestamp: string
}

type Page = 'landing' | 'dashboard' | 'marketplace' | 'map' | 'chat' | 'analytics' | 'settings' | 'profile' | 'login' | 'register' | 'listing'

interface AppState {
  // Theme
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // Language
  lang: 'en' | 'ar'
  setLang: (lang: 'en' | 'ar') => void
  toggleLang: () => void
  
  // Auth
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  logout: () => void
  
  // Navigation
  currentPage: Page
  setCurrentPage: (page: Page) => void
  
  // Listings
  selectedListing: Listing | null
  setSelectedListing: (listing: Listing | null) => void
  
  // Chat
  currentChat: Chat | null
  setCurrentChat: (chat: Chat | null) => void
  
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Modal
  addListingModalOpen: boolean
  setAddListingModalOpen: (open: boolean) => void
  
  // Chatbot
  chatbotOpen: boolean
  setChatbotOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      // Language
      lang: 'en',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((state) => ({ lang: state.lang === 'en' ? 'ar' : 'en' })),
      
      // Auth
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null, currentPage: 'landing' }),
      
      // Navigation
      currentPage: 'landing',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Listings
      selectedListing: null,
      setSelectedListing: (listing) => set({ selectedListing: listing }),
      
      // Chat
      currentChat: null,
      setCurrentChat: (chat) => set({ currentChat: chat }),
      
      // Sidebar
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Modal
      addListingModalOpen: false,
      setAddListingModalOpen: (open) => set({ addListingModalOpen: open }),
      
      // Chatbot
      chatbotOpen: false,
      setChatbotOpen: (open) => set({ chatbotOpen: open }),
    }),
    {
      name: 'recyconnect-storage',
      partialize: (state) => ({
        theme: state.theme,
        lang: state.lang,
        currentUser: state.currentUser,
      }),
    }
  )
)
