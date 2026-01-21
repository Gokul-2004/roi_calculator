'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import { Calculator, Save, TrendingUp, DollarSign, Clock, FileText, Zap, CheckCircle2, Check, Users, AlertCircle, Activity, Building2, Shield, FileCheck, Database, X, RefreshCw, Cookie } from 'lucide-react';
import {
  calculateAnnualCosts,
  calculateROIMetrics,
  calculateBenefits,
  formatCurrency,
  formatNumber,
  COST_ASSUMPTIONS,
  type InputParams,
  type AnnualCosts,
  type ROIMetrics,
  type Benefits,
  type CostAssumptions,
} from '@/lib/calculations';

const DEFAULT_INPUTS: InputParams = {
  // Start key user inputs as empty (NaN) so no default values show in the UI
  documents_per_year: Number.NaN,
  pages_per_document: Number.NaN,
  signatories_per_document: Number.NaN,
  staff_handling_documents: 10,
  esig_annual_cost: Number.NaN,
  implementation_cost: Number.NaN,
  implementation_timeline_months: 3,
};

function TypewriterText({ text, speed = 100 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    // Reset when component mounts
    setDisplayedText('');
    setIsDeleting(false);
    setCharIndex(0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Wait 10 seconds before starting to delete
          setTimeout(() => setIsDeleting(true), 10000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayedText(text.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
        }
      }
    }, isDeleting ? speed / 2 : speed); // Delete faster than typing

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, text, speed]);

  return (
    <span className="inline-block min-w-[600px] text-left">
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Home() {
  const [inputs, setInputs] = useState<InputParams>(DEFAULT_INPUTS);
  const [costAssumptions, setCostAssumptions] = useState<CostAssumptions>(COST_ASSUMPTIONS);
  const [results, setResults] = useState<{
    annualCosts: AnnualCosts;
    roiMetrics: ROIMetrics;
    benefits: Benefits;
  } | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Check if user has already accepted/declined cookies
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieBanner(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowCookieBanner(false);
  };
  const handleReset = () => {
    console.log('🔄 [Calculator] Resetting inputs and assumptions to defaults');
    setInputs(DEFAULT_INPUTS);
    setCostAssumptions(COST_ASSUMPTIONS);
    setResults(null);
  };

  const handleCalculate = async () => {
    console.log('🧮 [Calculator] Starting calculation...');
    console.log('   Input Parameters:', {
      documents_per_year: inputs.documents_per_year,
      pages_per_document: inputs.pages_per_document,
      signatories_per_document: inputs.signatories_per_document,
      staff_handling_documents: inputs.staff_handling_documents,
      esig_annual_cost: inputs.esig_annual_cost,
      implementation_cost: inputs.implementation_cost,
    });
    
    const annualCosts = calculateAnnualCosts(inputs, costAssumptions);
    const roiMetrics = calculateROIMetrics(inputs, annualCosts);
    const benefits = calculateBenefits(inputs);
    const newResults = { annualCosts, roiMetrics, benefits };
    setResults(newResults);
    
    console.log('📊 [Calculator] Calculation complete:');
    console.log('   Annual Savings:', formatCurrency(annualCosts.annual_savings));
    console.log('   Year 1 ROI:', `${roiMetrics.year1_roi_percent.toFixed(1)}%`);
    
    // Automatically track calculation with IP address
    console.log('📡 [Calculator] Attempting to track calculation...');
    try {
      const trackingStartTime = Date.now();
      const response = await fetch('/api/track-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputParams: inputs,
          results: newResults,
        }),
      });
      
      const trackingDuration = Date.now() - trackingStartTime;
      
      if (response.ok) {
        const data = await response.json();
        if (data.trackingDisabled) {
          console.warn('⚠️  [Calculator] Tracking is disabled (Supabase env vars missing)');
        } else {
          console.log(`✅ [Calculator] Calculation tracked successfully in ${trackingDuration}ms`);
          console.log('   Record ID:', data.id);
          if (data.requestId) {
            console.log('   Request ID:', data.requestId);
          }
        }
      } else {
        const error = await response.json();
        console.error(`❌ [Calculator] Tracking failed after ${trackingDuration}ms:`);
        console.error('   Status:', response.status);
        console.error('   Error:', error.error || 'Unknown error');
        console.error('   Details:', error.details || 'No details');
        console.error('   Hint:', error.hint || 'No hint');
        if (error.requestId) {
          console.error('   Request ID:', error.requestId, '(check server logs for this ID)');
        }
        console.error('   Full error response:', JSON.stringify(error, null, 2));
      }
    } catch (error: any) {
      // Network error (fetch failed, CORS, etc.)
      console.error('❌ [Calculator] Network error while tracking:');
      console.error('   Error Type:', error.constructor.name);
      console.error('   Error Message:', error.message);
      console.error('   This usually means the API route is unreachable or there\'s a network issue.');
    }
  };

  // Auto-calculate when inputs or assumptions change (after first calculation)
  useEffect(() => {
    if (results) {
      const annualCosts = calculateAnnualCosts(inputs, costAssumptions);
      const roiMetrics = calculateROIMetrics(inputs, annualCosts);
      const benefits = calculateBenefits(inputs);
      setResults({ annualCosts, roiMetrics, benefits });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, costAssumptions]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100">
      {/* Professional Header */}
      <header className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/certinal_logo.webp"
                alt="CERTINAL Logo"
                width={200}
                height={60}
                className="h-12 w-auto"
                priority
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  ROI Calculator
          </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#32BF84] text-white border border-[#28A06A] rounded-full hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-semibold">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* DPDP Act Disclaimer Banner */}
      <div className="fixed top-24 left-0 right-0 h-10 bg-gradient-to-r from-[#28A06A] via-[#32BF84] to-[#28A06A] text-white overflow-hidden z-50 flex items-center">
        <div className="flex animate-scroll whitespace-nowrap">
          <div className="flex items-center gap-4 px-4 min-w-max">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm md:text-base">
              ⚠️ Disclaimer: Not complying with DPDP Act could potentially lead to a fine up to ₹250 Crores
            </span>
          </div>
          <div className="flex items-center gap-4 px-4 min-w-max">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm md:text-base">
              ⚠️ Disclaimer: Not complying with DPDP Act could potentially lead to a fine up to ₹250 Crores
            </span>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Input Parameters (Fixed - Doesn't scroll) */}
      <aside className="hidden lg:block fixed left-0 top-[136px] bottom-0 w-[286px] bg-white border-r border-slate-200 shadow-lg z-30 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A]">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Input Parameters</h2>
          </div>
          <div className="space-y-5">
            <InputField
              label="Documents per Year"
              value={inputs.documents_per_year}
              onChange={(v) => setInputs({ ...inputs, documents_per_year: v })}
              type="number"
              step="1000"
            />
            <InputField
              label="Average Pages per Document"
              value={inputs.pages_per_document}
              onChange={(v) => setInputs({ ...inputs, pages_per_document: v })}
              type="number"
              step="0.5"
            />
            <InputField
              label="Number of Signatories per Document"
              value={inputs.signatories_per_document}
              onChange={(v) => setInputs({ ...inputs, signatories_per_document: v })}
              type="number"
              step="1"
            />
            <InputField
              label="E-Signature Solution Annual Cost (₹)"
              value={inputs.esig_annual_cost}
              onChange={(v) => setInputs({ ...inputs, esig_annual_cost: v })}
              type="number"
              step="100000"
            />
            <InputField
              label="Implementation Cost - One-time (₹)"
              value={inputs.implementation_cost}
              onChange={(v) => setInputs({ ...inputs, implementation_cost: v })}
              type="number"
              step="100000"
            />
          </div>
          <button
            onClick={handleCalculate}
            className="mt-6 w-full bg-[#32BF84] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Calculator className="w-5 h-5 inline mr-2" />
            Calculate ROI
          </button>
        </div>
      </aside>

      {/* Right Side - Results (Scrollable) */}
      <div className="lg:pl-[286px]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <main className="space-y-6">
            {/* Results */}
            {results ? (
              <>
                {/* Intro Text */}
                <div className="text-2xl font-light text-center mb-6 italic" style={{ 
                  color: '#21AA47',
                }}>
                  How much could you be saving with a <span className="font-bold not-italic">Certinal Digital Signing</span> solution? Try our eSignature ROI calculator below and find out.
                </div>
                
                {/* Cost Breakdown */}
                <CostBreakdownSection 
                  costs={results.annualCosts} 
                  metrics={results.roiMetrics}
                  costAssumptions={costAssumptions}
                  setCostAssumptions={setCostAssumptions}
                  inputs={inputs}
                />
                
                {/* Benefits */}
                <BenefitsSection benefits={results.benefits} />
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
                <Calculator className="w-16 h-16 text-[#32BF84] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Calculate</h3>
                <p className="text-slate-500">Adjust the parameters on the left and click "Calculate ROI" to see results</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Input Section */}
      <div className="lg:hidden px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A]">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Input Parameters</h2>
          </div>
          <div className="space-y-5">
            <InputField
              label="Documents per Year"
              value={inputs.documents_per_year}
              onChange={(v) => setInputs({ ...inputs, documents_per_year: v })}
              type="number"
              step="1000"
            />
            <InputField
              label="Average Pages per Document"
              value={inputs.pages_per_document}
              onChange={(v) => setInputs({ ...inputs, pages_per_document: v })}
              type="number"
              step="0.5"
            />
            <InputField
              label="Number of Signatories per Document"
              value={inputs.signatories_per_document}
              onChange={(v) => setInputs({ ...inputs, signatories_per_document: v })}
              type="number"
              step="1"
            />
            <InputField
              label="E-Signature Solution Annual Cost (₹)"
              value={inputs.esig_annual_cost}
              onChange={(v) => setInputs({ ...inputs, esig_annual_cost: v })}
              type="number"
              step="100000"
            />
            <InputField
              label="Implementation Cost - One-time (₹)"
              value={inputs.implementation_cost}
              onChange={(v) => setInputs({ ...inputs, implementation_cost: v })}
              type="number"
              step="100000"
            />
          </div>
          <button
            onClick={handleCalculate}
            className="mt-6 w-full bg-[#32BF84] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Calculator className="w-5 h-5 inline mr-2" />
            Calculate ROI
          </button>
        </div>
      </div>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-300 shadow-2xl z-50 p-4 md:p-6">
          <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A] flex-shrink-0">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">Cookie Consent</h3>
                <p className="text-sm text-slate-700">
                  We use cookies to track calculation data and IP addresses for analytics purposes. 
                  By clicking "Accept", you consent to our data collection practices. 
                  <a href="#" className="text-[#32BF84] hover:underline ml-1">Learn more</a>
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleDeclineCookies}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-all duration-200"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptCookies}
                className="px-6 py-2 bg-[#32BF84] text-white rounded-lg font-semibold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'number',
  step,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: string;
  step?: string;
  disabled?: boolean;
}) {
  // Allow the user to clear the field visually without immediately forcing 0.
  // Internally we still work with numbers; empty/NaN is treated as 0 at calculation time.
  const displayValue = Number.isNaN(value) ? '' : value;

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type={type}
        value={displayValue}
        disabled={disabled}
        // Prevent mouse-wheel scroll from accidentally changing the value
        onWheel={(e) => {
          (e.target as HTMLInputElement).blur();
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') {
            // Keep input visually empty, but internally represent as NaN
            onChange(NaN as unknown as number);
          } else {
            const parsed = parseFloat(raw);
            onChange(Number.isNaN(parsed) ? (NaN as unknown as number) : parsed);
          }
        }}
        step={step}
        className={`w-full px-4 py-3 border rounded-lg bg-white text-slate-900 font-semibold transition-all duration-200 shadow-sm ${
          disabled
            ? 'border-slate-200 text-slate-500 bg-slate-50 cursor-not-allowed'
            : 'border-slate-300 focus:ring-2 focus:ring-slate-400 focus:border-slate-500 hover:border-slate-400'
        }`}
      />
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #475569 0%, #475569 ${((value - min) / (max - min)) * 100}%, #e2e8f0 ${((value - min) / (max - min)) * 100}%, #e2e8f0 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

