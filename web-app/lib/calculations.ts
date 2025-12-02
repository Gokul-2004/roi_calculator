// ROI Calculator Logic - TypeScript version

export interface InputParams {
  documents_per_year: number;
  pages_per_document: number;
  signatories_per_document: number;
  staff_handling_documents: number;
  esig_annual_cost: number;
  implementation_cost: number;
  implementation_timeline_months: number;
}

export interface CostAssumptions {
  paper_cost_per_page: number;
  storage_cost_per_doc: number;
  paper_time_per_doc: number;
  staff_hourly_cost: number;
  document_loss_rate: number;
  paper_compliance_cost: number;
  esig_time_per_doc: number;
  esig_compliance_cost: number;
  paper_dpdp_penalty: number | null;
  esig_dpdp_penalty: number | null;
}

export interface AnnualCosts {
  paper_printing: number;
  storage_filing: number;
  paper_staff_time: number;
  doc_loss_recreation: number;
  paper_compliance_audit: number;
  patient_denial_cost_paper: number | null;
  patient_denial_cost_esig: number | null;
  patient_denial_savings: number | null;
  compliance_dpdp_penalty_paper: number | null;
  compliance_dpdp_penalty_esig: number | null;
  compliance_dpdp_penalty_savings: number | null;
  total_paper_cost: number;
  esig_staff_time: number;
  esig_compliance_audit: number;
  software_subscription: number;
  total_esig_cost: number;
  annual_savings: number;
}

export interface ROIMetrics {
  annual_savings_year2_plus: number;
  implementation_cost: number;
  payback_period_months: number;
  net_benefit_year1: number;
  year1_roi_percent: number;
  year2_roi_percent: number;
  year3_roi_percent: number;
  year5_roi_percent: number;
  net_savings_3_years: number;
  net_savings_5_years: number;
}

export interface Benefits {
  pages_saved_annually: number;
}

export const COST_ASSUMPTIONS: CostAssumptions = {
  paper_cost_per_page: 0.1,
  storage_cost_per_doc: 2,
  paper_time_per_doc: 15,
  staff_hourly_cost: 120,
  document_loss_rate: 2,
  paper_compliance_cost: 100000,
  esig_time_per_doc: 2,
  esig_compliance_cost: 20000,
  paper_dpdp_penalty: null,
  esig_dpdp_penalty: null,
};

