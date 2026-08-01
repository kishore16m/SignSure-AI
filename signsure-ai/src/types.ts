export type DocumentType = 'pdf' | 'docx' | 'txt' | 'image';

export type RiskSeverity = 'Low' | 'Medium' | 'High';
export type OverallRiskLevel = 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';

export interface KeyDetail {
  label: string;
  value: string;
  category: 'Parties' | 'Financial' | 'Dates' | 'Jurisdiction' | 'General';
}

export interface Clause {
  id: string;
  clauseNumber?: string;
  title: string;
  originalText: string;
  simplifiedExplanation: string;
  riskLevel: RiskSeverity;
  riskReasoning: string;
  recommendation: string;
  category: 'Payment & Fees' | 'Termination & Cancellation' | 'Liability & Indemnity' | 'Intellectual Property' | 'Confidentiality' | 'Governing Law' | 'General Terms';
}

export interface ChecklistItem {
  id: string;
  item: string;
  severity: 'critical' | 'warning' | 'info';
  recommendation: string;
  isCompleted?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relevantClauseId?: string;
}

export interface DocumentAnalysis {
  id: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number;
  uploadDate: string;
  documentTitle: string;
  documentCategory: string; // e.g., "SaaS Agreement", "NDA", "Employment Contract", "Lease"
  overallRiskScore: number; // 0 - 100 (Higher means riskier)
  overallRiskLevel: OverallRiskLevel;
  executiveSummary: string;
  keyDetails: KeyDetail[];
  clauses: Clause[];
  preSigningChecklist: ChecklistItem[];
  fullText: string;
}