function CostBreakdownSection({ 
  costs, 
  metrics, 
  costAssumptions, 
  setCostAssumptions,
  inputs,
}: { 
  costs: AnnualCosts; 
  metrics: ROIMetrics;
  costAssumptions: CostAssumptions;
  setCostAssumptions: (assumptions: CostAssumptions) => void;
  inputs: InputParams;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showAssumptionsModal, setShowAssumptionsModal] = useState(false);
  const [isEditingAssumptions, setIsEditingAssumptions] = useState(false);
  const [editableAssumptions, setEditableAssumptions] = useState<CostAssumptions>(costAssumptions);

  // Sync editable assumptions when modal opens
  useEffect(() => {
    if (showAssumptionsModal) {
      setEditableAssumptions(costAssumptions);
      setIsEditingAssumptions(false);
    }
  }, [showAssumptionsModal, costAssumptions]);

  // Annual savings (does NOT subtract implementation cost)
  const annualSavings = costs.annual_savings;
  const savingsPercent =
    costs.total_paper_cost > 0
      ? (annualSavings / costs.total_paper_cost) * 100
      : 0;

  const handleExportPdf = async () => {
    try {
      const doc = new jsPDF();

      // Theme (match site)
      const GREEN = '#32BF84';
      const GREEN_DARK = '#28A06A';
      const SLATE_TEXT = '#0f172a';
      const SLATE_MUTED = '#475569';
      const CARD_BG = '#f1f5f9';
      const BORDER = '#e2e8f0';

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const setFillHex = (hex: string) => {
        const h = hex.replace('#', '');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        doc.setFillColor(r, g, b);
      };
      const setTextHex = (hex: string) => {
        const h = hex.replace('#', '');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        doc.setTextColor(r, g, b);
      };

      const drawCard = (
        x: number,
        y: number,
        w: number,
        h: number,
        title: string,
        value: string,
        subtitle?: string,
        valueColorHex: string = GREEN
      ) => {
        setFillHex(CARD_BG);
        doc.roundedRect(x, y, w, h, 3, 3, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, y, w, h, 3, 3, 'S');

        setTextHex(SLATE_MUTED);
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.text(title, x + 6, y + 7);
        doc.setFont('helvetica', 'normal');

        setTextHex(valueColorHex);
        doc.setFontSize(16);
        doc.text(value, x + 6, y + 17);

        if (subtitle) {
          setTextHex(SLATE_MUTED);
          doc.setFontSize(8.5);
          doc.text(subtitle, x + 6, y + 24);
        }
      };

      // Helpers to clean up currency text for PDF (₹ sometimes shows as "1" with base fonts)
      const pdfCurrency = (value: number) =>
        formatCurrency(value).replace('₹', 'Rs.');
      const pdfText = (value: string) =>
        value.replace('₹', 'Rs.');

      const safeText = (v: string) => v ?? '';

      // Convert the public webp logo into PNG data URL for jsPDF
      const loadLogoPngDataUrl = async (): Promise<string | null> => {
        try {
          const res = await fetch('/certinal_logo.webp');
          const blob = await res.blob();
          const bmp = await createImageBitmap(blob);
          const canvas = document.createElement('canvas');
          canvas.width = bmp.width;
          canvas.height = bmp.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          ctx.drawImage(bmp, 0, 0);
          return canvas.toDataURL('image/png');
        } catch {
          return null;
        }
      };

      // PAGE 1: Header (match website header: logo + ROI Calculator)
      setFillHex('#ffffff');
      doc.rect(0, 0, pageWidth, 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(0, 24, pageWidth, 24);

      const logoDataUrl = await loadLogoPngDataUrl();
      // Header layout: keep logo and title visually aligned on the same baseline
      const headerBaselineY = 14;
      if (logoDataUrl) {
        // Move logo slightly down + a touch smaller so it doesn't sit higher than the title
        doc.addImage(logoDataUrl, 'PNG', 12, 6, 40, 10);
      } else {
        setTextHex(SLATE_TEXT);
        doc.setFontSize(16);
        doc.text('CERTINAL', 12, headerBaselineY);
      }

      const titleX = 60;
      setTextHex(SLATE_TEXT);
      doc.setFontSize(18);
      doc.text('ROI Calculator', titleX, headerBaselineY);

      // PAGE 1: Sections like the site: Input Parameters + key result cards
      let y = 34;

      // Input Parameters block (two columns) - show actual values
      setTextHex(SLATE_TEXT);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Input Parameters', 12, y);
      doc.setFont('helvetica', 'normal');
      y += 6;

      // Use values that were used in calculation (available in parent via closure? not here).
      // We only have costs/metrics here; input values are in the parent component.
      // We'll read them via window.__roiInputs is not set; instead pass them from parent is bigger refactor.
      // To keep it clean: include the key cost inputs derived from current calculation (subscription + implementation).
      // Note: documents/pages/signatories live above; to match request, we’ll include those by reading from DOM is brittle.
      // Instead: we’ll take them from localStorage? Not present.
      // So: include the cost-relevant inputs we can infer + leave placeholders not inferable.
      const inputLinesLeft = [
        `Documents per Year: ${formatNumber(inputs.documents_per_year)}`,
        `Average Pages per Document: ${inputs.pages_per_document}`,
        `Number of Signatories per Document: ${inputs.signatories_per_document}`,
      ];
      const inputLinesRight = [
        `E-Signature Annual Cost`,
        `${pdfCurrency(costs.software_subscription)}`,
        `Implementation Cost (One-time)`,
        `${pdfCurrency(metrics.implementation_cost)}`,
      ];

      setFillHex('#ffffff');
      doc.roundedRect(12, y, pageWidth - 24, 34, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(12, y, pageWidth - 24, 34, 3, 3, 'S');

      setTextHex(SLATE_MUTED);
      doc.setFontSize(10);
      let ly = y + 9;
      inputLinesLeft.forEach((line) => {
        doc.text(line, 18, ly);
        ly += 7;
      });
      let ry = y + 9;
      inputLinesRight.forEach((line, index) => {
        // Right column, right-aligned so long numbers stay inside the box
        const isValueLine = index === 1 || index === 3;
        doc.text(line, pageWidth - 20, ry, {
          align: 'right',
          maxWidth: pageWidth / 2 - 24,
        });
        ry += isValueLine ? 6 : 7;
      });

      y += 46;

      // Key Results (cards similar to UI)
      setTextHex(SLATE_TEXT);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Annual Cost Breakdown (Summary)', 12, y);
      doc.setFont('helvetica', 'normal');
      y += 6;

      const cardW = (pageWidth - 24 - 12) / 2; // two columns with 12 gap
      const cardH = 28;
      const x1 = 12;
      const x2 = 12 + cardW + 12;

      const RED = '#dc2626';
      drawCard(
        x1,
        y,
        cardW,
        cardH,
        'Paper-Based',
        pdfCurrency(costs.total_paper_cost),
        'Old annual cost',
        RED
      );
      drawCard(
        x2,
        y,
        cardW,
        cardH,
        'E-Signature',
        pdfCurrency(costs.total_esig_cost),
        'New annual cost',
        GREEN
      );
      y += cardH + 10;

      drawCard(
        x1,
        y,
        cardW,
        cardH,
        'Annual Savings',
        pdfCurrency(annualSavings),
        'You could be saving every year',
        annualSavings >= 0 ? GREEN_DARK : RED
      );
      drawCard(x2, y, cardW, cardH, 'Breakeven Period', `${metrics.payback_period_months.toFixed(1)} months`, 'Rapid cost recovery');
      y += cardH + 10;

      drawCard(
        x1,
        y,
        cardW,
        cardH,
        'Year 1 ROI',
        `${metrics.year1_roi_percent.toFixed(1)}%`,
        'Year 1 ROI',
        metrics.year1_roi_percent >= 0 ? GREEN : RED
      );
      drawCard(
        x2,
        y,
        cardW,
        cardH,
        'Year 5 ROI',
        `${metrics.year5_roi_percent.toFixed(1)}%`,
        'Cumulative 5 years',
        metrics.year5_roi_percent >= 0 ? GREEN : RED
      );
      y += cardH + 10;

      drawCard(
        x1,
        y,
        cardW,
        cardH,
        '3 Years Net Savings',
        pdfCurrency(metrics.net_savings_3_years),
        'Total savings over 3 years',
        metrics.net_savings_3_years >= 0 ? GREEN : RED
      );
      drawCard(
        x2,
        y,
        cardW,
        cardH,
        '5 Years Net Savings',
        pdfCurrency(metrics.net_savings_5_years),
        'Total savings over 5 years',
        metrics.net_savings_5_years >= 0 ? GREEN : RED
      );

      // Page 2 - Detailed breakdown (same structure as modal)
      doc.addPage();
      // Header repeated
      setFillHex('#ffffff');
      doc.rect(0, 0, pageWidth, 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(0, 24, pageWidth, 24);
      const headerBaselineY2 = 14;
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 12, 6, 40, 10);
      } else {
        setTextHex(SLATE_TEXT);
        doc.setFontSize(16);
        doc.text('CERTINAL', 12, headerBaselineY2);
      }
      setTextHex(SLATE_TEXT);
      doc.setFontSize(18);
      doc.text('ROI Calculator', 60, headerBaselineY2);

      y = 34;
      setTextHex(SLATE_TEXT);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Cost Breakdown', 12, y);
      doc.setFont('helvetica', 'normal');
      y += 8;

      // Table header
      setFillHex(GREEN);
      doc.roundedRect(12, y, pageWidth - 24, 10, 2, 2, 'F');
      setTextHex('#ffffff');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      // Compact column layout: small label column, then three numeric columns
      const colLabelX = 16;
      const colLabelMaxWidth = 65; // keep label column tighter
      const colPaperX = colLabelX + colLabelMaxWidth + 6;
      const colEsigX = colPaperX + 38;
      const colSavingsX = colEsigX + 42;
      doc.text('Cost Component', colLabelX, y + 7);
      doc.text('Paper-Based', colPaperX, y + 7);
      doc.text('E-Signature', colEsigX, y + 7);
      doc.text('Annual Savings', colSavingsX, y + 7);
      doc.setFont('helvetica', 'normal');
      y += 16;

      setTextHex(SLATE_TEXT);
      doc.setFontSize(9);

      const addCostRow = (label: string, paper: number | null, esig: number | null, savings: number | null, bold: boolean = false, fontSize: number = 9) => {
        if (y > pageHeight - 18) {
          doc.addPage();
          // minimal header on overflow pages
          setFillHex('#ffffff');
          doc.rect(0, 0, pageWidth, 18, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.line(0, 18, pageWidth, 18);
          setTextHex(SLATE_TEXT);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Detailed Cost Breakdown (cont.)', 12, 12);
          doc.setFont('helvetica', 'normal');
          y = 28;
        }
        const paperText = paper === null ? '—' : pdfCurrency(paper);
        const esigText = esig === null ? '—' : pdfCurrency(esig);
        const savingsText = savings === null ? '—' : pdfCurrency(savings);

        // Simple row with light underline to reduce clutter
        doc.setDrawColor(226, 232, 240);
        doc.line(12, y + 2, pageWidth - 12, y + 2);

        doc.setFontSize(fontSize);
        if (bold) {
          doc.setFont('helvetica', 'bold');
        }
        setTextHex(SLATE_TEXT);
        // Draw label with a small max width so we don't waste space
        doc.text(label, colLabelX, y, { maxWidth: colLabelMaxWidth });
        setTextHex(SLATE_MUTED);
        // Left-align numeric columns close to the label to use space efficiently
        doc.text(paperText, colPaperX, y);
        doc.text(esigText, colEsigX, y);
        doc.text(savingsText, colSavingsX, y);
        if (bold) {
          doc.setFont('helvetica', 'normal');
        }
        doc.setFontSize(9);
        y += 6;
      };

      addCostRow('Paper & Printing', costs.paper_printing, 0, costs.paper_printing);
      addCostRow('Physical Storage & Filing', costs.storage_filing, 0, costs.storage_filing);
      addCostRow(
        'Staff Time (Processing & Signing)',
        costs.paper_staff_time,
        costs.esig_staff_time,
        costs.paper_staff_time - costs.esig_staff_time
      );
      addCostRow('Document Loss/Recreation', costs.doc_loss_recreation, 0, costs.doc_loss_recreation);
      addCostRow(
        'Compliance & Audit',
        costs.paper_compliance_audit,
        costs.esig_compliance_audit,
        costs.paper_compliance_audit - costs.esig_compliance_audit
      );
      addCostRow('Software Subscription', 0, costs.software_subscription, -costs.software_subscription);
      addCostRow(
        'Implementation Cost (across 5 years)',
        0,
        metrics.implementation_cost / 5,
        -metrics.implementation_cost / 5
      );

      // Totals row
      addCostRow(
        'Total',
        (costs.paper_printing || 0) +
          (costs.storage_filing || 0) +
          (costs.paper_staff_time || 0) +
          (costs.doc_loss_recreation || 0) +
          (costs.paper_compliance_audit || 0),
        (costs.esig_staff_time || 0) +
          (costs.esig_compliance_audit || 0) +
          (costs.software_subscription || 0),
        annualSavings,
        true,
        10.5
      );

      // Assumptions Table (after some spacing)
      y += 16;
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }
      setTextHex(SLATE_TEXT);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Cost Assumptions', 12, y);
      doc.setFont('helvetica', 'normal');
      y += 8;

      // Assumptions table header
      setFillHex(GREEN);
      doc.roundedRect(12, y, pageWidth - 24, 10, 2, 2, 'F');
      setTextHex('#ffffff');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const colAssumpValueX = 120;
      const colAssumpUnitX = 170;
      doc.text('Cost Component', 16, y + 7);
      doc.text('Value', colAssumpValueX, y + 7);
      doc.text('Unit', colAssumpUnitX, y + 7);
      doc.setFont('helvetica', 'normal');
      y += 14;

      const assumptionsList = [
        {
          label: 'Paper Cost per Page',
          key: 'paper_cost_per_page' as const,
          unit: '₹',
          format: (v: number | null) => (v === null ? '—' : pdfCurrency(v)),
        },
        {
          label: 'Storage Cost per Document per Year',
          key: 'storage_cost_per_doc' as const,
          unit: '₹',
          format: (v: number | null) => (v === null ? '—' : pdfCurrency(v)),
        },
        {
          label: 'Staff Time per Document (Paper)',
          key: 'paper_time_per_doc' as const,
          unit: 'minutes',
          format: (v: number | null) => (v === null ? '—' : `${v.toFixed(2)} min`),
        },
        {
          label: 'Average Staff Hourly Cost',
          key: 'staff_hourly_cost' as const,
          unit: '₹',
          format: (v: number | null) => (v === null ? '—' : pdfCurrency(v)),
        },
        {
          label: 'Document Loss/Re-creation Rate',
          key: 'document_loss_rate' as const,
          unit: '%',
          format: (v: number | null) => (v === null ? '—' : `${v.toFixed(2)}%`),
        },
        {
          label: 'Compliance Audit Cost per Year (Paper)',
          key: 'paper_compliance_cost' as const,
          unit: '₹',
          format: (v: number | null) => (v === null ? '—' : pdfCurrency(v)),
        },
        {
          label: 'E-Signature Staff Time per Document',
          key: 'esig_time_per_doc' as const,
          unit: 'minutes',
          format: (v: number | null) => (v === null ? '—' : `${v.toFixed(2)} min`),
        },
        {
          label: 'E-Signature Compliance Cost per Year',
          key: 'esig_compliance_cost' as const,
          unit: '₹',
          format: (v: number | null) => (v === null ? '—' : pdfCurrency(v)),
        },
      ];

      setTextHex(SLATE_TEXT);
      doc.setFontSize(9);
      assumptionsList.forEach((item) => {
        if (y > pageHeight - 16) {
          doc.addPage();
          y = 20;
          setTextHex(SLATE_TEXT);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Cost Assumptions (cont.)', 12, y);
          doc.setFont('helvetica', 'normal');
          y += 8;
        }
        const val = (costAssumptions as any)[item.key] as number | null;
        const formattedVal = item.format(val);

        doc.setDrawColor(226, 232, 240);
        doc.line(12, y + 2, pageWidth - 12, y + 2);

        setTextHex(SLATE_TEXT);
        doc.text(item.label, 16, y, { maxWidth: 90 });
        setTextHex(SLATE_MUTED);
        doc.text(formattedVal, colAssumpValueX, y);
        doc.text(item.unit, colAssumpUnitX, y);
        y += 7;
      });

      // Annual Benefits (Non-Financial) section - Start on new page
      doc.addPage();
      y = 20;
      setTextHex(SLATE_TEXT);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Annual Benefits (Non-Financial)', 12, y);
      doc.setFont('helvetica', 'normal');
      y += 10;

      const pagesSaved = (inputs.documents_per_year || 0) * (inputs.pages_per_document || 0);
      const benefits_list = [
        { title: 'Instant Document Signing', desc: 'Zero waiting time for approvals at admission/discharge kiosks.' },
        { title: 'Pages Saved Annually', desc: `${formatNumber(pagesSaved)} pages saved. Reduced paper & environmental impact.` },
        { title: 'Compliance & Audit Trail', desc: '100% digital audit trail. NABH, ABDM compliance.' },
        { title: 'Reduced Staff Burden', desc: '5 min vs 15 min per document. More time for patient care.' },
        { title: 'Error Reduction', desc: 'No lost signatures or missing approvals.' },
        { title: 'Patient Experience', desc: 'Faster onboarding and discharge. Enhanced patient satisfaction.' },
        { title: 'EMR Seamless Integration', desc: 'Real-time EMR sync. Eliminates manual data entry errors.' },
        { title: 'Reduced Hospital Congestion', desc: 'Faster document processing. Reduces waiting times.' },
        { title: 'Indian Evidence Act Compliance', desc: 'Compliant with Section 3A. Legally valid & admissible.' },
        { title: 'IT Act 2000 Compliance', desc: 'IT Act Section 5 compliant. Valid alternate to paper documents.' },
        { title: 'DPDP Compliance Ready', desc: 'Full audit trail + data residency. Reduced regulatory risks.' }
      ];

      benefits_list.forEach((benefit) => {
        if (y > pageHeight - 24) {
          doc.addPage();
          y = 20;
          setTextHex(SLATE_TEXT);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Annual Benefits (Non-Financial) (cont.)', 12, y);
          doc.setFont('helvetica', 'normal');
          y += 10;
        }

        // Checkmark bullet (using a green circle)
        setFillHex(GREEN);
        doc.circle(14, y - 1.5, 1.5, 'F');

        // Title in bold on first line
        setTextHex(SLATE_TEXT);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(benefit.title + ':', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 5;

        // Description on second line, indented
        setTextHex(SLATE_MUTED);
        doc.setFontSize(8.5);
        doc.text(benefit.desc, 20, y, { maxWidth: pageWidth - 32 });

        y += 7;
      });

      doc.save('Certinal_e-sign_ROI_Calculation.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Sorry, there was a problem exporting the PDF.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A]">
            <span className="text-2xl font-bold text-white">₹</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Annual Cost Breakdown</h2>
        </div>

        {/* Big Savings Highlight */}
        <div className="mb-6 text-center">
          <p className="inline-block px-4 py-2 text-2xl font-extrabold rounded-full shadow-sm border" style={{ color: '#32BF84', borderColor: '#32BF84' }}>
            You could be saving {formatCurrency(annualSavings)} every year
          </p>
          {savingsPercent > 0 && (
            <p className="text-sm text-slate-600 mt-2">
              That&apos;s roughly {savingsPercent.toFixed(1)}% of your current paper-based annual spend
            </p>
          )}
        </div>

        {/* Row 1 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Old Annual Cost - Paper-Based */}
          <div className="p-6 bg-slate-100 rounded-lg border border-slate-200 shadow-md text-center">
            <p className="text-sm font-semibold mb-2 text-slate-700">Paper-Based</p>
            <p className="text-3xl font-bold mb-2 text-red-600">
              {formatCurrency(costs.total_paper_cost)}
            </p>
            <p className="text-xs text-slate-500">Old annual cost</p>
          </div>

          {/* New Annual Cost - E-Signature */}
          <div className="p-6 bg-slate-100 rounded-lg border border-slate-200 shadow-md text-center">
            <p className="text-sm font-semibold mb-2 text-slate-700">E-Signature</p>
            <p className="text-3xl font-bold mb-2" style={{ color: '#32BF84' }}>
              {formatCurrency(costs.total_esig_cost)}
            </p>
            <p className="text-xs text-slate-500">New annual cost</p>
          </div>

          {/* Annual Savings (after implementation) - Highlighted */}
          <div className="p-6 bg-emerald-50 rounded-lg border-2 shadow-md text-center relative" style={{ borderColor: '#32BF84' }}>
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span
                className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full shadow-sm"
                style={{ backgroundColor: '#16a34a' }}
              >
                Net Annual Gain
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold mb-2" style={{ color: '#166534' }}>
              Annual Savings
            </p>
            <p className="text-3xl font-extrabold mb-2" style={{ color: '#16a34a' }}>
              {formatCurrency(annualSavings)}
            </p>
            <p className="text-xs font-semibold" style={{ color: '#166534' }}>
              You save this much (after implementation)
            </p>
          </div>

          {/* Breakeven Period Card (neutral grey) */}
          <div className="p-6 bg-slate-100 rounded-lg border border-slate-200 shadow-md text-center">
            <p className="text-sm font-semibold mb-2 text-slate-700">
              Breakeven Period
            </p>
            <p className="text-3xl font-bold mb-2" style={{ color: '#32BF84' }}>
              {metrics.payback_period_months.toFixed(1)} months
            </p>
            <p className="text-xs text-slate-600">
              Rapid cost recovery and efficiency gains
            </p>
          </div>
        </div>

        {/* Row 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Year 1 ROI (%)"
            value={`${metrics.year1_roi_percent.toFixed(1)}%`}
            subtitle="Year 1 ROI"
            color="slate"
          />
          <MetricCard
            title="Year 5 ROI (%)"
            value={`${metrics.year5_roi_percent.toFixed(1)}%`}
            subtitle="Cumulative 5 years"
            color="slate"
          />
          <div className="p-6 bg-slate-100 rounded-lg border border-slate-200 shadow-md text-center">
            <p className="text-sm font-semibold mb-1 text-slate-700">3 Years Net Savings</p>
            <p className="text-3xl font-bold mb-1" style={{ color: '#32BF84' }}>
              {formatCurrency(metrics.net_savings_3_years)}
            </p>
            <p className="text-xs text-slate-600">Total savings over 3 years</p>
          </div>
          <div className="p-6 bg-slate-100 rounded-lg border border-slate-200 shadow-md text-center">
            <p className="text-sm font-semibold mb-1 text-slate-700">5 Years Net Savings</p>
            <p className="text-3xl font-bold mb-1" style={{ color: '#32BF84' }}>
              {formatCurrency(metrics.net_savings_5_years)}
            </p>
            <p className="text-xs text-slate-600">Total savings over 5 years</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-[#32BF84] text-white rounded-lg font-semibold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            View Detailed Breakdown
          </button>
          <button
            onClick={() => setShowAssumptionsModal(true)}
            className="px-6 py-3 bg-[#32BF84] text-white rounded-lg font-semibold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            View/Modify Cost Assumptions
          </button>
          <button
            onClick={handleExportPdf}
            className="px-6 py-3 bg-[#32BF84] text-white rounded-lg font-semibold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Export Results
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="text-2xl font-bold text-slate-700">₹</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Detailed Cost Breakdown</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-100 rounded-lg text-sm text-slate-800 border border-slate-200">
                  <div className="font-bold">Cost Component</div>
                  <div className="text-right font-bold">Paper-Based (₹)</div>
                  <div className="text-right font-bold">E-Signature (₹)</div>
                  <div className="text-right font-bold">Annual Savings (₹)</div>
                </div>
                <CostItem
                  label="Paper & Printing"
                  paper={costs.paper_printing}
                  esig={0}
                  savings={costs.paper_printing}
                />
                <CostItem
                  label="Physical Storage & Filing"
                  paper={costs.storage_filing}
                  esig={0}
                  savings={costs.storage_filing}
                />
                <CostItem
                  label="Staff Time (Processing & Signing)"
                  paper={costs.paper_staff_time}
                  esig={costs.esig_staff_time}
                  savings={costs.paper_staff_time - costs.esig_staff_time}
                />
                <CostItem
                  label="Document Loss/Recreation"
                  paper={costs.doc_loss_recreation}
                  esig={0}
                  savings={costs.doc_loss_recreation}
                />
                <CostItem
                  label="Compliance & Audit"
                  paper={costs.paper_compliance_audit}
                  esig={costs.esig_compliance_audit}
                  savings={costs.paper_compliance_audit - costs.esig_compliance_audit}
                />
                <CostItem
                  label="Software Subscription"
                  paper={0}
                  esig={costs.software_subscription}
                  savings={-costs.software_subscription}
                />
                <CostItem
                  label="Implementation Cost (across 5 years)"
                  paper={0}
                  esig={metrics.implementation_cost / 5}
                  savings={-metrics.implementation_cost / 5}
                />
                {/* Totals Row */}
                <CostItem
                  label="Total"
                  paper={
                    (costs.paper_printing || 0) +
                    (costs.storage_filing || 0) +
                    (costs.paper_staff_time || 0) +
                    (costs.doc_loss_recreation || 0) +
                    (costs.paper_compliance_audit || 0)
                  }
                  esig={
                    (costs.esig_staff_time || 0) +
                    (costs.esig_compliance_audit || 0) +
                    (costs.software_subscription || 0)
                  }
                  savings={annualSavings}
                  isTotal={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Assumptions Modal */}
      {showAssumptionsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => {
            setEditableAssumptions(costAssumptions); // Reset on cancel
            setShowAssumptionsModal(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A]">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Cost Assumptions</h2>
              </div>
              <button
                onClick={() => {
                  setEditableAssumptions(costAssumptions); // Reset on cancel
                  setShowAssumptionsModal(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-600">
                  Industry benchmarks tailored for Indian healthcare. Values are protected to maintain consistency.
                </p>
                {!isEditingAssumptions && (
                  <button
                    onClick={() => setIsEditingAssumptions(true)}
                    className="px-6 py-2 bg-[#32BF84] text-white rounded-lg font-semibold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Modify
                  </button>
                )}
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                <div className="grid grid-cols-4 gap-4 bg-slate-100 px-4 py-3 text-xs text-slate-700">
                  <div className="font-bold">Cost Component</div>
                  <div className="text-right font-bold">Value</div>
                  <div className="text-center font-bold">Unit</div>
                  <div className="font-bold">Notes</div>
                </div>
                <div className="divide-y divide-slate-200">
                  {[
                    {
                      key: 'paper_cost_per_page' as keyof CostAssumptions,
                      label: 'Paper Cost per Page',
                      unit: '₹',
                      notes: 'A4 paper cost including printing',
                      step: 0.01,
                      formatValue: (v: number | null) => v === null ? '—' : v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    },
                    {
                      key: 'storage_cost_per_doc' as keyof CostAssumptions,
                      label: 'Storage Cost per Document per Year',
                      unit: '₹',
                      notes: 'Physical archival and retrieval costs',
                      step: 0.1,
                      formatValue: (v: number | null) => v === null ? '—' : v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    },
                    {
                      key: 'paper_time_per_doc' as keyof CostAssumptions,
                      label: 'Staff Time per Document (Paper)',
                      unit: 'minutes',
                      notes: 'Time for printing, handling, manual filing',
                      step: 0.5,
                      formatValue: (v: number | null) => v === null ? '—' : v.toFixed(2),
                    },
                    {
                      key: 'staff_hourly_cost' as keyof CostAssumptions,
                      label: 'Average Staff Hourly Cost',
                      unit: '₹',
                      notes: 'Blended rate for document handlers',
                      step: 10,
                      formatValue: (v: number | null) => v === null ? '—' : v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    },
                    {
                      key: 'document_loss_rate' as keyof CostAssumptions,
                      label: 'Document Loss/Re-creation Rate',
                      unit: '%',
                      notes: 'Documents lost or requiring recreation',
                      step: 0.1,
                      formatValue: (v: number | null) => v === null ? '—' : v.toFixed(2),
                    },
                    {
                      key: 'paper_compliance_cost' as keyof CostAssumptions,
                      label: 'Compliance Audit Cost per Year (Paper)',
                      unit: '₹',
                      notes: 'Manual audit and compliance costs',
                      step: 1000,
                      formatValue: (v: number | null) => v === null ? '—' : v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    },
                    {
                      key: 'esig_time_per_doc' as keyof CostAssumptions,
                      label: 'E-Signature Staff Time per Document',
                      unit: 'minutes',
                      notes: 'Time for digital signing process',
                      step: 0.5,
                      formatValue: (v: number | null) => v === null ? '—' : v.toFixed(2),
                    },
                    {
                      key: 'esig_compliance_cost' as keyof CostAssumptions,
                      label: 'E-Signature Compliance Cost per Year',
                      unit: '₹',
                      notes: 'Digital audit and compliance costs',
                      step: 1000,
                      formatValue: (v: number | null) => v === null ? '—' : v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    },
                  ].map((item) => {
                    const value = isEditingAssumptions ? editableAssumptions[item.key] : costAssumptions[item.key];
                    return (
                      <div key={item.key} className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-slate-50 transition-colors items-center">
                        <div className="font-medium text-slate-900">{item.label}</div>
                        <div className="text-right">
                          {isEditingAssumptions ? (
                            <input
                              type="number"
                              value={value === null ? '' : value}
                              onChange={(e) => {
                                const newValue = e.target.value === '' ? null : parseFloat(e.target.value);
                                setEditableAssumptions({
                                  ...editableAssumptions,
                                  [item.key]: newValue,
                                });
                              }}
                              step={item.step}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white text-slate-900 text-right"
                              placeholder="—"
                            />
                          ) : (
                            <span className="text-slate-700 font-medium">{item.formatValue(value)}</span>
                          )}
                        </div>
                        <div className="text-center text-slate-600">{item.unit}</div>
                        <div className="text-sm text-slate-600">{item.notes}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {isEditingAssumptions && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditableAssumptions(costAssumptions); // Reset
                      setIsEditingAssumptions(false);
                    }}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setCostAssumptions(editableAssumptions);
                      setIsEditingAssumptions(false);
                    }}
                    className="px-6 py-3 bg-[#32BF84] text-white rounded-lg font-semibold hover:bg-[#28A06A] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AssumptionsSection() {
  const formatValue = (
    value: number | null,
    type: 'currency' | 'minutes' | 'percent'
  ) => {
    if (value === null) {
      return '—';
    }
    if (type === 'currency') {
      return value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return value.toFixed(2);
  };

  const items = [
    {
      label: 'Paper Cost per Page',
      value: formatValue(COST_ASSUMPTIONS.paper_cost_per_page, 'currency'),
      unit: '₹',
      notes: 'A4 paper cost including printing',
    },
    {
      label: 'Storage Cost per Document per Year',
      value: formatValue(COST_ASSUMPTIONS.storage_cost_per_doc, 'currency'),
      unit: '₹',
      notes: 'Physical archival and retrieval costs',
    },
    {
      label: 'Staff Time per Document (Paper)',
      value: formatValue(COST_ASSUMPTIONS.paper_time_per_doc, 'minutes'),
      unit: 'minutes',
      notes: 'Time for printing, handling, manual filing',
    },
    {
      label: 'Average Staff Hourly Cost',
      value: formatValue(COST_ASSUMPTIONS.staff_hourly_cost, 'currency'),
      unit: '₹',
      notes: 'Blended rate for document handlers',
    },
    {
      label: 'Document Loss/Re-creation Rate',
      value: formatValue(COST_ASSUMPTIONS.document_loss_rate, 'percent'),
      unit: '%',
      notes: 'Documents lost or requiring recreation',
    },
    {
      label: 'Compliance Audit Cost per Year (Paper)',
      value: formatValue(COST_ASSUMPTIONS.paper_compliance_cost, 'currency'),
      unit: '₹',
      notes: 'Manual audit and compliance costs',
    },
    {
      label: 'E-Signature Staff Time per Document',
      value: formatValue(COST_ASSUMPTIONS.esig_time_per_doc, 'minutes'),
      unit: 'minutes',
      notes: 'Time for digital signing process',
    },
    {
      label: 'E-Signature Compliance Cost per Year',
      value: formatValue(COST_ASSUMPTIONS.esig_compliance_cost, 'currency'),
      unit: '₹',
      notes: 'Digital audit and compliance costs',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A]">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Cost Assumptions</h2>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Industry benchmarks tailored for Indian healthcare. Values are protected to maintain consistency.
      </p>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 bg-slate-100 px-4 py-3 text-xs text-slate-700">
          <div className="font-bold">Cost Component</div>
          <div className="text-right font-bold">Value</div>
          <div className="text-center font-bold">Unit</div>
          <div className="font-bold">Notes</div>
        </div>
        <div className="divide-y divide-slate-200">
          {items.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-4 gap-4 px-4 py-4 text-sm items-center"
            >
              <div className="font-medium text-slate-900">{item.label}</div>
              <div className="text-right text-slate-700 font-semibold">{item.value}</div>
              <div className="text-center text-slate-600 text-xs font-semibold uppercase">
                {item.unit}
              </div>
              <div className="text-slate-600 text-xs leading-relaxed">{item.notes}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CostItem({
  label,
  paper,
  esig,
  savings,
  isTotal = false,
}: {
  label: string;
  paper: number | null;
  esig: number | null;
  savings: number | null;
  isTotal?: boolean;
}) {
  const formatValue = (value: number | null) =>
    value === null ? '—' : formatCurrency(value);
  const savingsClass =
    savings === null
      ? 'text-slate-500'
      : savings >= 0
      ? 'text-green-600'
      : 'text-red-600';

  return (
    <div className="grid grid-cols-4 gap-4 p-5 bg-white border border-slate-200 rounded-lg items-center hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      <div className={isTotal ? "font-bold text-slate-900" : "font-semibold text-slate-900"}>{label}</div>
      <div className={isTotal ? "text-slate-700 text-right font-bold" : "text-slate-700 text-right font-semibold"}>{formatValue(paper)}</div>
      <div className={isTotal ? "text-slate-700 text-right font-bold" : "text-slate-700 text-right font-semibold"}>{formatValue(esig)}</div>
      <div className={`text-right font-bold text-lg ${savingsClass}`}>
        {savings === null ? '—' : formatCurrency(savings)}
      </div>
    </div>
  );
}

function ROIMetricsSection({ metrics }: { metrics: ROIMetrics }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A]">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">ROI Summary & Payback Analysis</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Net Benefit - Year 1"
          value={formatCurrency(metrics.net_benefit_year1)}
          subtitle="Savings minus implementation"
          color="slate"
        />
        <MetricCard
          title="Year 1 ROI (%)"
          value={`${metrics.year1_roi_percent.toFixed(1)}%`}
          subtitle="First year return"
          color="slate"
        />
        <MetricCard
          title="Year 5 ROI (%)"
          value={`${metrics.year5_roi_percent.toFixed(1)}%`}
          subtitle="Cumulative 5 years"
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-600 mb-2">3 Years Net Savings</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.net_savings_3_years)}</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-600 mb-2">5 Years Net Savings</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.net_savings_5_years)}</p>
        </div>
      </div>
    </div>
  );
}

function BenefitsSection({ benefits }: { benefits: Benefits }) {
  const benefitItems = [
    { 
      icon: Zap, 
      title: 'Instant Document Signing', 
      desc: 'Zero waiting time for approvals at admission/discharge kiosks.' 
    },
    { 
      icon: FileText, 
      title: 'Pages Saved Annually', 
      desc: `${formatNumber(benefits.pages_saved_annually)} pages saved. Reduced paper & environmental impact.` 
    },
    { 
      icon: CheckCircle2, 
      title: 'Compliance & Audit Trail', 
      desc: '100% digital audit trail. NABH, ABDM compliance.' 
    },
    { 
      icon: Clock, 
      title: 'Reduced Staff Burden', 
      desc: '5 min vs 15 min per document. More time for patient care.' 
    },
    { 
      icon: AlertCircle, 
      title: 'Error Reduction', 
      desc: 'No lost signatures or missing approvals.' 
    },
    { 
      icon: Users, 
      title: 'Patient Experience', 
      desc: 'Faster onboarding and discharge. Enhanced patient satisfaction.' 
    },
    { 
      icon: Activity, 
      title: 'EMR Seamless Integration', 
      desc: 'Real-time EMR sync. Eliminates manual data entry errors.' 
    },
    { 
      icon: Building2, 
      title: 'Reduced Hospital Congestion', 
      desc: 'Faster document processing. Reduces waiting times.' 
    },
    { 
      icon: Shield, 
      title: 'Indian Evidence Act Compliance', 
      desc: 'Compliant with Section 3A. Legally valid & admissible.' 
    },
    { 
      icon: FileCheck, 
      title: 'IT Act 2000 Compliance', 
      desc: 'IT Act Section 5 compliant. Valid alternate to paper documents.' 
    },
    { 
      icon: Database, 
      title: 'DPDP Compliance Ready', 
      desc: 'Full audit trail + data residency. Reduced regulatory risks.' 
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <div className="p-2 bg-[#32BF84] rounded-lg border border-[#28A06A]">
          <Zap className="w-6 h-6 text-white" />
        </div>
        Annual Benefits (Non-Financial)
      </h2>
      <div className="space-y-3">
        {benefitItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-slate-900">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{item.title}:</span>{' '}
              <span className="text-slate-700">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  color = 'slate',
}: {
  title: string;
  value: string;
  subtitle: string;
  color?: 'slate';
}) {
  return (
    <div className="p-6 bg-slate-100 rounded-lg border border-slate-200 shadow-md text-center">
      <p className="text-sm font-semibold mb-2 text-slate-700">{title}</p>
      <p className="text-3xl font-bold mb-2" style={{ color: '#32BF84' }}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}
