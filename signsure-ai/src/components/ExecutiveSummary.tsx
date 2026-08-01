import React from 'react';
import { KeyDetail } from '../types';
import { Users, DollarSign, Calendar, Landmark, FileText } from 'lucide-react';

interface ExecutiveSummaryProps {
  keyDetails: KeyDetail[];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ keyDetails }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Parties':
        return <Users className="w-4 h-4 text-indigo-400" />;
      case 'Financial':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'Dates':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'Jurisdiction':
        return <Landmark className="w-4 h-4 text-sky-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 transition-colors">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-600 flex items-center space-x-2">
        <FileText className="w-4 h-4 text-indigo-400" />
        <span>Contract Key Terms & Metadata</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyDetails.map((detail, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 backdrop-blur-md border border-white/10 light:border-slate-200 p-4 rounded-2xl flex items-start space-x-3.5 transition duration-300 hover:border-indigo-400/40 hover:shadow-md group"
          >
            <div className="p-2.5 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white rounded-xl border border-white/10 light:border-slate-200 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              {getCategoryIcon(detail.category)}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider block">
                {detail.label}
              </span>
              <p className="text-sm font-semibold text-white dark:text-white light:text-slate-900 truncate" title={detail.value}>
                {detail.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

