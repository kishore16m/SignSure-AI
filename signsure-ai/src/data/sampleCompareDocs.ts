import { DocumentAnalysis } from '../types';

export const SAMPLE_DOC_A: DocumentAnalysis = {
  id: 'doc-sample-v1',
  fileName: 'Vendor_MSA_v1_Draft.pdf',
  fileType: 'pdf',
  fileSize: 2450000,
  uploadDate: '2026-07-28',
  documentTitle: 'Master Services Agreement v1 (Original Draft)',
  documentCategory: 'SaaS & Services Agreement',
  overallRiskScore: 78,
  overallRiskLevel: 'High Risk',
  executiveSummary: 'This initial vendor draft contains aggressive indemnity obligations, uncapped liability on your part, auto-renewal with a 15% annual fee hike, and immediate forfeiture of all IP rights.',
  keyDetails: [
    { label: 'Contracting Parties', value: 'ApexTech Solutions LLC & Client Inc.', category: 'Parties' },
    { label: 'Annual Contract Value', value: '$120,000 / year (Billed Annually Upfront)', category: 'Financial' },
    { label: 'Notice Period for Cancellation', value: '90 days prior to auto-renewal', category: 'Dates' },
    { label: 'Liability Cap', value: 'Uncapped for Client; $10,000 for Vendor', category: 'Financial' },
    { label: 'Governing Law', value: 'State of Delaware (Delaware Courts)', category: 'Jurisdiction' },
  ],
  clauses: [
    {
      id: 'c1-v1',
      clauseNumber: 'Section 3.1',
      title: 'Automatic Renewal & Fee Escalation',
      originalText: 'This Agreement shall automatically renew for successive twelve (12) month terms unless Client provides written notice of non-renewal at least ninety (90) days prior to the expiration of the current term. Upon renewal, fees shall automatically increase by 15% per annum.',
      simplifiedExplanation: 'If you miss the 90-day cancellation window, you are locked in for another full year at a 15% higher price tag with no price negotiation.',
      riskLevel: 'High',
      riskReasoning: 'A 90-day notice window is unusually long, and an automatic 15% yearly increase compounds quickly above standard inflation rates.',
      recommendation: 'Reduce notice period to 30 days and cap annual fee increases at 3% or CPI index.',
      category: 'Payment & Fees',
    },
    {
      id: 'c2-v1',
      clauseNumber: 'Section 6.2',
      title: 'Limitation of Liability & Asymmetry',
      originalText: 'In no event shall Vendor liability exceed $10,000 in the aggregate. Client agrees to indemnify and hold Vendor harmless against any third-party claims without limit.',
      simplifiedExplanation: 'Vendor limits its total liability to just $10,000 if they break your systems, while forcing you to pay unlimited costs if a third party sues.',
      riskLevel: 'High',
      riskReasoning: 'Severe one-sided risk allocation exposing your firm to infinite third-party liability while shielding the vendor.',
      recommendation: 'Make liability caps mutual equal to 12 months of fees paid, with standard carve-outs for gross negligence.',
      category: 'Liability & Indemnity',
    },
    {
      id: 'c3-v1',
      clauseNumber: 'Section 8.4',
      title: 'Intellectual Property Ownership',
      originalText: 'All custom configurations, reports, integrations, and work product developed under this agreement shall be the sole and exclusive property of Vendor.',
      simplifiedExplanation: 'Any custom tools or integrations built for your business belong entirely to the vendor, preventing you from reusing them if you leave.',
      riskLevel: 'High',
      riskReasoning: 'You pay for custom work product but receive no ownership or perpetual license rights.',
      recommendation: 'Specify that custom integrations and client data outputs remain the exclusive IP of Client.',
      category: 'Intellectual Property',
    },
    {
      id: 'c4-v1',
      clauseNumber: 'Section 11.1',
      title: 'Termination for Convenience',
      originalText: 'Vendor may terminate this Agreement at any time upon 15 days written notice without penalty. Client may not terminate for convenience prior to expiration.',
      simplifiedExplanation: 'Vendor can walk away on 15 days notice, but you are trapped until the end of the term even if service is unsatisfactory.',
      riskLevel: 'High',
      riskReasoning: 'Unequal termination rights leave your operations vulnerable to sudden vendor withdrawal.',
      recommendation: 'Require mutual 30-day notice for termination for convenience with pro-rata fee refund.',
      category: 'Termination & Cancellation',
    },
    {
      id: 'c5-v1',
      clauseNumber: 'Section 14.3',
      title: 'Governing Law & Dispute Venue',
      originalText: 'This Agreement shall be governed by Delaware law and all legal proceedings must take place exclusively in Wilmington, Delaware.',
      simplifiedExplanation: 'Any legal dispute must be litigated in Delaware state courts, requiring out-of-state legal representation.',
      riskLevel: 'Medium',
      riskReasoning: 'Standard choice of venue but adds travel and legal friction if your business operates in another state.',
      recommendation: 'Acceptable if Delaware, or negotiate for mutual local arbitration.',
      category: 'Governing Law',
    },
  ],
  preSigningChecklist: [
    {
      id: 'chk-1-v1',
      item: 'Renegotiate Uncapped Liability Indemnity Clause',
      severity: 'critical',
      recommendation: 'Cap indemnity at $1M or 2x contract value before signing.',
    },
    {
      id: 'chk-2-v1',
      item: 'Shorten Auto-Renewal Notice Window',
      severity: 'warning',
      recommendation: 'Change 90 days notice requirement down to 30 days in Section 3.1.',
    },
    {
      id: 'chk-3-v1',
      item: 'Retain IP Rights for Custom Integrations',
      severity: 'critical',
      recommendation: 'Add clause ensuring Client retains full IP for bespoke connectors.',
    },
  ],
  fullText: `MASTER SERVICES AGREEMENT (V1 - ORIGINAL)

Section 3.1 Automatic Renewal & Fee Escalation: This Agreement shall automatically renew for successive twelve (12) month terms unless Client provides written notice of non-renewal at least ninety (90) days prior to the expiration of the current term. Upon renewal, fees shall automatically increase by 15% per annum.

Section 6.2 Limitation of Liability & Asymmetry: In no event shall Vendor liability exceed $10,000 in the aggregate. Client agrees to indemnify and hold Vendor harmless against any third-party claims without limit.

Section 8.4 Intellectual Property Ownership: All custom configurations, reports, integrations, and work product developed under this agreement shall be the sole and exclusive property of Vendor.

Section 11.1 Termination for Convenience: Vendor may terminate this Agreement at any time upon 15 days written notice without penalty. Client may not terminate for convenience prior to expiration.

Section 14.3 Governing Law: This Agreement shall be governed by Delaware law and all legal proceedings must take place exclusively in Wilmington, Delaware.`,
};

