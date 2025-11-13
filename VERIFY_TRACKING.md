# How to Verify Tracking is Working

## Step 1: Check if Table Exists in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Table Editor**
3. Look for a table named `calculation_tracking`
4. If it doesn't exist, you need to run the SQL migration:
   - Go to **SQL Editor**
   - Copy and paste the SQL from `database_schema_tracking.sql`
   - Click **Run**

## Step 2: Test the Calculator

1. Open your website in a browser
2. Open **Developer Tools** (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Enter some values in the calculator
5. Click **"Calculate ROI"**
6. Look for one of these messages in the console:
   - ✅ `Calculation tracked successfully: [UUID]` - **SUCCESS!**
   - ❌ `Failed to track calculation: [error]` - **Check error message**

## Step 3: Verify Data in Supabase

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on `calculation_tracking` table
3. You should see new rows appearing after each calculation
4. Check the columns:
   - `ip_address` - Should show your IP
   - `input_parameters` - Should show the inputs you entered
   - `calculated_results` - Should show the full results
   - `calculated_at` - Should show the timestamp

## Step 4: Check Network Tab (Optional)

1. Open **Developer Tools** → **Network** tab
2. Filter by "track-calculation"
3. Click **"Calculate ROI"**
4. You should see a POST request to `/api/track-calculation`
5. Click on it and check:
   - **Status**: Should be `200 OK` (success)
   - **Response**: Should show `{"success": true, "id": "..."}`

## Common Issues

### ❌ "relation 'calculation_tracking' does not exist"
**Solution**: The table hasn't been created. Run the SQL migration in Supabase SQL Editor.

### ❌ "permission denied for table calculation_tracking"
**Solution**: Check Supabase RLS (Row Level Security) policies. You may need to allow inserts:
```sql
ALTER TABLE calculation_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON calculation_tracking
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

### ❌ "Failed to track calculation" in console
**Solution**: 
- Check Supabase connection (API keys, URL)
- Check browser console for detailed error
- Check Supabase logs in Dashboard → Logs

### ✅ No errors but no data in table
**Solution**: 
- Check if RLS is blocking inserts
- Verify Supabase credentials in `.env.local`
- Check Network tab to see if API call is actually being made

## Quick Test Query

Run this in Supabase SQL Editor to see all tracked calculations:

```sql
SELECT 
  id,
  ip_address,
  documents_per_year,
  annual_savings,
  year1_roi_percent,
  calculated_at
FROM calculation_tracking
ORDER BY calculated_at DESC
LIMIT 10;
```

## Expected Behavior

✅ **Working correctly when:**
- Console shows "Calculation tracked successfully"
- New rows appear in `calculation_tracking` table
- IP address is captured (not "unknown")
- All input parameters and results are stored

❌ **Not working when:**
- Console shows errors
- No rows in table after calculations
- IP address shows as "unknown" (might be normal in development)

