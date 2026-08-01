import React, { useState } from 'react';
import { Clause, RiskSeverity } from '../types';
import { Search, Filter, AlertTriangle, Info, CheckCircle2, Copy, Check, ChevronDown, ChevronUp, Sparkles, BookOpen, Scale } from 'lucide-react';

interface ClauseExplorerProps {
  clauses: Clause[];
}

export const ClauseExplorer: React.FC<ClauseExplorerProps> = ({ clauses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Payment & Fees',
    'Termination & Cancellation',
    'Liability & Indemnity',
    'Intellectual Property',
    'Confidentiality',
    'Governing Law',
    'General Terms',
  ];

  const filteredClauses = clauses.filter((clause) => {
    const matchesSearch =
      clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.simplifiedExplanation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || clause.category === selectedCategory;
    const matchesRisk = selectedRisk === 'All' || clause.riskLevel === selectedRisk;

    return matchesSearch && matchesCategory && matchesRisk;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedClauseId(expandedClauseId === id ? null : id);
  };

  const getRiskBadge = (risk: RiskSeverity) => {
    switch (risk) {
      case 'High':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-full flex items-center space-x-1 shrink-0 backdrop-blur-md shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Risk</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full flex items-center space-x-1 shrink-0 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Info className="w-3.5 h-3.5" />
            <span>Medium Risk</span>
          </span>
        );
      case 'Low':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center space-x-1 shrink-0 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Low Risk</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
      {/* Title & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 light:border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-white dark:text-white light:text-slate-900 flex items-center space-x-2 tracking-tight">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span>Clause-by-Clause Analysis</span>
          </h3>
          <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 mt-0.5">
            Every contract clause broken down into simple English with negotiation advice.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clause text or risk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 border border-white/10 light:border-slate-300 text-xs text-white dark:text-white light:text-slate-900 pl-10 pr-4 py-2.5 rounded-xl placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition backdrop-blur-md"
          />
        </div>
      </div>

      {/* Category Tabs & Risk Filter */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap font-semibold transition duration-200 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 border border-white/10 light:border-slate-200 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Risk Level Filter Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 light:text-slate-600 pt-1 gap-2.5 sm:gap-0">
          <span>Showing {filteredClauses.length} clauses</span>
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="shrink-0">Filter Risk:</span>
            {['All', 'High', 'Medium', 'Low'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2 py-1 sm:px-2.5 rounded-lg text-xs font-semibold transition ${
                  selectedRisk === r ? 'bg-indigo-500/20 text-indigo-300 light:text-indigo-700 border border-indigo-500/30 font-bold' : 'hover:text-slate-200 light:hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Clauses List */}
      <div className="space-y-4">
        {filteredClauses.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-white/10 text-slate-400 text-sm">
            No clauses found matching your search or filter criteria.
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const isExpanded = expandedClauseId === clause.id;
            return (
              <div
                key={clause.id}
                className={`bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 ${
                  clause.riskLevel === 'High'
                    ? 'border-rose-500/35 hover:border-rose-500/60 shadow-sm'
                    : clause.riskLevel === 'Medium'
                    ? 'border-amber-500/35 hover:border-amber-500/60 shadow-sm'
                    : 'border-white/10 light:border-slate-200 hover:border-white/20'
                }`}
              >
                {/* Clause Header Row */}
                <div
                  onClick={() => toggleExpand(clause.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between cursor-pointer hover:bg-white/5 light:hover:bg-slate-100 transition gap-2 sm:gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {clause.clauseNumber && (
                        <span className="text-[11px] font-mono text-slate-400 light:text-slate-500 font-semibold uppercase">
                          {clause.clauseNumber}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white text-slate-300 dark:text-slate-300 light:text-slate-700 border border-white/10 light:border-slate-300 rounded-lg">
                        {clause.category}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center space-x-2">
                      <span className="break-words">{clause.title}</span>
                    </h4>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-1 sm:pt-0">
                    {getRiskBadge(clause.riskLevel)}
                    <button className="text-slate-400 light:text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Plain-English Explanation (Always visible preview) */}
                <div className="px-5 pb-5">
                  <div className="bg-indigo-500/10 light:bg-indigo-50 border border-indigo-400/25 light:border-indigo-200 p-4 rounded-xl space-y-1.5 shadow-inner">
                    <div className="flex items-center space-x-1.5 text-indigo-300 light:text-indigo-700 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Plain English Explanation</span>
                    </div>
                    <p className="text-sm text-indigo-100/95 dark:text-indigo-100/95 light:text-indigo-950 leading-relaxed font-sans font-normal">
                      {clause.simplifiedExplanation}
                    </p>
                  </div>
                </div>

                {/* Expanded Details: Original Legal Text & Negotiation Advice */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/10 light:border-slate-200 space-y-4 bg-slate-950/90 dark:bg-slate-950/90 light:bg-slate-100">
                    {/* Original Legal Text */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Original Contract Wording</span>
                      </span>
                      <div className="p-3.5 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-white/10 light:border-slate-200 rounded-xl text-xs text-slate-300 dark:text-slate-300 light:text-slate-800 font-mono leading-relaxed">
                        "{clause.originalText}"
                      </div>
                    </div>

                    {/* Risk Reasoning */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-rose-400 light:text-rose-700 uppercase tracking-wider flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Why This Is Risky</span>
                      </span>
                      <p className="text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 bg-rose-500/10 light:bg-rose-50 border border-rose-500/25 light:border-rose-200 p-3.5 rounded-xl leading-relaxed">
                        {clause.riskReasoning}
                      </p>
                    </div>

                    {/* Actionable Negotiation Advice */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 light:text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Suggested Negotiated Revision</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(clause.id, clause.recommendation);
                          }}
                          className="text-xs font-semibold text-emerald-300 dark:text-emerald-300 light:text-emerald-800 hover:text-emerald-400 bg-emerald-500/15 light:bg-emerald-50 border border-emerald-500/30 light:border-emerald-200 px-3 py-1 rounded-lg transition flex items-center space-x-1 shadow-sm"
                        >
                          {copiedId === clause.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copy Request</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-100 dark:text-slate-100 light:text-slate-900 bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/25 light:border-emerald-200 p-3.5 rounded-xl font-mono leading-relaxed">
                        {clause.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            );
          })
        )}
      </div>
    </div>
  );
};

