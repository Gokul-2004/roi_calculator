# Certinal ROI Calculator - Project Documentation

## Overview

The **Certinal ROI Calculator** is a comprehensive web application designed for Indian healthcare organizations to evaluate the Return on Investment (ROI) when transitioning from paper-based document signing to e-signature solutions. The calculator provides detailed cost comparisons, financial projections, and compliance benefits analysis.

**Live Demo:** Deployed on Vercel (auto-deployment from GitHub)
**Repository:** https://github.com/Gokul-2004/roi_calculator

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Key Components](#key-components)
5. [Calculation Logic](#calculation-logic)
6. [PDF Export Feature](#pdf-export-feature)
7. [Installation & Setup](#installation--setup)
8. [Deployment](#deployment)
9. [Recent Enhancements](#recent-enhancements)
10. [Future Roadmap](#future-roadmap)

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Interactive ROI Calculator** | Real-time calculation as users modify input parameters |
| **Cost Breakdown Analysis** | Detailed comparison of paper-based vs e-signature costs |
| **ROI Metrics Dashboard** | Year 1, 3, and 5 ROI projections with breakeven analysis |
| **Non-Financial Benefits** | 11 qualitative benefits including compliance, efficiency, and patient experience |
| **PDF Export** | Professional multi-page PDF report generation |
| **Editable Cost Assumptions** | Users can modify industry benchmark values |
| **DPDP Act Compliance Banner** | Scrolling disclaimer about compliance penalties |

### Financial Metrics Calculated

- **Annual Cost Breakdown:**
  - Paper & Printing Costs
  - Physical Storage & Filing
  - Staff Time (Processing & Signing)
  - Document Loss/Recreation
  - Compliance & Audit Costs
  - Software Subscription (E-Signature)
  - Implementation Cost (amortized over 5 years)

- **ROI Metrics:**
  - Breakeven Period (months)
  - Year 1 ROI Percentage
  - Year 5 ROI Percentage
  - 3-Year Net Savings
  - 5-Year Net Savings

### Non-Financial Benefits

1. Instant Document Signing
2. Pages Saved Annually
3. Compliance & Audit Trail (NABH, ABDM)
4. Reduced Staff Burden
5. Error Reduction
6. Patient Experience Enhancement
7. EMR Seamless Integration
8. Reduced Hospital Congestion
9. Indian Evidence Act Compliance (Section 3A)
10. IT Act 2000 Compliance (Section 5)
11. DPDP Compliance Ready

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | Next.js 16.x | React-based framework with SSR/SSG |
| **Language** | TypeScript | Type-safe JavaScript |
| **Styling** | Tailwind CSS 4.x | Utility-first CSS framework |
| **Icons** | Lucide React | Modern icon library |
| **PDF Generation** | jsPDF | Client-side PDF creation |
| **Database** | Supabase (PostgreSQL) | Optional - for saving calculations |
| **Deployment** | Vercel | Continuous deployment from GitHub |

---

## Project Architecture

```
roi_calculator/
├── web-app/                          # Next.js Application
│   ├── app/
│   │   ├── page.tsx                  # Main calculator component (~1800 lines)
│   │   ├── layout.tsx                # Root layout with metadata
│   │   ├── globals.css               # Tailwind imports & global styles
│   │   └── api/
│   │       └── track-calculation/    # API route for usage tracking
│   │           └── route.ts
│   ├── lib/
│   │   ├── calculations.ts           # Core ROI calculation logic
│   │   ├── supabase.ts               # Supabase client initialization
│   │   └── supabase-helpers.ts       # Database helper functions
│   ├── public/
│   │   └── certinal_logo.png         # Certinal branding
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.ts                # Next.js configuration
│   └── tailwind.config.js            # Tailwind configuration
├── database_schema.sql               # Full database schema
├── database_schema_mvp.sql           # MVP database schema
├── DEPLOYMENT.md                     # Deployment instructions
├── README.md                         # Project overview
└── PROJECT_DOCUMENTATION.md          # This file
```

---

## Key Components

### 1. Main Page Component (`page.tsx`)

The main application is a single-page calculator with the following structure:

```
┌─────────────────────────────────────────────────────────────┐
│                        Header                               │
│   [Certinal Logo] ROI Calculator           [Reset Button]   │
├─────────────────────────────────────────────────────────────┤
│              DPDP Act Disclaimer Banner (Scrolling)         │
├──────────────┬──────────────────────────────────────────────┤
│   Input      │                                              │
│   Parameters │          Results Section                     │
│   (Fixed     │                                              │
│   Sidebar)   │  ┌─────────────────────────────────────────┐ │
│              │  │     Annual Cost Breakdown                │ │
│  - Documents │  │  [Paper-Based] vs [E-Signature]         │ │
│  - Pages     │  │  [Annual Savings] [Breakeven]           │ │
│  - Signers   │  │  [Year 1 ROI] [Year 5 ROI]              │ │
│  - Annual    │  │  [3-Year Savings] [5-Year Savings]      │ │
│    Cost      │  └─────────────────────────────────────────┘ │
│  - Impl.     │                                              │
│    Cost      │  ┌─────────────────────────────────────────┐ │
│              │  │     ROI Summary & Payback Analysis       │ │
│  [Calculate] │  └─────────────────────────────────────────┘ │
│              │                                              │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │     Annual Benefits (Non-Financial)     │ │
│              │  └─────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
│                    Bottom Action Bar                        │
│  [View Details] [View Cost Assumptions] [Export PDF]        │
└─────────────────────────────────────────────────────────────┘
```

### 2. Modals

- **Cost Breakdown Modal**: Detailed table with all cost components
- **Cost Assumptions Modal**: Editable table with industry benchmarks

### 3. Helper Components

| Component | Purpose |
|-----------|---------|
| `InputField` | Reusable input with slider and text input |
| `CostItem` | Table row for cost breakdown (supports bold for totals) |
| `CostBreakdownSection` | Annual costs with cards and export functionality |
| `ROIMetricsSection` | ROI summary with savings projections |
| `BenefitsSection` | Non-financial benefits checklist |

---

## Calculation Logic

### Input Parameters

```typescript
interface InputParams {
  documents_per_year: number;      // Annual document volume
  pages_per_document: number;      // Average pages per doc
  signatories_per_document: number; // Signers per document
  esig_annual_cost: number;        // E-signature subscription
  implementation_cost: number;     // One-time setup cost
}
```

### Cost Assumptions (Editable)

```typescript
const COST_ASSUMPTIONS = {
  paper_cost_per_page: 0.10,       // ₹ per page
  storage_cost_per_doc: 2.00,      // ₹ per document/year
  paper_time_per_doc: 15,          // minutes (paper-based)
  staff_hourly_cost: 120,          // ₹ per hour
  document_loss_rate: 2,           // percentage
  paper_compliance_cost: 100000,   // ₹ per year
  esig_time_per_doc: 2,            // minutes (e-signature)
  esig_compliance_cost: 20000,     // ₹ per year
};
```

### Key Formulas

1. **Paper & Printing Cost:**
   ```
   documents_per_year × pages_per_document × paper_cost_per_page
   ```

2. **Staff Time Cost:**
   ```
   documents_per_year × (time_per_doc / 60) × staff_hourly_cost
   ```

3. **Breakeven Period (months):**
   ```
   (esig_annual_cost + implementation_cost/5) / (annual_savings/12)
   ```

4. **Year N ROI:**
   ```
   (N × annual_savings) / (implementation_cost + esig_annual_cost) × 100
   ```

---

## PDF Export Feature

### PDF Structure (3 Pages)

**Page 1: Summary**
- Certinal header with logo
- Input Parameters summary
- Annual Cost Breakdown cards (8 metrics)

**Page 2: Detailed Breakdown**
- Detailed Cost Breakdown table
  - Cost Component | Paper-Based | E-Signature | Annual Savings
  - 7 line items + Total row (bold, larger font)
- Cost Assumptions table
  - 8 editable assumptions with values and units

**Page 3: Non-Financial Benefits**
- Annual Benefits (Non-Financial) section
- 11 benefits with checkmark bullets
- Bold titles with descriptions

### PDF Styling

| Element | Font Size | Weight |
|---------|-----------|--------|
| Section Headers | 12pt | Bold |
| Table Headers | 11pt | Bold |
| Card Titles | 10.5pt | Bold |
| Total Row | 10.5pt | Bold |
| Regular Text | 9pt | Normal |
| Descriptions | 8.5pt | Normal |

### Color Scheme

- Primary Green: `#32BF84`
- Dark Green: `#28A06A`
- Slate Text: `#0f172a`
- Muted Text: `#475569`
- Card Background: `#f1f5f9`

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Supabase account for data persistence

### Local Development

```bash
# Navigate to web app
cd web-app

# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
http://localhost:3000
```

### Environment Variables (Optional)

Create `.env.local` in `web-app/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Deployment

### Vercel (Recommended)

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Vercel automatically:
   - Detects the push via webhook
   - Builds the Next.js application
   - Deploys to production

3. Changes go live within 1-2 minutes

### Deployment Configuration

- **Framework:** Next.js (auto-detected)
- **Root Directory:** `web-app`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

---

## Recent Enhancements

### PDF Export Improvements (Latest)

- ✅ Bold headers at all levels (section, table, card)
- ✅ Larger font sizes for better readability
- ✅ Total row highlighted with larger bold text
- ✅ Proper column spacing (no text cutoff)
- ✅ Annual Benefits section on dedicated page 3
- ✅ Clean two-line layout for benefits
- ✅ Green checkmark bullets

### UI Improvements

- ✅ Bold table headers in cost breakdown modal
- ✅ Bold table headers in assumptions modal
- ✅ Bold total row in cost breakdown

---

## Future Roadmap

| Feature | Status | Priority |
|---------|--------|----------|
| PDF/Excel Export | ✅ Completed | - |
| Editable Cost Assumptions | ✅ Completed | - |
| Comparison View | Planned | High |
| Advanced Analytics Dashboard | Planned | Medium |
| Multi-organization Support | Planned | Medium |
| User Authentication | Planned | Low |
| Mobile App | Planned | Low |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is provided as-is for demonstration purposes.

---

## Support

For issues or questions:
- Open an issue in the GitHub repository
- Contact: [Repository Issues](https://github.com/Gokul-2004/roi_calculator/issues)

---

**Built with care for Indian Healthcare Sector**
*Certinal E-Signature Solutions*
