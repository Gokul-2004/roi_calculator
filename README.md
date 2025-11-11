# 🏥 Healthcare ROI Calculator

**ROI Calculator: Paper-Based vs E-Signature Solution for Indian Healthcare Sector**

A modern, interactive web application built with Next.js to calculate and compare the ROI of paper-based vs e-signature solutions for patient document management in Indian healthcare facilities.

## ✨ Features

- 📊 **Interactive ROI Calculator**: Input your organization's parameters and get instant ROI calculations
- 💾 **Save & Load Calculations**: Save multiple calculation scenarios and compare them
- 📈 **Comprehensive Analysis**: 
  - Annual cost breakdown (Paper vs E-Signature)
  - ROI metrics and payback period 
  - Non-financial benefits analysis
- 🎯 **Indian Healthcare Focused**: Tailored for Indian healthcare sector with relevant compliance (NABH, ABDM, DPDP, IT Act 2000)
- 🎨 **Modern UI**: Professional, responsive design with Tailwind CSS
- ⚡ **Real-time Updates**: Auto-calculates as you adjust parameters

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

1. **Navigate to the web app directory**
   ```bash
   cd web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the SQL from `database_schema.sql` or `database_schema_mvp.sql`
   - Get your project URL and anon key from Settings > API

4. **Configure environment variables**
   - Create `.env.local` in the `web-app` directory:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will open in your browser at `http://localhost:3000`

## 📦 Deployment

### Deploy to Vercel (Recommended - Free)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Your app is live!** 🎉

### Other Deployment Options

- **Netlify**: Similar process to Vercel
- **Self-hosted**: Build with `npm run build` and deploy the output

## 🗄️ Database Setup

1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project

2. **Run SQL Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the entire content of `database_schema_mvp.sql`
   - Click "Run"

3. **Get API Credentials**
   - Go to Settings > API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 How to Use

1. **Enter Inputs**: Modify the user input parameters on the left sidebar:
   - Documents per Year
   - Average Pages per Document
   - Number of Signatories per Document
   - Number of Staff Handling Documents
   - E-Signature Solution Annual Cost
   - Implementation Cost (One-time)
   - Implementation Timeline (Months)

2. **Calculate**: Results update automatically as you change inputs, or click "Calculate ROI"

3. **Review Results**: 
   - Annual Cost Breakdown with detailed comparison
   - ROI Summary & Payback Analysis
   - Non-Financial Benefits (11 key benefits)

4. **Save**: Give your calculation a name and save it for later reference

5. **Load Saved**: Access saved calculations from the "Saved" dropdown in the header

## 🔧 Project Structure

```
Certinal/
├── web-app/                 # Next.js application
│   ├── app/                # Next.js app directory
│   │   ├── page.tsx        # Main page component
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── lib/                # Utility functions
│   │   ├── calculations.ts # ROI calculation logic
│   │   ├── supabase.ts     # Supabase client
│   │   └── supabase-helpers.ts # Database operations
│   ├── package.json        # Dependencies
│   └── .env.local         # Environment variables (not in git)
├── database_schema.sql     # Full database schema
├── database_schema_mvp.sql # MVP database schema
└── README.md              # This file
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend/Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended) or any Node.js hosting

## 📝 Cost Assumptions

The calculator uses industry benchmarks for Indian healthcare:
- Paper Cost: ₹0.10 per page
- Storage: ₹2 per document per year
- Staff Time: 15 min (paper) vs 5 min (e-signature)
- Staff Hourly Cost: ₹200
- Document Loss Rate: 2%
- Compliance Costs: ₹100,000 (paper) vs ₹20,000 (e-signature)

These values are defined in `web-app/lib/calculations.ts` and can be modified if needed.

## 🎨 UI Features

- **Fixed Input Sidebar**: Input parameters stay visible on the left while scrolling results
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Professional Color Scheme**: Slate/gray palette with red/green for financial indicators
- **Card-based Notifications**: Success and confirmation messages appear as cards (no browser alerts)
- **Auto-calculation**: Results update automatically as you adjust inputs

## 🔐 Security Notes

- Uses Supabase Row Level Security (RLS) for data protection
- Environment variables are kept secure (never commit `.env.local`)
- All API calls go through Supabase's secure API

## 🚧 Future Enhancements

- [ ] Export calculations to PDF/Excel
- [ ] Comparison view for multiple saved calculations
- [ ] Advanced analytics dashboard
- [ ] Multi-organization support
- [ ] Custom cost assumptions per organization
- [ ] User authentication (optional)

## 📄 License

This project is provided as-is for demonstration purposes.

## 🤝 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for Indian Healthcare Sector**
