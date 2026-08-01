import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Sparkles, ArrowRight } from 'lucide-react';
import { DocumentAnalysis } from '../types';

interface RiskScoreCardProps {
  analysis: DocumentAnalysis;
  onOpenChat: () => void;
  onViewChecklist?: () => void;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ analysis, onOpenChat, onViewChecklist }) => {
  const { overallRiskScore, overallRiskLevel, clauses, preSigningChecklist } = analysis;

  const highRiskCount = clauses.filter((c) => c.riskLevel === 'High').length;
  const mediumRiskCount = clauses.filter((c) => c.riskLevel === 'Medium').length;
  const lowRiskCount = clauses.filter((c) => c.riskLevel === 'Low').length;

  const criticalChecklistCount = preSigningChecklist.filter((chk) => chk.severity === 'critical').length;

  // Determine theme colors based on score
  const getScoreTheme = (score: number) => {
    if (score >= 70) {
      return {
        text: 'text-rose-500 dark:text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        gaugeBg: 'bg-rose-500',
        badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-sm',
        title: 'Critical Attention Required',
      };
    }
    if (score >= 40) {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        gaugeBg: 'bg-amber-500',
        badge: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 shadow-sm',
        title: 'Moderate Risk Detected',
      };
    }
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      gaugeBg: 'bg-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 shadow-sm',
      title: 'Relatively Safe Contract',
    };
  };

  const theme = getScoreTheme(overallRiskScore);

  return (
    <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden transition-colors">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[80px] pointer-events-none rounded-full"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10 light:border-slate-200 relative z-10">
        {/* Left Side: Score & Gauge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center p-2 bg-slate-950/70 light:bg-slate-100 rounded-full border border-white/10 light:border-slate-300 shadow-inner backdrop-blur-md">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800/80 light:text-slate-200 stroke-current"
                strokeWidth="3.8"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${theme.text} stroke-current transition-all duration-1000 ease-out`}
                strokeDasharray={`${overallRiskScore}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl sm:text-3xl font-extrabold ${theme.text}`}>{overallRiskScore}</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 light:text-slate-500 tracking-wider">Risk Index</span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className={`text-xs font-bold px-3 py-0.5 sm:py-1 rounded-full border backdrop-blur-md ${theme.badge}`}>
                {overallRiskLevel}
              </span>
              <span className="text-xs text-slate-300 light:text-slate-600 font-medium">{theme.title}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white light:text-slate-900 tracking-tight break-words">{analysis.documentTitle}</h2>
            <p className="text-xs text-slate-400 light:text-slate-500 flex items-center space-x-2 flex-wrap">
              <span>Category: <strong className="text-slate-200 light:text-slate-800 font-medium">{analysis.documentCategory}</strong></span>
              <span>•</span>
              <span>Analyzed {clauses.length} clauses</span>
            </p>
          </div>
        </div>

        {/* Right Side: Risk Distribution Breakdown */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-950/70 light:bg-slate-50 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 light:border-slate-200 shrink-0 shadow-inner w-full lg:w-auto">
          <div className="text-center px-2">
            <div className="flex items-center justify-center space-x-1 text-rose-500 dark:text-rose-400 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">High Risk</span>
            </div>
            <p className="text-2xl font-extrabold text-white light:text-slate-900">{highRiskCount}</p>
            <p className="text-[10px] text-slate-400 light:text-slate-500">Clauses</p>
          </div>

          <div className="text-center px-2 border-x border-white/10 light:border-slate-200">
            <div className="flex items-center justify-center space-x-1 text-amber-500 dark:text-amber-400 mb-1">
              <Info className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Medium</span>
            </div>
            <p className="text-2xl font-extrabold text-white light:text-slate-900">{mediumRiskCount}</p>
            <p className="text-[10px] text-slate-400 light:text-slate-500">Clauses</p>
          </div>

          <div className="text-center px-2">
            <div className="flex items-center justify-center space-x-1 text-emerald-500 dark:text-emerald-400 mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Low</span>
            </div>
            <p className="text-2xl font-extrabold text-white light:text-slate-900">{lowRiskCount}</p>
            <p className="text-[10px] text-slate-400 light:text-slate-500">Clauses</p>
          </div>
        </div>
      </div>

      {/* Executive Summary Narrative */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500 flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>SignSure AI Executive Summary</span>
          </h3>
          <button
            onClick={onOpenChat}
            className="text-xs font-semibold text-indigo-300 dark:text-indigo-300 light:text-indigo-700 hover:text-indigo-400 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/30 px-3.5 py-1.5 rounded-xl transition backdrop-blur-md shadow-sm flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask SignSure AI</span>
          </button>
        </div>
        <p className="text-sm text-slate-200 light:text-slate-800 leading-relaxed bg-slate-950/60 light:bg-slate-50 backdrop-blur-md p-4 rounded-2xl border border-white/10 light:border-slate-200 shadow-inner">
          {analysis.executiveSummary}
        </p>
      </div>

      {/* Action Banner for Critical Checklists */}
      {criticalChecklistCount > 0 && (
        <div
          onClick={onViewChecklist}
          className="bg-rose-500/15 light:bg-rose-50 border border-rose-500/30 light:border-rose-200 p-4 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-300 light:text-rose-900 shadow-md relative z-10 cursor-pointer hover:bg-rose-500/25 light:hover:bg-rose-100 transition"
        >
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong className="text-rose-200 light:text-rose-900 font-bold">{criticalChecklistCount} Critical Action Item(s)</strong> require renegotiation before signing.
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onViewChecklist) onViewChecklist();
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition flex items-center space-x-1.5 text-xs shadow-sm shrink-0"
          >
            <span>View Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};


