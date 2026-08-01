import React from 'react';
import { ShieldCheck, CheckCircle2, Sun, Moon, FileText, ArrowRightLeft } from 'lucide-react';
import { DocumentAnalysis } from '../types';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentDocument: DocumentAnalysis | null;
  onReset: () => void;
  isAnalyzing: boolean;
  mode: 'single' | 'compare';
  setMode: (mode: 'single' | 'compare') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDocument,
  onReset,
  isAnalyzing,
  mode,
  setMode,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-2xl border-b border-slate-800 dark:border-white/10 light:border-slate-200 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="cursor-pointer transition hover:opacity-90 shrink-0" onClick={onReset}>
          <Logo size="md" showText={true} showTagline={false} />
        </div>

        {/* Mode Selector Tabs (Single vs Compare) */}
        <div className="flex items-center bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 p-1 rounded-2xl border border-white/10 light:border-slate-200 shadow-inner shrink-0">
          <button
            onClick={() => setMode('single')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 sm:space-x-1.5 ${
              mode === 'single'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                : 'text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Single Review</span>
            <span className="sm:hidden">Single</span>
          </button>

          <button
            onClick={() => setMode('compare')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 sm:space-x-1.5 ${
              mode === 'compare'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Compare 2 Contracts</span>
            <span className="sm:hidden">Compare</span>
          </button>
        </div>

        {/* Status Badge, Theme Toggle & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {currentDocument && mode === 'single' && (
            <button
              onClick={onReset}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm transition flex items-center space-x-1"
              title="Upload New Document"
            >
              <span>+</span>
              <span className="hidden sm:inline">New Analysis</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light and Dark Mode"
            className="p-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700/80 light:hover:bg-slate-200 border border-white/10 light:border-slate-300 text-amber-400 dark:text-amber-400 light:text-slate-700 transition flex items-center space-x-1.5 shadow-sm"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200 hidden lg:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 hidden lg:inline">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


