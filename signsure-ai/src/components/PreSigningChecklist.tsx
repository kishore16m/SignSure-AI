import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { ClipboardCheck, AlertTriangle, Info, CheckCircle2, Square, CheckSquare } from 'lucide-react';

interface PreSigningChecklistProps {
  checklist: ChecklistItem[];
}

export const PreSigningChecklist: React.FC<PreSigningChecklistProps> = ({ checklist }) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = checklist.filter((item) => completedMap[item.id]).length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center space-x-1 shrink-0 backdrop-blur-md shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>CRITICAL</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center space-x-1 shrink-0 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Info className="w-3 h-3 text-amber-400" />
            <span>WARNING</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full flex items-center space-x-1 shrink-0 backdrop-blur-md shadow-[0_0_12px_rgba(14,165,233,0.2)]">
            <CheckCircle2 className="w-3 h-3 text-sky-400" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
      {/* Header & Progress Bar */}
      <div className="space-y-4 pb-4 border-b border-white/10 light:border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white dark:text-white light:text-slate-900 flex items-center space-x-2 tracking-tight">
              <ClipboardCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>Pre-Signing Audit Checklist</span>
            </h3>
            <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 mt-0.5">
              Must-verify conditions before putting pen to paper.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs sm:text-sm font-bold text-indigo-300 dark:text-indigo-300 light:text-indigo-700">
              {completedCount} of {checklist.length} Verified
            </span>
            <span className="text-xs text-slate-400 light:text-slate-500 block">{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 rounded-full overflow-hidden border border-white/10 light:border-slate-300 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.map((item) => {
          const isDone = !!completedMap[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleComplete(item.id)}
              className={`p-4.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start space-x-3.5 backdrop-blur-md ${
                isDone
                  ? 'bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100/50 border-white/5 light:border-slate-200 opacity-60'
                  : 'bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 border-white/10 light:border-slate-200 hover:border-white/20 light:hover:border-slate-300 shadow-md'
              }`}
            >
              <button className="mt-0.5 text-indigo-400 hover:text-indigo-300 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isDone ? 'line-through text-slate-500' : 'text-white dark:text-white light:text-slate-900'
                    }`}
                  >
                    {item.item}
                  </span>
                  {getSeverityBadge(item.severity)}
                </div>
                <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 font-sans leading-relaxed">
                  {item.recommendation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

};

