import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Network diagnostics helper
async function checkNetworkConnectivity(supabaseUrl: string): Promise<{
  dnsResolvable: boolean;
  reachable: boolean;
  error?: string;
  errorType?: string;
}> {
  const diagnostics = {
    dnsResolvable: false,
    reachable: false,
    error: undefined as string | undefined,
    errorType: undefined as string | undefined,
  };

  try {
    // Extract hostname from URL
    const urlObj = new URL(supabaseUrl);
    const hostname = urlObj.hostname;
    
    // Try a simple HEAD request to check connectivity
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`https://${hostname}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
      
      diagnostics.dnsResolvable = true;
      diagnostics.reachable = response.status < 500;
    } catch (error: any) {
      diagnostics.dnsResolvable = false;
      diagnostics.error = error.message;
      
      // Categorize error types
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('enotfound') || errorMsg.includes('getaddrinfo') || errorMsg.includes('dns')) {
        diagnostics.error = 'DNS resolution failed - cannot resolve hostname';
        diagnostics.errorType = 'DNS_ERROR';
      } else if (errorMsg.includes('econnrefused') || errorMsg.includes('connection refused')) {
        diagnostics.error = 'Connection refused - firewall or service blocking';
        diagnostics.errorType = 'CONNECTION_REFUSED';
      } else if (errorMsg.includes('etimedout') || errorMsg.includes('timeout') || error.name === 'AbortError') {
        diagnostics.error = 'Connection timeout - network slow or blocked';
        diagnostics.errorType = 'TIMEOUT';
      } else if (errorMsg.includes('cert') || errorMsg.includes('ssl') || errorMsg.includes('tls')) {
        diagnostics.error = 'SSL/TLS certificate error - possible proxy/VPN interference';
        diagnostics.errorType = 'SSL_ERROR';
      } else if (errorMsg.includes('econnreset') || errorMsg.includes('connection reset')) {
        diagnostics.error = 'Connection reset - network interruption or firewall';
        diagnostics.errorType = 'CONNECTION_RESET';
      } else {
        diagnostics.errorType = 'UNKNOWN_NETWORK_ERROR';
      }
    }
  } catch (error: any) {
    diagnostics.error = error.message;
    diagnostics.errorType = 'UNEXPECTED_ERROR';
  }

  return diagnostics;
}

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
  
  // Detect proxy/VPN from headers
  const proxyHeaders = {
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'x-real-ip': request.headers.get('x-real-ip'),
    'via': request.headers.get('via'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'cf-connecting-ip': request.headers.get('cf-connecting-ip'), // Cloudflare
  };
  
  const hasProxyHeaders = Object.values(proxyHeaders).some(val => val !== null);
  if (hasProxyHeaders) {
    console.log(`🔍 [${requestId}] Proxy/VPN detected from headers:`, Object.entries(proxyHeaders).filter(([_, v]) => v).map(([k]) => k).join(', '));
  }
  
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

  // Network diagnostics
  if (supabaseUrl) {
    console.log(`🌐 [${requestId}] Running network diagnostics...`);
    try {
      const diagnostics = await checkNetworkConnectivity(supabaseUrl);
      console.log(`   DNS Resolvable: ${diagnostics.dnsResolvable ? '✅ Yes' : '❌ No'}`);
      console.log(`   Reachable: ${diagnostics.reachable ? '✅ Yes' : '❌ No'}`);
      if (diagnostics.error) {
        console.warn(`   ⚠️  Network Issue Detected: ${diagnostics.error}`);
        console.warn(`   Error Type: ${diagnostics.errorType || 'Unknown'}`);
        
        // Specific hints based on error type
        switch (diagnostics.errorType) {
          case 'DNS_ERROR':
            console.warn(`   💡 Hint: DNS resolution failed - check internet connection, DNS settings, or VPN interference`);
            break;
          case 'TIMEOUT':
            console.warn(`   💡 Hint: Connection timeout - check VPN, firewall, network speed, or proxy settings`);
            break;
          case 'SSL_ERROR':
            console.warn(`   💡 Hint: SSL/TLS error - VPN or corporate proxy may be intercepting HTTPS. Try disabling VPN.`);
            break;
          case 'CONNECTION_REFUSED':
            console.warn(`   💡 Hint: Connection refused - firewall or network policy may be blocking Supabase domain`);
            break;
          case 'CONNECTION_RESET':
            console.warn(`   💡 Hint: Connection reset - network interruption, firewall, or VPN may be interfering`);
            break;
          default:
            console.warn(`   💡 Hint: Network connectivity issue detected - check VPN, firewall, or proxy settings`);
        }
      } else {
        console.log(`   ✅ Network connectivity check passed`);
      }
    } catch (diagError: any) {
      console.warn(`   ⚠️  Could not run diagnostics: ${diagError.message}`);
    }
  }

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
    
    // Set a timeout for the Supabase operation
    const insertStartTime = Date.now();
    const insertPromise = supabase
      .from('calculation_tracking')
      .insert(insertData)
      .select()
      .single();
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Supabase insert timeout after 30 seconds')), 30000);
    });
    
    const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;
    const insertDuration = Date.now() - insertStartTime;
    console.log(`   Insert operation took: ${insertDuration}ms`);

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
    
    // Detailed network error detection
    const errorMessage = error.message?.toLowerCase() || '';
    const isNetworkError = 
      errorMessage.includes('fetch failed') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('enotfound') ||
      errorMessage.includes('etimedout') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network') ||
      error.cause ||
      error.name === 'TypeError';
    
    if (isNetworkError) {
      let networkHint = 'Check your NEXT_PUBLIC_SUPABASE_URL in .env.local and verify network connectivity.';
      
      if (errorMessage.includes('enotfound') || errorMessage.includes('dns')) {
        networkHint = 'DNS resolution failed - check internet connection, DNS settings, or VPN interference.';
      } else if (errorMessage.includes('econnrefused')) {
        networkHint = 'Connection refused - firewall, VPN, or proxy may be blocking Supabase.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('etimedout')) {
        networkHint = 'Connection timeout - network slow, VPN interference, or firewall blocking.';
      } else if (errorMessage.includes('cert') || errorMessage.includes('ssl') || errorMessage.includes('tls')) {
        networkHint = 'SSL/TLS error - VPN or proxy may be intercepting HTTPS connections. Try disabling VPN.';
      }
      
      console.error(`   🔍 Network Error Analysis:`);
      console.error(`      Error Type: ${error.name || 'Unknown'}`);
      console.error(`      Error Message: ${error.message}`);
      if (error.cause) {
        console.error(`      Error Cause:`, error.cause);
      }
      console.error(`      💡 Suggested Fix: ${networkHint}`);
      
      return NextResponse.json(
        { 
          error: 'Network error connecting to Supabase', 
          details: error.message,
          hint: networkHint,
          errorType: error.name || 'NetworkError',
          supabaseUrlFormat: supabaseUrl ? `${supabaseUrl.substring(0, 40)}...` : 'MISSING',
          requestId,
          troubleshooting: {
            checkVPN: 'Try disabling VPN and retry',
            checkFirewall: 'Check if firewall is blocking Supabase domain',
            checkDNS: 'Verify DNS resolution: nslookup ' + (supabaseUrl ? new URL(supabaseUrl).hostname : 'supabase.co'),
            checkProxy: 'Check if corporate proxy is intercepting HTTPS',
          }
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

