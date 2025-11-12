'use client';

import { useState, useEffect } from 'react';
import { Calculator, Save, TrendingUp, DollarSign, Clock, FileText, Zap, CheckCircle2, Users, AlertCircle, Activity, Building2, Shield, FileCheck, Database } from 'lucide-react';
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
} from '@/lib/calculations';
import { saveCalculation, loadCalculations, deleteCalculation, type SavedCalculation } from '@/lib/supabase-helpers';

const DEFAULT_INPUTS: InputParams = {
  documents_per_year: 2000000,
  pages_per_document: 5,
  signatories_per_document: 2,
  staff_handling_documents: 10,
  esig_annual_cost: 15000000,
  implementation_cost: 2500000,
  implementation_timeline_months: 3,
};

export default function Home() {
  const [inputs, setInputs] = useState<InputParams>(DEFAULT_INPUTS);
  const [results, setResults] = useState<{
    annualCosts: AnnualCosts;
    roiMetrics: ROIMetrics;
    benefits: Benefits;
  } | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    loadSavedCalculations();
  }, []);

  const loadSavedCalculations = async () => {
    const calcs = await loadCalculations();
    setSavedCalculations(calcs);
  };

  const handleCalculate = () => {
    const annualCosts = calculateAnnualCosts(inputs, COST_ASSUMPTIONS);
    const roiMetrics = calculateROIMetrics(inputs, annualCosts);
    const benefits = calculateBenefits(inputs);
    setResults({ annualCosts, roiMetrics, benefits });
  };

  // Auto-calculate when inputs change (after first calculation)
  useEffect(() => {
    if (results) {
      const annualCosts = calculateAnnualCosts(inputs, COST_ASSUMPTIONS);
      const roiMetrics = calculateROIMetrics(inputs, annualCosts);
      const benefits = calculateBenefits(inputs);
      setResults({ annualCosts, roiMetrics, benefits });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  const handleSave = async () => {
    if (!saveName.trim() || !results) return;
    setIsSaving(true);
    const saved = await saveCalculation(saveName, inputs, results);
    if (saved) {
      setSaveName('');
      await loadSavedCalculations();
      setShowSaveSuccess(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowSaveSuccess(false), 5000);
    }
    setIsSaving(false);
  };

  const handleLoad = (calc: SavedCalculation) => {
    setInputs(calc.input_parameters);
    setResults(calc.calculated_results);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      await deleteCalculation(deleteConfirmId);
      await loadSavedCalculations();
      setDeleteConfirmId(null);
      setShowDeleteSuccess(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowDeleteSuccess(false), 5000);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100">
      {/* Professional Header */}
      <header className="bg-white shadow-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-lg shadow-md">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  ROI Calculator
          </h1>
                <p className="text-sm font-medium text-slate-600 mt-1">
                  Paper-Based vs E-Signature Solution • Indian Healthcare Sector
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Saved Calculations Dropdown */}
              <div className="relative group">
                <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span className="text-sm font-semibold text-slate-700">Saved ({savedCalculations.length})</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Saved Calculations</h3>
                  
                  {/* Delete Success Message */}
                  {showDeleteSuccess && (
                    <div className="mb-3 p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <p className="text-xs font-semibold text-emerald-900 flex-1">Calculation deleted successfully!</p>
                      <button
                        onClick={() => setShowDeleteSuccess(false)}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Delete Confirmation Card */}
                  {deleteConfirmId && (
                    <div className="mb-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-900 mb-2">Delete this calculation?</p>
                      <p className="text-xs text-red-700 mb-3">This action cannot be undone.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteConfirm}
                          className="flex-1 text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          className="flex-1 text-xs px-3 py-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {savedCalculations.length === 0 ? (
                      <p className="text-xs text-slate-500">No saved calculations yet</p>
                    ) : (
                      savedCalculations.map((calc) => (
                        <div
                          key={calc.id}
                          className={`p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 ${deleteConfirmId === calc.id ? 'ring-2 ring-red-300' : ''}`}
                        >
                          <p className="font-semibold text-xs text-slate-900 mb-1 truncate">{calc.session_name}</p>
                          <p className="text-xs text-slate-500 mb-2">
                            {new Date(calc.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLoad(calc)}
                              className="flex-1 text-xs px-2 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-800 font-medium transition"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteClick(calc.id)}
                              disabled={deleteConfirmId !== null}
                              className="flex-1 text-xs px-2 py-1.5 bg-slate-600 text-white rounded hover:bg-slate-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-300 rounded-full">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <span className="text-sm font-semibold text-slate-700">Live Calculator</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Input Parameters (Fixed - Doesn't scroll) */}
      <aside className="hidden lg:block fixed left-0 top-24 bottom-0 w-[420px] bg-white border-r border-slate-200 shadow-lg z-40 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
              <Calculator className="w-5 h-5 text-slate-700" />
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
              step="0.5"
            />
            <InputField
              label="Number of Staff Handling Documents"
              value={inputs.staff_handling_documents}
              onChange={(v) => setInputs({ ...inputs, staff_handling_documents: v })}
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
            <SliderField
              label="Implementation Timeline (Months)"
              value={inputs.implementation_timeline_months}
              onChange={(v) => setInputs({ ...inputs, implementation_timeline_months: v })}
              min={1}
              max={30}
              step={0.5}
              formatValue={(v) => `${v.toFixed(1)} months`}
            />
          </div>
          <button
            onClick={handleCalculate}
            className="mt-6 w-full bg-slate-800 text-white py-3 px-6 rounded-lg font-bold hover:bg-slate-900 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Calculator className="w-5 h-5 inline mr-2" />
            Calculate ROI
          </button>
        </div>
      </aside>

      {/* Right Side - Results (Scrollable) */}
      <div className="lg:pl-[420px]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="space-y-6">
            {/* Results */}
            {results ? (
              <>
                {/* Cost Breakdown */}
                <CostBreakdownSection costs={results.annualCosts} />
                
                {/* ROI Metrics */}
                <ROIMetricsSection metrics={results.roiMetrics} />
                
                {/* Cost Assumptions */}
                <AssumptionsSection />
                
                {/* Benefits */}
                <BenefitsSection benefits={results.benefits} />
                
                {/* Save Section */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                      <Save className="w-6 h-6 text-slate-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Save Calculation</h2>
                  </div>
                  
                  {/* Success Message Card */}
                  {showSaveSuccess && (
                    <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg flex items-center gap-3 transition-all duration-300">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900">Calculation saved successfully!</p>
                        <p className="text-sm text-emerald-700">Your calculation has been saved and is available in the "Saved" dropdown.</p>
                      </div>
                      <button
                        onClick={() => setShowSaveSuccess(false)}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Enter a name for this calculation"
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white text-slate-900 font-medium placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleSave}
                      disabled={!saveName.trim() || isSaving}
                      className="px-8 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {isSaving ? 'Saving...' : '💾 Save'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
                <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
              <Calculator className="w-5 h-5 text-slate-700" />
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
              step="0.5"
            />
            <InputField
              label="Number of Staff Handling Documents"
              value={inputs.staff_handling_documents}
              onChange={(v) => setInputs({ ...inputs, staff_handling_documents: v })}
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
            <SliderField
              label="Implementation Timeline (Months)"
              value={inputs.implementation_timeline_months}
              onChange={(v) => setInputs({ ...inputs, implementation_timeline_months: v })}
              min={1}
              max={30}
              step={0.5}
              formatValue={(v) => `${v.toFixed(1)} months`}
            />
          </div>
          <button
            onClick={handleCalculate}
            className="mt-6 w-full bg-slate-800 text-white py-3 px-6 rounded-lg font-bold hover:bg-slate-900 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Calculator className="w-5 h-5 inline mr-2" />
            Calculate ROI
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'number',
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type?: string;
  step?: string;
}) {
  return (
    <div className="group">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white text-slate-900 font-semibold transition-all duration-200 hover:border-slate-400 shadow-sm"
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

function CostBreakdownSection({ costs }: { costs: AnnualCosts }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
          <DollarSign className="w-6 h-6 text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Annual Cost Breakdown</h2>
      </div>

      {/* Detailed Breakdown */}
      {/* Summary Cards - Combined Total with Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700 shadow-xl">
          <p className="text-sm font-semibold mb-2 text-slate-300">Paper-Based</p>
          <p className="text-3xl font-bold text-white mb-2">{formatCurrency(costs.total_paper_cost)}</p>
          <p className="text-xs text-slate-400">Total annual cost</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700 shadow-xl">
          <p className="text-sm font-semibold mb-2 text-slate-300">E-Signature</p>
          <p className="text-3xl font-bold text-white mb-2">{formatCurrency(costs.total_esig_cost)}</p>
          <p className="text-xs text-slate-400">Total annual cost</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700 shadow-xl">
          <p className="text-sm font-semibold mb-2 text-slate-300">Annual Savings</p>
          <p className="text-3xl font-bold text-emerald-400 mb-2">{formatCurrency(costs.annual_savings)}</p>
          <p className="text-xs text-slate-400">You save this much!</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-100 rounded-lg font-semibold text-sm text-slate-800 border border-slate-200">
          <div>Cost Component</div>
          <div className="text-right">Paper-Based (₹)</div>
          <div className="text-right">E-Signature (₹)</div>
          <div className="text-right">Annual Savings (₹)</div>
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
          label="Patient Signature Denial (Opportunity Cost)"
          paper={costs.patient_denial_cost_paper}
          esig={costs.patient_denial_cost_esig}
          savings={costs.patient_denial_savings}
        />
        <CostItem
          label="Compliance, Audit & DPDP Penalties"
          paper={costs.compliance_dpdp_penalty_paper}
          esig={costs.compliance_dpdp_penalty_esig}
          savings={costs.compliance_dpdp_penalty_savings}
        />
      </div>
    </div>
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
    {
      label: 'Potential DPDP Non Compliance Penalty (Non-Compliant/Year)',
      value: formatValue(COST_ASSUMPTIONS.paper_dpdp_penalty, 'currency'),
      unit: '₹',
      notes: 'Potential DPDP Act non-compliance costs',
    },
    {
      label: 'DPDP Compliance Costs (Compliant/Year)',
      value: formatValue(COST_ASSUMPTIONS.esig_dpdp_penalty, 'currency'),
      unit: '₹',
      notes: 'Minimal compliance cost with e-signature audit trail',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
          <FileText className="w-6 h-6 text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Cost Assumptions</h2>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Industry benchmarks tailored for Indian healthcare. Values are protected to maintain consistency.
      </p>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
          <div>Cost Component</div>
          <div className="text-right">Value</div>
          <div className="text-center">Unit</div>
          <div>Notes</div>
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
}: {
  label: string;
  paper: number | null;
  esig: number | null;
  savings: number | null;
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
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="text-slate-700 text-right font-semibold">{formatValue(paper)}</div>
      <div className="text-slate-700 text-right font-semibold">{formatValue(esig)}</div>
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
        <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
          <TrendingUp className="w-6 h-6 text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">ROI Summary & Payback Analysis</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Annual Savings (Year 2+)"
          value={formatCurrency(metrics.annual_savings_year2_plus)}
          subtitle="After Year 1 implementation"
          color="slate"
        />
        <MetricCard
          title="One-Time Implementation Cost"
          value={formatCurrency(metrics.implementation_cost)}
          subtitle="Year 1 only"
          color="slate"
        />
        <MetricCard
          title="Payback Period"
          value={
            metrics.payback_period_months < 1
              ? `${metrics.payback_period_months.toFixed(2)} months`
              : metrics.payback_period_months < 12
              ? `${metrics.payback_period_months.toFixed(1)} months`
              : `${(metrics.payback_period_months / 12).toFixed(1)} years`
          }
          subtitle="Months to recover cost"
          color="slate"
        />
        <MetricCard
          title="Net Benefit - Year 1"
          value={formatCurrency(metrics.net_benefit_year1)}
          subtitle="Savings minus implementation"
          color="slate"
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Year 1 ROI (%)"
          value={`${metrics.year1_roi_percent.toFixed(1)}%`}
          subtitle="First year return"
          color="slate"
        />
        <MetricCard
          title="Year 2 ROI (%)"
          value={`${metrics.year2_roi_percent.toFixed(1)}%`}
          subtitle="Cumulative 2 years"
          color="slate"
        />
        <MetricCard
          title="Year 3 ROI (%)"
          value={`${metrics.year3_roi_percent.toFixed(1)}%`}
          subtitle="Cumulative 3 years"
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
      desc: 'Patients sign at admission/discharge kiosk. Zero waiting time for approvals.' 
    },
    { 
      icon: FileText, 
      title: 'Pages Saved Annually', 
      desc: `${formatNumber(benefits.pages_saved_annually)} pages saved. Reduced paper & environmental impact.` 
    },
    { 
      icon: CheckCircle2, 
      title: 'Compliance & Audit Trail', 
      desc: '100% digital audit trail with timestamps. NABH, ABDM compliance easier.' 
    },
    { 
      icon: Clock, 
      title: 'Reduced Staff Burden', 
      desc: '5 min vs 15 min per document. More time for patient care.' 
    },
    { 
      icon: AlertCircle, 
      title: 'Error Reduction', 
      desc: 'No lost signatures or missing approvals. Improved operational efficiency.' 
    },
    { 
      icon: Users, 
      title: 'Patient Experience', 
      desc: 'Faster onboarding and discharge process. Enhanced patient satisfaction.' 
    },
    { 
      icon: Activity, 
      title: 'EMR Seamless Integration', 
      desc: 'Real-time e-signature sync with EMR systems. Eliminates manual data entry & transcription errors.' 
    },
    { 
      icon: Building2, 
      title: 'Reduced Hospital Congestion', 
      desc: 'Faster document processing at admission/discharge. Improves patient flow & reduces waiting times.' 
    },
    { 
      icon: Shield, 
      title: 'Indian Evidence Act Compliance', 
      desc: 'Digital signatures comply with Section 3A of Indian Evidence Act. Legally valid & admissible in courts.' 
    },
    { 
      icon: FileCheck, 
      title: 'IT Act 2000 Compliance', 
      desc: 'Compliant with Indian IT Act Section 5 (electronic records). Valid alternate to paper documents.' 
    },
    { 
      icon: Database, 
      title: 'DPDP Compliance Ready', 
      desc: 'Full audit trail + data residency options. Reduced regulatory violation risks.' 
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
          <Zap className="w-6 h-6 text-slate-700" />
        </div>
        Annual Benefits (Non-Financial)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefitItems.map((item, idx) => (
          <div key={idx} className="p-6 bg-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                <item.icon className="w-6 h-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
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
    <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <p className="text-sm font-semibold mb-2 text-slate-600">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs mt-2 text-slate-500">{subtitle}</p>
    </div>
  );
}