export const SAMPLE_DOC_B: DocumentAnalysis = {
  id: 'doc-sample-v2',
  fileName: 'Vendor_MSA_v2_Negotiated.pdf',
  fileType: 'pdf',
  fileSize: 2510000,
  uploadDate: '2026-07-30',
  documentTitle: 'Master Services Agreement v2 (Negotiated Counter-Offer)',
  documentCategory: 'SaaS & Services Agreement',
  overallRiskScore: 32,
  overallRiskLevel: 'Moderate Risk',
  executiveSummary: 'This updated version substantially reduces risk for your organization. Auto-renewal notice was reduced to 30 days with a 3% price cap, liability is capped mutually at 12 months fees, and custom IP is assigned to Client.',
  keyDetails: [
    { label: 'Contracting Parties', value: 'ApexTech Solutions LLC & Client Inc.', category: 'Parties' },
    { label: 'Annual Contract Value', value: '$115,000 / year (Billed Quarterly)', category: 'Financial' },
    { label: 'Notice Period for Cancellation', value: '30 days prior to renewal', category: 'Dates' },
    { label: 'Liability Cap', value: 'Mutual Cap equal to 12 months total fees', category: 'Financial' },
    { label: 'Governing Law', value: 'State of Delaware (Delaware Courts)', category: 'Jurisdiction' },
  ],
  clauses: [
    {
      id: 'c1-v2',
      clauseNumber: 'Section 3.1',
      title: 'Automatic Renewal & Fee Escalation',
      originalText: 'This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least thirty (30) days prior to term expiration. Fee adjustments upon renewal shall not exceed 3% per annum.',
      simplifiedExplanation: 'Cancellation notice is now reasonable at 30 days, and annual price increases are hard-capped at 3%.',
      riskLevel: 'Low',
      riskReasoning: 'Standard industry balanced terms protecting against sudden price surges.',
      recommendation: 'Acceptable as drafted.',
      category: 'Payment & Fees',
    },
    {
      id: 'c2-v2',
      clauseNumber: 'Section 6.2',
      title: 'Limitation of Liability & Asymmetry',
      originalText: 'Except for gross negligence or willful misconduct, each party’s maximum aggregate liability shall be capped at the total fees paid by Client during the preceding twelve (12) months.',
      simplifiedExplanation: 'Liability is now completely mutual and capped at 1 year of contract fees for both parties.',
      riskLevel: 'Low',
      riskReasoning: 'Balanced risk distribution with appropriate caps protecting both sides.',
      recommendation: 'Acceptable as drafted.',
      category: 'Liability & Indemnity',
    },
    {
      id: 'c3-v2',
      clauseNumber: 'Section 8.4',
      title: 'Intellectual Property Ownership',
      originalText: 'Vendor retains pre-existing platform IP. However, all bespoke software code, custom connectors, and client datasets created for Client shall be irrevocably assigned to Client upon payment.',
      simplifiedExplanation: 'You now own all custom integrations and reports built specifically for your project.',
      riskLevel: 'Low',
      riskReasoning: 'Protects client capital investment in custom workflows.',
      recommendation: 'Acceptable as drafted.',
      category: 'Intellectual Property',
    },
    {
      id: 'c4-v2',
      clauseNumber: 'Section 11.1',
      title: 'Termination for Convenience',
      originalText: 'Either party may terminate this Agreement for convenience upon sixty (60) days written notice, with pro-rata refund of prepaid unearned fees.',
      simplifiedExplanation: 'Both sides have equal right to exit with 60 days notice and a refund for unused prepaid months.',
      riskLevel: 'Medium',
      riskReasoning: '60 days notice is fair, though 30 days is slightly more flexible for sudden project pivots.',
      recommendation: 'Acceptable, or request 30 days if rapid operational mobility is needed.',
      category: 'Termination & Cancellation',
    },
    {
      id: 'c5-v2',
      clauseNumber: 'Section 14.3',
      title: 'Governing Law & Dispute Venue',
      originalText: 'This Agreement shall be governed by Delaware law and all legal proceedings must take place exclusively in Wilmington, Delaware.',
      simplifiedExplanation: 'Dispute jurisdiction remains in Delaware courts.',
      riskLevel: 'Medium',
      riskReasoning: 'Standard commercial governing law clause.',
      recommendation: 'Acceptable.',
      category: 'Governing Law',
    },
  ],
  preSigningChecklist: [
    {
      id: 'chk-1-v2',
      item: 'Verify Quarterly Billing Schedule in System',
      severity: 'info',
      recommendation: 'Ensure accounting sets up quarterly invoices instead of annual upfront payment.',
    },
    {
      id: 'chk-2-v2',
      item: 'Confirm 30-Day Calendar Reminder for Renewal',
      severity: 'info',
      recommendation: 'Set calendar reminder 45 days ahead to review vendor performance before 30-day notice cutoff.',
    },
  ],
  fullText: `MASTER SERVICES AGREEMENT (V2 - NEGOTIATED)

Section 3.1 Automatic Renewal & Fee Escalation: This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides written notice of non-renewal at least thirty (30) days prior to term expiration. Fee adjustments upon renewal shall not exceed 3% per annum.

Section 6.2 Limitation of Liability & Asymmetry: Except for gross negligence or willful misconduct, each party’s maximum aggregate liability shall be capped at the total fees paid by Client during the preceding twelve (12) months.

Section 8.4 Intellectual Property Ownership: Vendor retains pre-existing platform IP. However, all bespoke software code, custom connectors, and client datasets created for Client shall be irrevocably assigned to Client upon payment.

Section 11.1 Termination for Convenience: Either party may terminate this Agreement for convenience upon sixty (60) days written notice, with pro-rata refund of prepaid unearned fees.

Section 14.3 Governing Law: This Agreement shall be governed by Delaware law and all legal proceedings must take place exclusively in Wilmington, Delaware.`,
};