export function calculateAnnualCosts(
  inputParams: InputParams,
  costAssumptions: CostAssumptions
): AnnualCosts {
  // Safely coerce any NaN/invalid numeric inputs to 0
  const sanitize = (value: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : 0;

  const docsPerYear = sanitize(inputParams.documents_per_year);
  const pagesPerDoc = sanitize(inputParams.pages_per_document);
  const esig_annual_cost = sanitize(inputParams.esig_annual_cost);

  // Paper-Based Costs
  const paperPrinting = docsPerYear * pagesPerDoc * costAssumptions.paper_cost_per_page;
  const storageCost = docsPerYear * costAssumptions.storage_cost_per_doc;
  const paperStaffCost =
    docsPerYear * (costAssumptions.paper_time_per_doc / 60) * costAssumptions.staff_hourly_cost;
  const lossRate = costAssumptions.document_loss_rate / 100;
  const docLossCost =
    docsPerYear * lossRate * (pagesPerDoc * costAssumptions.paper_cost_per_page);
  const paperCompliance = costAssumptions.paper_compliance_cost;
  const paperDpdpPenalty = costAssumptions.paper_dpdp_penalty;

  const totalPaperCost =
    paperPrinting +
    storageCost +
    paperStaffCost +
    docLossCost +
    paperCompliance +
    (paperDpdpPenalty ?? 0);

  // E-Signature Costs
  const esigStaffCost =
    docsPerYear * (costAssumptions.esig_time_per_doc / 60) * costAssumptions.staff_hourly_cost;
  const esigCompliance = costAssumptions.esig_compliance_cost;
  const softwareSubscription = esig_annual_cost;
  const esigDpdpPenalty = costAssumptions.esig_dpdp_penalty;

  const totalEsigCost =
    esigStaffCost + esigCompliance + softwareSubscription + (esigDpdpPenalty ?? 0);
  const annualSavings = totalPaperCost - totalEsigCost;

  return {
    paper_printing: paperPrinting,
    storage_filing: storageCost,
    paper_staff_time: paperStaffCost,
    doc_loss_recreation: docLossCost,
    paper_compliance_audit: paperCompliance,
    patient_denial_cost_paper: null,
    patient_denial_cost_esig: null,
    patient_denial_savings: null,
    compliance_dpdp_penalty_paper: paperDpdpPenalty,
    compliance_dpdp_penalty_esig: esigDpdpPenalty,
    compliance_dpdp_penalty_savings:
      paperDpdpPenalty !== null && esigDpdpPenalty !== null
        ? paperDpdpPenalty - esigDpdpPenalty
        : null,
    total_paper_cost: totalPaperCost,
    esig_staff_time: esigStaffCost,
    esig_compliance_audit: esigCompliance,
    software_subscription: softwareSubscription,
    total_esig_cost: totalEsigCost,
    annual_savings: annualSavings,
  };
}

export function calculateROIMetrics(
  inputParams: InputParams,
  annualCosts: AnnualCosts
): ROIMetrics {
  const sanitize = (value: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : 0;

  const implementation_cost = sanitize(inputParams.implementation_cost);
  const esig_annual_cost = sanitize(inputParams.esig_annual_cost);
  const annual_savings = sanitize(annualCosts.annual_savings);

  // Breakeven Period:
  // =(E-Signature annual cost + Implementation cost / 5) / (Annual savings / 12)
  // i.e. months = (esig_annual_cost + implementation_cost/5) / monthly_savings
  const monthlySavings = annual_savings / 12;
  const paybackPeriod =
    monthlySavings > 0
      ? (esig_annual_cost + implementation_cost / 5) / monthlySavings
      : Infinity;
  const netBenefitYear1 = annual_savings - implementation_cost;
  
  // All ROI calculations use: Cumulative Savings / (Implementation Cost + E-Signature Annual Cost) * 100
  const totalYear1Investment = implementation_cost + esig_annual_cost;
  
  // Year 1 ROI = Annual Savings / (Implementation Cost + E-Signature Annual Cost) * 100
  const year1ROI = totalYear1Investment > 0 ? (annual_savings / totalYear1Investment) * 100 : Infinity;
  
  // Year 2 ROI = (2 * Annual Savings) / (Implementation Cost + E-Signature Annual Cost) * 100
  const year2ROI = totalYear1Investment > 0 ? ((annual_savings * 2) / totalYear1Investment) * 100 : Infinity;
  
  // Year 3 ROI = (3 * Annual Savings) / (Implementation Cost + E-Signature Annual Cost) * 100
  const year3ROI = totalYear1Investment > 0 ? ((annual_savings * 3) / totalYear1Investment) * 100 : Infinity;
  
  // Year 5 ROI = (5 * Annual Savings - Implementation Cost) / (5 * E-Signature Annual Cost + Implementation Cost) * 100
  const fiveYearNetBenefit = annual_savings * 5 - implementation_cost;
  const totalFiveYearInvestment = implementation_cost + esig_annual_cost * 5;
  const year5ROI =
    totalFiveYearInvestment > 0 ? (fiveYearNetBenefit / totalFiveYearInvestment) * 100 : Infinity;

  return {
    annual_savings_year2_plus: annual_savings,
    implementation_cost,
    payback_period_months: paybackPeriod,
    net_benefit_year1: netBenefitYear1,
    year1_roi_percent: year1ROI,
    year2_roi_percent: year2ROI,
    year3_roi_percent: year3ROI,
    year5_roi_percent: year5ROI,
    net_savings_3_years: annual_savings * 3 - implementation_cost,
    net_savings_5_years: annual_savings * 5 - implementation_cost,
  };
}

export function calculateBenefits(inputParams: InputParams): Benefits {
  return {
    pages_saved_annually: inputParams.documents_per_year * inputParams.pages_per_document,
  };
}

export function formatCurrency(value: number): string {
  const crore = 10000000; // 1 crore = 10,000,000
  const lakh = 100000; // 1 lakh = 100,000

  if (Math.abs(value) >= crore) {
    const crores = value / crore;
    return `₹ ${crores.toFixed(2)} Cr`;
  } else if (Math.abs(value) >= lakh) {
    const lakhs = value / lakh;
    return `₹ ${lakhs.toFixed(2)} L`;
  } else {
    return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

