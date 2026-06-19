# ♻️ RecyConnect - Recycling Marketplace Platform

A full-stack recycling materials marketplace built with Next.js 16, TypeScript, and Tailwind CSS.

## ✨ Features

- **🏪 Marketplace** - Browse and list recycling materials
- **🗺️ Interactive Map** - Find materials near you with Leaflet maps
- **💬 Real-time Chat** - Connect buyers and sellers
- **🤖 AI Chatbot** - Powered by AI for recycling assistance
- **📊 Analytics** - Market trends and pricing data
- **🌐 Bilingual** - Full Arabic/English translation with one click
- **📱 Responsive** - Works on mobile, tablet, and desktop
- **🌙 Dark/Light Mode** - Theme switching
- **🔔 Notifications** - Real-time alerts system
- **🔐 Authentication** - Register, login, and profile management

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: React Leaflet
- **AI**: z-ai-web-dev-sdk (LLM chatbot + translation)

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
npx prisma db push
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🌐 Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload this zip file or connect your GitHub repo
4. Vercel will auto-detect Next.js and deploy

### Environment Variables

Set these in your Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |

> **Note**: SQLite is included for demo purposes. For production, consider upgrading to PostgreSQL via [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Supabase](https://supabase.com).

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── auth/         # Authentication (login, register, logout)
│   │   ├── chatbot/      # AI chatbot endpoint
│   │   ├── chats/        # Chat management
│   │   ├── listings/     # Marketplace listings CRUD
│   │   ├── messages/     # Chat messages
│   │   ├── notifications/# User notifications
│   │   ├── seed/         # Database seeding
│   │   └── translate/    # AI translation endpoint
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application (SPA)
├── components/
│   ├── map/              # Map components
│   └── ui/               # shadcn/ui components
├── hooks/
│   ├── useTranslation.ts # Translation hook (200+ strings)
│   ├── use-mobile.ts     # Mobile detection
│   └── use-toast.ts      # Toast notifications
└── lib/
    ├── db.ts             # Prisma client
    ├── store.ts          # Zustand store
    └── utils.ts          # Utility functions
```

## 🌍 Translation System

The app includes a comprehensive Arabic/English translation system:

- **200+ translated strings** covering all UI text
- **One-click toggle** via floating button
- **AI-powered translation** for dynamic content
- **Automatic RTL support** when Arabic is selected
- **Translation caching** for performance

## 📝 License

MIT License
