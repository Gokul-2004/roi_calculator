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
  
  // Fallback to connection remote address (if available)
  return request.ip || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputParams, results } = body;
    
    // Get IP address and user agent
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;
    
    // Extract key metrics from results for easier querying
    const annualSavings = results?.annualCosts?.annual_savings || null;
    const year1ROI = results?.roiMetrics?.year1_roi_percent || null;
    const totalPaperCost = results?.annualCosts?.total_paper_cost || null;
    const totalEsigCost = results?.annualCosts?.total_esig_cost || null;
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('calculation_tracking')
      .insert({
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
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving calculation tracking:', error);
      return NextResponse.json(
        { error: 'Failed to save calculation', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    console.error('Error in track-calculation API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

