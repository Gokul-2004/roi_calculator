# 🏥 Healthcare ROI Calculator - Modern Web App

A beautiful, modern Next.js application for calculating ROI of Paper-Based vs E-Signature solutions.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd web-app
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the `web-app` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ishfypmhxwoiwxaelysc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaGZ5cG1oeHdvaXd4YWVseXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODE3ODIsImV4cCI6MjA3ODQ1Nzc4Mn0.jzfdSZr2qDrC5jFO6SNXaYZ6PCX9YqbM40aXFpPR6HU
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

- 🎨 **Modern, Beautiful UI** - Built with Tailwind CSS
- 📱 **Fully Responsive** - Works on all devices
- 💾 **Save & Load Calculations** - Integrated with Supabase
- 📊 **Real-time Calculations** - Instant ROI results
- 🎯 **Professional Design** - Clean, modern interface

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database & backend
- **Lucide React** - Icons

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Deploy

### Deploy to Vercel (Recommended - Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Deploy to Other Platforms

- **Netlify** - Free tier available
- **Railway** - Free tier available
- **Render** - Free tier available

## 📝 Project Structure

```
web-app/
├── app/
│   ├── page.tsx          # Main page
│   ├── layout.tsx         # Layout wrapper
│   └── globals.css        # Global styles
├── lib/
│   ├── calculations.ts   # Calculation logic
│   ├── supabase.ts       # Supabase client
│   └── supabase-helpers.ts # Database helpers
└── package.json
```

## 🎨 Customization

The app uses Tailwind CSS for styling. You can customize colors, spacing, and more in the components.

---

**Built with ❤️ for Indian Healthcare Sector**
