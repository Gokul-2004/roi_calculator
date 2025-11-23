import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for IP (handles proxies, load balancers, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback - IP not available in NextRequest
  return 'unknown';
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`\n📥 [${requestId}] POST /api/track-calculation - Request received`);
  
  if (!supabase) {
    console.warn(`⚠️  [${requestId}] Supabase client not available. Tracking disabled.`);
    return NextResponse.json({
      success: true,
      trackingDisabled: true,
      message: 'Supabase env vars missing. Tracking skipped.',
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log(`🔗 [${requestId}] Connecting to Supabase: ${supabaseUrl ? supabaseUrl.substring(0, 40) + '...' : 'MISSING'}`);

  try {
    console.log(`📦 [${requestId}] Parsing request body...`);
    const body = await request.json();
    const { inputParams, results } = body;
    
    if (!inputParams || !results) {
      console.error(`❌ [${requestId}] Missing required fields: inputParams=${!!inputParams}, results=${!!results}`);
      return NextResponse.json(
        { error: 'Invalid request: missing inputParams or results' },
        { status: 400 }
      );
    }
    
    console.log(`📊 [${requestId}] Extracting metrics...`);
    // Get IP address and user agent
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;
    
    // Extract key metrics from results for easier querying
    const annualSavings = results?.annualCosts?.annual_savings || null;
    const year1ROI = results?.roiMetrics?.year1_roi_percent || null;
    const totalPaperCost = results?.annualCosts?.total_paper_cost || null;
    const totalEsigCost = results?.annualCosts?.total_esig_cost || null;
    
    console.log(`💾 [${requestId}] Preparing data for insertion:`);
    console.log(`   - IP: ${ipAddress}`);
    console.log(`   - Documents/year: ${inputParams?.documents_per_year || 'N/A'}`);
    console.log(`   - Annual Savings: ${annualSavings ? `₹${(annualSavings / 10000000).toFixed(2)} Cr` : 'N/A'}`);
    console.log(`   - Year 1 ROI: ${year1ROI ? `${year1ROI.toFixed(1)}%` : 'N/A'}`);
    
    const insertData = {
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
      input_parameters: inputParams,
      calculated_results: results,
      // Store key metrics separately for easier analytics
      documents_per_year: inputParams?.documents_per_year || null,
      pages_per_document: inputParams?.pages_per_document || null,
      annual_savings: annualSavings,
      year1_roi_percent: year1ROI,
      total_paper_cost: totalPaperCost,
      total_esig_cost: totalEsigCost,
      calculated_at: new Date().toISOString(),
    };
    
    console.log(`🚀 [${requestId}] Inserting into Supabase table 'calculation_tracking'...`);
    const { data, error } = await supabase
      .from('calculation_tracking')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [${requestId}] Supabase insert failed after ${duration}ms:`);
      console.error(`   Error Code: ${error.code || 'N/A'}`);
      console.error(`   Error Message: ${error.message}`);
      console.error(`   Error Hint: ${error.hint || 'N/A'}`);
      console.error(`   Error Details:`, JSON.stringify(error, null, 2));
      
      return NextResponse.json(
        { 
          error: 'Failed to save calculation', 
          details: error.message,
          code: error.code,
          hint: error.hint,
          requestId
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Successfully saved calculation in ${duration}ms`);
    console.log(`   Record ID: ${data.id}`);
    const calculatedDate = new Date(data.calculated_at);
    const localTime = calculatedDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`   Calculated at (UTC): ${data.calculated_at}`);
    console.log(`   Calculated at (IST): ${localTime}\n`);

    return NextResponse.json({ success: true, id: data.id, requestId });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ [${requestId}] Exception after ${duration}ms:`);
    console.error(`   Error Type: ${error.constructor.name}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Error Stack:`, error.stack);
    console.error(`   Supabase URL: ${supabaseUrl || 'MISSING'}\n`);
    
    // Check if it's a fetch/network error
    if (error.message?.includes('fetch failed') || error.cause || error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
      return NextResponse.json(
        { 
          error: 'Network error connecting to Supabase', 
          details: error.message,
          hint: 'Check your NEXT_PUBLIC_SUPABASE_URL in .env.local. Make sure it starts with https:// and ends with .supabase.co (no trailing slash or extra paths). Also verify network connectivity.',
          supabaseUrlFormat: supabaseUrl ? `${supabaseUrl.substring(0, 40)}...` : 'MISSING',
          requestId
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        requestId
      },
      { status: 500 }
    );
  }
}

