import { DocumentAnalysis } from '../types';

export const SAMPLE_DOCUMENTS: DocumentAnalysis[] = [
  {
    id: 'sample-freelance-contract',
    fileName: 'Freelance_Developer_Agreement.pdf',
    fileType: 'pdf',
    fileSize: 245000,
    uploadDate: '2026-07-30',
    documentTitle: 'Master Services Agreement & IP Transfer',
    documentCategory: 'Freelance Contract',
    overallRiskScore: 78,
    overallRiskLevel: 'High Risk',
    executiveSummary: 'This freelance contract contains extremely aggressive terms against the contractor, including full assignment of all past and future personal IP, an unlimited indemnification clause, a strict 2-year non-compete, and a 90-day post-termination payment delay.',
    keyDetails: [
      { label: 'Contracting Parties', value: 'Apex Global Technologies Inc. & John Doe', category: 'Parties' },
      { label: 'Payment Terms', value: 'Net 90 days after invoice approval', category: 'Financial' },
      { label: 'Contract Duration', value: '12 Months (Auto-renews unless 60 days notice)', category: 'Dates' },
      { label: 'Governing Law', value: 'State of Delaware, USA', category: 'Jurisdiction' },
      { label: 'Liability Limit', value: 'Contractor liable up to $1,000,000; Client liability capped at $500', category: 'Financial' }
    ],
    fullText: `MASTER SERVICES AGREEMENT

1. INTELLECTUAL PROPERTY ASSIGNMENT
The Contractor hereby assigns to Client all right, title, and interest in and to all inventions, code, designs, and intellectual property created by Contractor prior to, during, or up to 12 months after the term of this Agreement, whether created on Client's devices or personal hardware.

2. PAYMENT & INVOICING
Client shall pay Contractor within 90 calendar days after written approval of the monthly invoice. Client reserves the right to withhold payment indefinitely if Client determines, in its sole discretion, that deliverables require revisions.

3. INDEMNIFICATION & LIABILITY
Contractor agrees to indemnify, defend, and hold harmless Client, its officers, directors, and employees from any claims, damages, losses, or legal fees up to $1,000,000. Client's maximum cumulative liability under this agreement shall not exceed $500.

4. NON-COMPETE & NON-SOLICITATION
During the term of this Agreement and for a period of two (2) years thereafter, Contractor shall not directly or indirectly provide software engineering services to any company operating in the technology sector worldwide.

5. TERMINATION FOR CONVENIENCE
Client may terminate this Agreement immediately at any time without cause or prior notice. Contractor must provide at least sixty (60) days written notice of intent to terminate.`,
    clauses: [
      {
        id: 'c-1',
        clauseNumber: 'Section 1',
        title: 'Overbroad Intellectual Property Seizure',
        originalText: 'The Contractor hereby assigns to Client all right, title, and interest in and to all inventions, code, designs, and intellectual property created by Contractor prior to, during, or up to 12 months after the term of this Agreement...',
        simplifiedExplanation: 'The client claims ownership of everything you built in the past, everything you build during this contract, and anything you build for 1 year AFTER the contract ends, even on your personal computer.',
        riskLevel: 'High',
        riskReasoning: 'This steals your past personal projects and future side projects outside of working hours.',
        recommendation: 'Negotiate to limit IP assignment strictly to deliverables created during paid working hours for this project only.',
        category: 'Intellectual Property'
      },
      {
        id: 'c-2',
        clauseNumber: 'Section 2',
        title: 'Excessive Net-90 Payment Delay & Unilateral Withholding',
        originalText: 'Client shall pay Contractor within 90 calendar days after written approval of the monthly invoice. Client reserves the right to withhold payment indefinitely...',
        simplifiedExplanation: 'You might wait 3 months to get paid, and the client can refuse to pay at their own discretion if they claim they want changes.',
        riskLevel: 'High',
        riskReasoning: 'Creates severe cash-flow risks and gives the client leverage to avoid paying for completed work.',
        recommendation: 'Change payment terms to Net-15 or Net-30, and add a late fee clause (e.g., 1.5% per month). Remove unilateral withholding.',
        category: 'Payment & Fees'
      },
      {
        id: 'c-3',
        clauseNumber: 'Section 3',
        title: 'Unbalanced One-Sided Indemnification & Liability Cap',
        originalText: 'Contractor agrees to indemnify... up to $1,000,000. Client\'s maximum cumulative liability under this agreement shall not exceed $500.',
        simplifiedExplanation: 'If something goes wrong, you could be sued for up to $1,000,000, while the client\'s liability to you is capped at just $500.',
        riskLevel: 'High',
        riskReasoning: 'Exposes you to bankrupting financial liability while shielding the client completely.',
        recommendation: 'Mutualize liability capped at the total fees paid under the agreement in the last 6 months.',
        category: 'Liability & Indemnity'
      },
      {
        id: 'c-4',
        clauseNumber: 'Section 4',
        title: 'Worldwide 2-Year Non-Compete Bar',
        originalText: 'During the term... and for a period of two (2) years thereafter, Contractor shall not directly or indirectly provide software engineering services to any company operating in the technology sector worldwide.',
        simplifiedExplanation: 'You are legally barred from taking any tech job anywhere in the world for 2 whole years after leaving.',
        riskLevel: 'High',
        riskReasoning: 'Virtually unenforceable in states like California, but poses severe legal harassment risks.',
        recommendation: 'Strike out the non-compete clause entirely, or narrow it strictly to direct competitors in a 10-mile radius for 3 months.',
        category: 'Termination & Cancellation'
      },
      {
        id: 'c-5',
        clauseNumber: 'Section 5',
        title: 'Asymmetric Termination Notice',
        originalText: 'Client may terminate this Agreement immediately... Contractor must provide at least sixty (60) days written notice...',
        simplifiedExplanation: 'The client can fire you instantly on the spot, but you must give them 2 months advance notice to quit.',
        riskLevel: 'Medium',
        riskReasoning: 'Unfair leverage during working relationships.',
        recommendation: 'Request mutual 14-day or 30-day written notice for termination by either party.',
        category: 'Termination & Cancellation'
      }
    ],
    preSigningChecklist: [
      {
        id: 'chk-1',
        item: 'Fix IP Scope: Restrict IP transfer strictly to paid client deliverables.',
        severity: 'critical',
        recommendation: 'Do not sign until section 1 explicitly excludes personal hardware, pre-existing IP, and post-termination side projects.'
      },
      {
        id: 'chk-2',
        item: 'Cap Liability: Set mutual maximum liability equal to fees collected.',
        severity: 'critical',
        recommendation: 'Strike the $1M contractor liability cap and $500 client cap limit.'
      },
      {
        id: 'chk-3',
        item: 'Remove Global Tech Non-Compete.',
        severity: 'critical',
        recommendation: 'Eliminate 2-year non-compete to protect your future employment rights.'
      },
      {
        id: 'chk-4',
        item: 'Shorten Net-90 Payment Window to Net-30.',
        severity: 'warning',
        recommendation: 'Ensure steady cashflow and remove unilateral payment withholding clauses.'
      }
    ]
  },
  {
    id: 'sample-saas-agreement',
    fileName: 'Enterprise_SaaS_Terms.pdf',
    fileType: 'pdf',
    fileSize: 310000,
    uploadDate: '2026-07-30',
    documentTitle: 'SaaS Enterprise Subscription & Data Processing License',
    documentCategory: 'SaaS Agreement',
    overallRiskScore: 42,
    overallRiskLevel: 'Moderate Risk',
    executiveSummary: 'Standard enterprise software agreement with moderate commercial risks, including auto-renewal with a 15% price bump, data retraining permissions, and limited service level agreements (SLA).',
    keyDetails: [
      { label: 'Annual Subscription Value', value: '$48,000 / year', category: 'Financial' },
      { label: 'Auto-Renewal Notice Window', value: '30 days prior to term expiration', category: 'Dates' },
      { label: 'Uptime SLA Commitment', value: '99.5% uptime (excluding maintenance)', category: 'General' },
      { label: 'Data Usage', value: 'Vendor retains right to train internal AI models on customer data', category: 'General' }
    ],
    fullText: `ENTERPRISE SOFTWARE SUBSCRIPTION AGREEMENT

1. TERM & AUTOMATIC RENEWAL
This Agreement shall commence on the Effective Date and continue for an initial period of twelve (12) months. The Agreement will automatically renew for successive 12-month periods at vendor's standard list price (+15% annual cap increase) unless either party provides written non-renewal notice at least thirty (30) days prior.

2. DATA PRIVACY & MODEL TRAINING
Customer retains ownership of proprietary Customer Data. However, Customer grants Vendor a non-exclusive, worldwide, royalty-free license to ingest, process, and use aggregated Customer Data to fine-tune Vendor's artificial intelligence algorithms and machine learning models.

3. LIMITATION OF LIABILITY
Neither party shall be liable for indirect, incidental, or consequential damages. Vendor's total liability under this Agreement shall be limited to the amount paid by Customer in the three (3) months preceding the event giving rise to liability.`,
    clauses: [
      {
        id: 'saas-1',
        clauseNumber: 'Section 1',
        title: 'Auto-Renewal with 15% Annual Price Escalation',
        originalText: 'The Agreement will automatically renew for successive 12-month periods at vendor\'s standard list price (+15% annual cap increase) unless either party provides written non-renewal notice at least thirty (30) days prior.',
        simplifiedExplanation: 'If you forget to cancel 30 days before the contract ends, you automatically get locked into another full year at a 15% higher price.',
        riskLevel: 'Medium',
        riskReasoning: 'Unmonitored auto-renewals lead to unexpected recurring budget costs.',
        recommendation: 'Set a calendar alert for 60 days before expiration, and cap annual price increases to max 5% or CPI.',
        category: 'Payment & Fees'
      },
      {
        id: 'saas-2',
        clauseNumber: 'Section 2',
        title: 'Grant of AI Model Training License on Company Data',
        originalText: 'Customer grants Vendor a non-exclusive, worldwide, royalty-free license to ingest, process, and use aggregated Customer Data to fine-tune Vendor\'s artificial intelligence algorithms...',
        simplifiedExplanation: 'The vendor can use your business data to train their AI models, which could indirectly leak your competitive insights.',
        riskLevel: 'High',
        riskReasoning: 'Exposes sensitive company data or trade secrets to machine learning dataset ingestion.',
        recommendation: 'Request an explicit opt-out clause stating Customer Data shall never be used for machine learning or model training.',
        category: 'Confidentiality'
      },
      {
        id: 'saas-3',
        clauseNumber: 'Section 3',
        title: 'Short 3-Month Liability Cap for Vendor',
        originalText: 'Vendor\'s total liability under this Agreement shall be limited to the amount paid by Customer in the three (3) months preceding the event...',
        simplifiedExplanation: 'If the vendor suffers a huge data breach or service outage, you can at most recover 3 months of subscription fees.',
        riskLevel: 'Low',
        riskReasoning: 'Standard for SaaS, but 12-month liability caps offer better corporate protection.',
        recommendation: 'Increase liability cap to 12 months of total contract value.',
        category: 'Liability & Indemnity'
      }
    ],
    preSigningChecklist: [
      {
        id: 'saas-chk-1',
        item: 'Opt out of AI Model Training on company data.',
        severity: 'critical',
        recommendation: 'Ensure your confidential business data is excluded from vendor LLM training pools.'
      },
      {
        id: 'saas-chk-2',
        item: 'Cap annual auto-renewal price increase to 5%.',
        severity: 'warning',
        recommendation: 'Avoid unexpected 15% price jumps upon renewal.'
      }
    ]
  },
  {
    id: 'sample-residential-lease',
    fileName: 'Residential_Lease_Agreement.pdf',
    fileType: 'pdf',
    fileSize: 180000,
    uploadDate: '2026-07-30',
    documentTitle: 'Standard Residential Lease & Maintenance Covenant',
    documentCategory: 'Residential Lease',
    overallRiskScore: 28,
    overallRiskLevel: 'Low Risk',
    executiveSummary: 'Fairly standard residential apartment lease with minor tenant obligations regarding repair minimums, security deposit return windows, and entry notification terms.',
    keyDetails: [
      { label: 'Monthly Rent', value: '$2,450 / month', category: 'Financial' },
      { label: 'Security Deposit', value: '$3,675 (1.5x monthly rent)', category: 'Financial' },
      { label: 'Lease Duration', value: '12 Months (Fixed term)', category: 'Dates' },
      { label: 'Landlord Entry Notice', value: '24 hours advance written notice required', category: 'General' }
    ],
    fullText: `RESIDENTIAL LEASE AGREEMENT

1. SECURITY DEPOSIT RETURN
Landlord shall return the Security Deposit to Tenant within forty-five (45) days of move-out, minus deductions for unpaid utilities or repairs exceeding normal wear and tear.

2. TENANT REPAIR OBLIGATION
Tenant is responsible for covering the first $150 of any plumbing, HVAC, or appliance repair costs incurred during tenancy, regardless of cause.

3. ENTRY BY LANDLORD
Landlord reserves the right to enter the premises upon 24-hour notification for inspections or repairs. In cases of emergency, prior notice is waived.`,
    clauses: [
      {
        id: 'lease-1',
        clauseNumber: 'Section 2',
        title: 'Tenant Mandatory Deductible on Appliance Repairs',
        originalText: 'Tenant is responsible for covering the first $150 of any plumbing, HVAC, or appliance repair costs incurred during tenancy, regardless of cause.',
        simplifiedExplanation: 'Every time the fridge, heater, or pipes break through no fault of your own, you have to pay $150 out of pocket.',
        riskLevel: 'Medium',
        riskReasoning: 'Shifts maintenance costs of aging building systems onto the tenant.',
        recommendation: 'Request that repairs caused by normal wear & tear or structural age be 100% paid by landlord.',
        category: 'Payment & Fees'
      }
    ],
    preSigningChecklist: [
      {
        id: 'lease-chk-1',
        item: 'Confirm 24-hour landlord entry notice is strictly enforced.',
        severity: 'info',
        recommendation: 'Standard privacy clause is well protected.'
      },
      {
        id: 'lease-chk-2',
        item: 'Negotiate removal of $150 tenant repair deductible.',
        severity: 'warning',
        recommendation: 'Maintenance of building hardware should remain landlord responsibility.'
      }
    ]
  }
];
