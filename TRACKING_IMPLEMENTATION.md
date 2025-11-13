# Calculation Tracking Implementation

## Overview
The ROI Calculator now automatically tracks all calculations with IP addresses and input parameters in Supabase, without requiring users to manually save.

## Changes Made

### 1. **Removed Manual Save Functionality**
- ✅ Removed "Saved" button from header
- ✅ Removed saved calculations dropdown
- ✅ Removed "Save Calculation" section from results
- ✅ Removed all save/load/delete functionality from UI

### 2. **Automatic Tracking**
- ✅ Calculations are automatically tracked when user clicks "Calculate ROI"
- ✅ IP address is captured server-side (more reliable)
- ✅ User agent, referrer, and timestamp are also stored

### 3. **Database Schema**
Created new table: `calculation_tracking`

**Fields:**
- `id` - UUID primary key
- `ip_address` - VARCHAR(45) - Client IP address
- `user_agent` - TEXT - Browser/user agent info
- `referrer` - TEXT - Referring page URL
- `input_parameters` - JSONB - All input parameters
- `calculated_results` - JSONB - Complete calculation results
- `documents_per_year` - BIGINT - For easy querying
- `pages_per_document` - NUMERIC
- `annual_savings` - NUMERIC
- `year1_roi_percent` - NUMERIC
- `total_paper_cost` - NUMERIC
- `total_esig_cost` - NUMERIC
- `calculated_at` - TIMESTAMP
- `created_at` - TIMESTAMP

**Indexes:**
- IP address
- Calculated timestamp
- Documents per year
- Annual savings

### 4. **API Route**
Created: `/app/api/track-calculation/route.ts`

**Features:**
- Extracts IP from multiple headers (handles proxies, load balancers, Cloudflare)
- Stores complete calculation data
- Returns success/error status
- Fails silently (doesn't break user experience)

### 5. **Implementation Details**

**IP Detection Priority:**
1. `x-forwarded-for` (most common with proxies)
2. `x-real-ip`
3. `cf-connecting-ip` (Cloudflare)
4. `request.ip` (fallback)

**Tracking Trigger:**
- Automatically called when `handleCalculate()` is executed
- Runs asynchronously (doesn't block calculation display)
- Errors are logged but don't affect user experience

## Database Setup

Run the SQL migration file to create the table:

```bash
# In Supabase SQL Editor, run:
database_schema_tracking.sql
```

Or manually create the table using the SQL in `database_schema_tracking.sql`

## Privacy Considerations

⚠️ **Important:** 
- IP addresses are personal data under DPDP Act
- Consider adding a privacy notice/banner
- May need to implement data retention policies
- Consider IP anonymization if required by regulations

## Analytics Queries

Example queries you can run in Supabase:

```sql
-- Total calculations
SELECT COUNT(*) FROM calculation_tracking;

-- Unique IPs
SELECT COUNT(DISTINCT ip_address) FROM calculation_tracking;

-- Average annual savings
SELECT AVG(annual_savings) FROM calculation_tracking;

-- Calculations by date
SELECT DATE(calculated_at), COUNT(*) 
FROM calculation_tracking 
GROUP BY DATE(calculated_at) 
ORDER BY DATE(calculated_at) DESC;

-- Top input ranges
SELECT 
  CASE 
    WHEN documents_per_year < 1000000 THEN '< 1M'
    WHEN documents_per_year < 5000000 THEN '1M-5M'
    ELSE '5M+'
  END as doc_range,
  COUNT(*) as count
FROM calculation_tracking
GROUP BY doc_range;
```

## Next Steps (Optional)

1. **Add Privacy Notice** - Inform users about data collection
2. **IP Anonymization** - Hash or truncate IPs if needed
3. **Analytics Dashboard** - Create views for common queries
4. **Data Retention** - Auto-delete old records after X days
5. **Geographic Data** - Add country/city detection from IP

