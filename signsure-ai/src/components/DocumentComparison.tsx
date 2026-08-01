import React, { useState } from 'react';
import { DocumentAnalysis, Clause, KeyDetail, ChecklistItem } from '../types';
import {
  Scale,
  ArrowRightLeft,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  Camera
} from 'lucide-react';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '../data/sampleCompareDocs';
import { CameraScannerModal } from './CameraScannerModal';

interface DocumentComparisonProps {
  onAnalyzeFile: (file: File, target: 'docA' | 'docB') => Promise<DocumentAnalysis | null>;
  onAnalyzeRawText: (title: string, text: string, target: 'docA' | 'docB') => Promise<DocumentAnalysis | null>;
  docA: DocumentAnalysis | null;
  docB: DocumentAnalysis | null;
  setDocA: React.Dispatch<React.SetStateAction<DocumentAnalysis | null>>;
  setDocB: React.Dispatch<React.SetStateAction<DocumentAnalysis | null>>;
  isAnalyzingA: boolean;
  isAnalyzingB: boolean;
  onOpenChatWithComparison?: (docA: DocumentAnalysis, docB: DocumentAnalysis) => void;
}

export const DocumentComparison: React.FC<DocumentComparisonProps> = ({
  onAnalyzeFile,
  onAnalyzeRawText,
  docA,
  docB,
  setDocA,
  setDocB,
  isAnalyzingA,
  isAnalyzingB,
  onOpenChatWithComparison,
}) => {
  const [cameraTarget, setCameraTarget] = useState<'docA' | 'docB' | null>(null);
  const [textInputA, setTextInputA] = useState('');
  const [titleInputA, setTitleInputA] = useState('');
  const [textInputB, setTextInputB] = useState('');
  const [titleInputB, setTitleInputB] = useState('');
  const [activeTab, setActiveTab] = useState<'clauses' | 'keyterms' | 'checklist'>('clauses');
  const [filterDiffOnly, setFilterDiffOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [expandedClauseIds, setExpandedClauseIds] = useState<Set<string>>(new Set());

  // Quick load sample pair
  const handleLoadSamplePair = () => {
    setDocA(SAMPLE_DOC_A);
    setDocB(SAMPLE_DOC_B);
  };

  // Swap Left & Right docs
  const handleSwapDocs = () => {
    const temp = docA;
    setDocA(docB);
    setDocB(temp);
  };

  // Handle Drag & Drop / File Select for Doc A
  const handleFileChangeA = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyzeFile(e.target.files[0], 'docA');
    }
  };

  // Handle Drag & Drop / File Select for Doc B
  const handleFileChangeB = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyzeFile(e.target.files[0], 'docB');
    }
  };

  const handleTextSubmitA = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInputA.trim()) {
      onAnalyzeRawText(titleInputA || 'Document A Text', textInputA, 'docA');
    }
  };

  const handleTextSubmitB = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInputB.trim()) {
      onAnalyzeRawText(titleInputB || 'Document B Text', textInputB, 'docB');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedClauseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Risk Score Delta calculation
  const riskDelta = docA && docB ? docB.overallRiskScore - docA.overallRiskScore : 0;
  const isScoreImproved = riskDelta < 0; // lower risk score is better

  // Clause matching and categorization
  const getMatchedClauses = () => {
    if (!docA || !docB) return [];

    const allCategories = Array.from(
      new Set([
        ...docA.clauses.map((c) => c.category),
        ...docB.clauses.map((c) => c.category),
      ])
    );

    const pairedClauses: Array<{
      category: string;
      title: string;
      clauseA: Clause | null;
      clauseB: Clause | null;
      status: 'improved' | 'worsened' | 'modified' | 'identical' | 'added' | 'removed';
    }> = [];

    // Helper risk level to numeric
    const riskVal = (level?: string) => (level === 'High' ? 3 : level === 'Medium' ? 2 : level === 'Low' ? 1 : 0);

    // Collect all titles from both docs
    const processedBIds = new Set<string>();

    docA.clauses.forEach((cA) => {
      // Find matching clause in B by title or category
      const cB = docB.clauses.find(
        (b) =>
          !processedBIds.has(b.id) &&
          (b.category === cA.category ||
            b.title.toLowerCase().includes(cA.title.toLowerCase().split(' ')[0]) ||
            cA.title.toLowerCase().includes(b.title.toLowerCase().split(' ')[0]))
      );

      if (cB) {
        processedBIds.add(cB.id);
        const rA = riskVal(cA.riskLevel);
        const rB = riskVal(cB.riskLevel);

        let status: 'improved' | 'worsened' | 'modified' | 'identical' = 'modified';
        if (rB < rA) status = 'improved';
        else if (rB > rA) status = 'worsened';
        else if (cA.originalText === cB.originalText) status = 'identical';
        else status = 'modified';

        pairedClauses.push({
          category: cA.category,
          title: cA.title || cB.title,
          clauseA: cA,
          clauseB: cB,
          status,
        });
      } else {
        pairedClauses.push({
          category: cA.category,
          title: cA.title,
          clauseA: cA,
          clauseB: null,
          status: 'removed',
        });
      }
    });

    // Unmatched clauses in B (Added)
    docB.clauses.forEach((cB) => {
      if (!processedBIds.has(cB.id)) {
        pairedClauses.push({
          category: cB.category,
          title: cB.title,
          clauseA: null,
          clauseB: cB,
          status: 'added',
        });
      }
    });

    return pairedClauses;
  };

  const matchedClauses = getMatchedClauses();

  // Filter clauses by search & difference toggle
  const filteredMatchedClauses = matchedClauses.filter((pair) => {
    if (filterDiffOnly && pair.status === 'identical') return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchA =
        pair.clauseA?.title.toLowerCase().includes(term) ||
        pair.clauseA?.simplifiedExplanation.toLowerCase().includes(term) ||
        pair.clauseA?.originalText.toLowerCase().includes(term);
      const matchB =
        pair.clauseB?.title.toLowerCase().includes(term) ||
        pair.clauseB?.simplifiedExplanation.toLowerCase().includes(term) ||
        pair.clauseB?.originalText.toLowerCase().includes(term);
      return matchA || matchB;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Controls Banner */}
      <div className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 border border-slate-800 dark:border-white/10 light:border-slate-200 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 light:border-slate-200">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/25 px-3 py-1 rounded-full text-xs font-bold text-indigo-400 light:text-indigo-600 mb-2">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Side-by-Side Delta Analyzer</span>
            </div>
            <h2 className="text-xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight">
              Compare Two Contracts Side-by-Side
            </h2>
            <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 mt-1">
              Compare baseline contract drafts against revised counter-offers to spot risk reductions, clause revisions, and hidden changes.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <button
              onClick={handleLoadSamplePair}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Load Sample Comparison Pair</span>
            </button>

            {docA && docB && (
              <>
                <button
                  onClick={handleSwapDocs}
                  className="px-3.5 py-2.5 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 light:hover:bg-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-semibold rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 transition flex items-center space-x-1.5 shadow-sm"
                  title="Swap left and right positions"
                >
                  <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                  <span>Swap Positions</span>
                </button>

                {onOpenChatWithComparison && (
                  <button
                    onClick={() => onOpenChatWithComparison(docA, docB)}
                    className="px-3.5 py-2.5 bg-indigo-600/20 light:bg-indigo-50 hover:bg-indigo-600/30 text-indigo-300 dark:text-indigo-300 light:text-indigo-800 text-xs font-bold rounded-xl border border-indigo-500/30 light:border-indigo-200 transition flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>Ask AI to Compare</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Upload Dropzones or Active Document Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document A (Baseline / Left) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 light:text-indigo-600 flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Document A (Baseline / Version 1)</span>
              </span>
              {docA && (
                <button
                  onClick={() => setDocA(null)}
                  className="text-[11px] font-semibold text-rose-400 hover:underline"
                >
                  Replace Doc A
                </button>
              )}
            </div>

            {docA ? (
              <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-white/10 light:border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-inner">
                <div>
                  <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 truncate max-w-[220px]">
                    {docA.documentTitle}
                  </h4>
                  <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
                    {docA.fileName} • {docA.clauses.length} Clauses
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-lg font-black block ${
                      docA.overallRiskScore > 60
                        ? 'text-rose-400'
                        : docA.overallRiskScore > 30
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {docA.overallRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{docA.overallRiskLevel}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border-2 border-dashed border-slate-800 dark:border-white/10 light:border-slate-300 rounded-2xl p-5 text-center space-y-3">
                {isAnalyzingA ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                    <span className="text-xs font-semibold text-slate-300">Analyzing Document A...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800">
                        Upload Document A (Baseline Draft)
                      </p>
                      <p className="text-[11px] text-slate-400">PDF, DOCX, TXT, or Image</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <label className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer shadow-sm transition">
                        Select File
                        <input type="file" onChange={handleFileChangeA} accept=".pdf,.docx,.txt,image/*" className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCameraTarget('docA')}
                        className="inline-flex items-center space-x-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 dark:text-emerald-300 light:text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Scan Camera</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Document B (Revised / Right) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 light:text-purple-600 flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Document B (Revised / Counter-Proposal)</span>
              </span>
              {docB && (
                <button
                  onClick={() => setDocB(null)}
                  className="text-[11px] font-semibold text-rose-400 hover:underline"
                >
                  Replace Doc B
                </button>
              )}
            </div>

            {docB ? (
              <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-white/10 light:border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-inner">
                <div>
                  <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 truncate max-w-[220px]">
                    {docB.documentTitle}
                  </h4>
                  <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
                    {docB.fileName} • {docB.clauses.length} Clauses
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-lg font-black block ${
                      docB.overallRiskScore > 60
                        ? 'text-rose-400'
                        : docB.overallRiskScore > 30
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {docB.overallRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{docB.overallRiskLevel}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border-2 border-dashed border-slate-800 dark:border-white/10 light:border-slate-300 rounded-2xl p-5 text-center space-y-3">
                {isAnalyzingB ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                    <span className="text-xs font-semibold text-slate-300">Analyzing Document B...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-800">
                        Upload Document B (Revised Version)
                      </p>
                      <p className="text-[11px] text-slate-400">PDF, DOCX, TXT, or Image</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <label className="inline-block bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer shadow-sm transition">
                        Select File
                        <input type="file" onChange={handleFileChangeB} accept=".pdf,.docx,.txt,image/*" className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCameraTarget('docB')}
                        className="inline-flex items-center space-x-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 dark:text-emerald-300 light:text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Scan Camera</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Delta Highlights Banner (When both documents are loaded) */}
      {docA && docB && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 dark:from-slate-900 dark:to-slate-900 light:from-indigo-50 light:to-purple-50 border border-indigo-500/30 light:border-indigo-200 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isScoreImproved
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
              >
                {isScoreImproved ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 block">
                  Overall Risk Delta Analysis
                </span>
                <h3 className="text-lg font-extrabold text-white dark:text-white light:text-slate-900">
                  {isScoreImproved ? (
                    <span className="text-emerald-400 light:text-emerald-700">
                      Document B reduces risk by {Math.abs(riskDelta)} points
                    </span>
                  ) : riskDelta === 0 ? (
                    <span className="text-slate-300">Document B has identical overall risk</span>
                  ) : (
                    <span className="text-rose-400 light:text-rose-700">
                      Document B increases risk by {Math.abs(riskDelta)} points
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-slate-950/70 dark:bg-slate-950/70 light:bg-white p-3 rounded-2xl border border-white/10 light:border-slate-200">
              <div className="text-center px-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Doc A Risk</span>
                <span className="text-base font-extrabold text-white dark:text-white light:text-slate-900">
                  {docA.overallRiskScore}
                </span>
              </div>
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              <div className="text-center px-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Doc B Risk</span>
                <span className="text-base font-extrabold text-white dark:text-white light:text-slate-900">
                  {docB.overallRiskScore}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Delta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-white p-3.5 rounded-2xl border border-white/10 light:border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">High Risk Clauses</span>
              <div className="text-xs font-bold space-x-2">
                <span className="text-rose-400">{docA.clauses.filter((c) => c.riskLevel === 'High').length}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400">{docB.clauses.filter((c) => c.riskLevel === 'High').length}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-white p-3.5 rounded-2xl border border-white/10 light:border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">Medium Risk Clauses</span>
              <div className="text-xs font-bold space-x-2">
                <span className="text-amber-400">{docA.clauses.filter((c) => c.riskLevel === 'Medium').length}</span>
                <span className="text-slate-500">→</span>
                <span className="text-amber-400">{docB.clauses.filter((c) => c.riskLevel === 'Medium').length}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-white p-3.5 rounded-2xl border border-white/10 light:border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">Low Risk Clauses</span>
              <div className="text-xs font-bold space-x-2">
                <span className="text-slate-400">{docA.clauses.filter((c) => c.riskLevel === 'Low').length}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400">{docB.clauses.filter((c) => c.riskLevel === 'Low').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Comparison Section (Only when both documents are loaded) */}
      {docA && docB && (
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-800 dark:border-slate-800 light:border-slate-200 space-x-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('clauses')}
              className={`pb-3 px-4 text-sm font-bold flex items-center space-x-2 border-b-2 transition shrink-0 ${
                activeTab === 'clauses'
                  ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-200 light:hover:text-slate-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Side-by-Side Clause Analysis ({matchedClauses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('keyterms')}
              className={`pb-3 px-4 text-sm font-bold flex items-center space-x-2 border-b-2 transition shrink-0 ${
                activeTab === 'keyterms'
                  ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-200 light:hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Key Terms & Financials Delta</span>
            </button>
          </div>

          {/* TAB 1: CLAUSE BY CLAUSE SPLIT-PANE */}
          {activeTab === 'clauses' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white p-4 rounded-2xl border border-white/10 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search clause differences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-white/10 light:border-slate-300 pl-9 pr-4 py-2 rounded-xl text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setFilterDiffOnly(!filterDiffOnly)}
                    className={`text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center space-x-2 border ${
                      filterDiffOnly
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 border-white/10 light:border-slate-300'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>{filterDiffOnly ? 'Showing Differences Only' : 'Show All Clauses'}</span>
                  </button>
                </div>
              </div>

              {/* Clause Split-Pane Grid */}
              <div className="space-y-6">
                {filteredMatchedClauses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-white/10">
                    No clauses matched your filter criteria.
                  </div>
                ) : (
                  filteredMatchedClauses.map((pair, index) => {
                    const isExpanded = expandedClauseIds.has(`pair-${index}`);

                    return (
                      <div
                        key={index}
                        className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/90 border border-white/10 light:border-slate-200 rounded-3xl overflow-hidden shadow-xl transition space-y-0"
                      >
                        {/* Pair Delta Header Bar */}
                        <div className="p-4 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 border-b border-white/10 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 light:text-indigo-700 rounded-lg">
                              {pair.category}
                            </span>
                            <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
                              {pair.title}
                            </h4>
                          </div>

                          {/* Delta Status Badge */}
                          <div className="flex items-center space-x-3">
                            {pair.status === 'improved' && (
                              <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 light:text-emerald-800 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Risk Reduced in Doc B</span>
                              </span>
                            )}
                            {pair.status === 'worsened' && (
                              <span className="text-xs font-bold px-3 py-1 bg-rose-500/20 text-rose-300 light:text-rose-800 border border-rose-500/30 rounded-full flex items-center space-x-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Risk Increased in Doc B</span>
                              </span>
                            )}
                            {pair.status === 'modified' && (
                              <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 light:text-amber-800 border border-amber-500/30 rounded-full flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Text Rephrased / Modified</span>
                              </span>
                            )}
                            {pair.status === 'identical' && (
                              <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 light:bg-slate-200 light:text-slate-700 rounded-full flex items-center space-x-1">
                                <Minus className="w-3.5 h-3.5" />
                                <span>Identical Clause</span>
                              </span>
                            )}

                            <button
                              onClick={() => toggleExpand(`pair-${index}`)}
                              className="text-xs text-slate-400 hover:text-white p-1"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Split-Pane Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 light:divide-slate-200">
                          {/* Left Column: Doc A */}
                          <div className="p-5 space-y-3 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50/50">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                                Doc A ({docA.fileName})
                              </span>
                              {pair.clauseA ? (
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                                    pair.clauseA.riskLevel === 'High'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : pair.clauseA.riskLevel === 'Medium'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  }`}
                                >
                                  {pair.clauseA.riskLevel} Risk
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 italic">Clause Not Present in Doc A</span>
                              )}
                            </div>

                            {pair.clauseA ? (
                              <>
                                <div className="bg-indigo-500/10 light:bg-indigo-50 border border-indigo-400/20 light:border-indigo-200 p-3.5 rounded-xl space-y-1">
                                  <span className="text-[10px] font-bold text-indigo-300 light:text-indigo-700 uppercase tracking-wider block">
                                    Explanation
                                  </span>
                                  <p className="text-xs text-indigo-100 dark:text-indigo-100 light:text-indigo-950 leading-relaxed">
                                    {pair.clauseA.simplifiedExplanation}
                                  </p>
                                </div>

                                <div className="p-3 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white border border-white/10 light:border-slate-200 rounded-xl text-xs text-slate-300 dark:text-slate-300 light:text-slate-800 font-mono leading-relaxed">
                                  "{pair.clauseA.originalText}"
                                </div>

                                {isExpanded && (
                                  <div className="space-y-2 pt-2 border-t border-white/10 light:border-slate-200">
                                    <p className="text-xs text-rose-300 light:text-rose-700 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                                      <strong>Risk Note:</strong> {pair.clauseA.riskReasoning}
                                    </p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-slate-500 italic p-4 text-center">Clause added in Doc B</p>
                            )}
                          </div>

                          {/* Right Column: Doc B */}
                          <div className="p-5 space-y-3 bg-purple-950/10 dark:bg-purple-950/10 light:bg-purple-50/20">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                                Doc B ({docB.fileName})
                              </span>
                              {pair.clauseB ? (
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                                    pair.clauseB.riskLevel === 'High'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : pair.clauseB.riskLevel === 'Medium'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  }`}
                                >
                                  {pair.clauseB.riskLevel} Risk
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 italic">Clause Removed in Doc B</span>
                              )}
                            </div>

                            {pair.clauseB ? (
                              <>
                                <div className="bg-purple-500/10 light:bg-purple-50 border border-purple-400/20 light:border-purple-200 p-3.5 rounded-xl space-y-1">
                                  <span className="text-[10px] font-bold text-purple-300 light:text-purple-700 uppercase tracking-wider block">
                                    Explanation
                                  </span>
                                  <p className="text-xs text-purple-100 dark:text-purple-100 light:text-purple-950 leading-relaxed">
                                    {pair.clauseB.simplifiedExplanation}
                                  </p>
                                </div>

                                <div className="p-3 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white border border-white/10 light:border-slate-200 rounded-xl text-xs text-slate-300 dark:text-slate-300 light:text-slate-800 font-mono leading-relaxed">
                                  "{pair.clauseB.originalText}"
                                </div>

                                {isExpanded && (
                                  <div className="space-y-2 pt-2 border-t border-white/10 light:border-slate-200">
                                    <p className="text-xs text-emerald-300 light:text-emerald-700 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                      <strong>Recommendation:</strong> {pair.clauseB.recommendation}
                                    </p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-slate-500 italic p-4 text-center">Clause removed in Doc B</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KEY TERMS & FINANCIALS DELTA */}
          {activeTab === 'keyterms' && (
            <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/90 border border-white/10 light:border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-white dark:text-white light:text-slate-900 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Key Commercial Terms Comparison</span>
                </h3>
                <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 mt-1">
                  Side-by-side breakdown of critical parameters including financial terms, notice periods, and liability caps.
                </p>
              </div>

              <div className="grid grid-cols-1 divide-y divide-white/10 light:divide-slate-200 border border-white/10 light:border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 p-3.5 grid grid-cols-1 md:grid-cols-3 font-bold text-xs uppercase tracking-wider text-slate-400 light:text-slate-600">
                  <span>Parameter</span>
                  <span>Document A ({docA.fileName})</span>
                  <span>Document B ({docB.fileName})</span>
                </div>

                {docA.keyDetails.map((itemA, idx) => {
                  const itemB = docB.keyDetails.find((b) => b.label === itemA.label) || {
                    label: itemA.label,
                    value: 'N/A',
                  };
                  const isDifferent = itemA.value !== itemB.value;

                  return (
                    <div
                      key={idx}
                      className={`p-4 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center text-xs transition ${
                        isDifferent
                          ? 'bg-indigo-500/10 dark:bg-indigo-500/10 light:bg-indigo-50/50 font-semibold'
                          : 'bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-white dark:text-white light:text-slate-900 flex items-center space-x-2">
                        <span>{itemA.label}</span>
                        {isDifferent && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-500/20 text-amber-300 light:text-amber-800 border border-amber-500/30 rounded-md">
                            Changed
                          </span>
                        )}
                      </span>

                      <span className="text-slate-300 dark:text-slate-300 light:text-slate-800 font-mono">
                        {itemA.value}
                      </span>

                      <span
                        className={`font-mono ${
                          isDifferent
                            ? 'text-emerald-400 light:text-emerald-700 font-bold'
                            : 'text-slate-300 dark:text-slate-300 light:text-slate-800'
                        }`}
                      >
                        {itemB.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={cameraTarget !== null}
        onClose={() => setCameraTarget(null)}
        onCaptureComplete={(file) => {
          if (cameraTarget) {
            onAnalyzeFile(file, cameraTarget);
          }
          setCameraTarget(null);
        }}
        modalTitle={`Scan ${cameraTarget === 'docA' ? 'Document A (Baseline Draft)' : 'Document B (Counter Draft)'} via Camera`}
      />
    </div>
  );
};
