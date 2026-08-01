import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Sparkles, ArrowRight, ShieldCheck, FileCode, CheckCircle2, AlertCircle, PlayCircle, Scale, ShieldAlert, Camera } from 'lucide-react';
import { DocumentAnalysis } from '../types';
import { Logo } from './Logo';
import { SAMPLE_DOC_A, SAMPLE_DOC_B } from '../data/sampleCompareDocs';
import { CameraScannerModal } from './CameraScannerModal';

interface DocumentUploaderProps {
  onAnalyzeFile: (file: File) => void;
  onAnalyzeRawText: (title: string, text: string) => void;
  onSelectSample?: (doc: DocumentAnalysis) => void;
  isAnalyzing: boolean;
  error: string | null;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onAnalyzeFile,
  onAnalyzeRawText,
  onSelectSample,
  isAnalyzing,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'paste'>('upload');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAnalyzeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAnalyzeFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pastedText.trim()) {
      onAnalyzeRawText(pastedTitle || 'Pasted Legal Text', pastedText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Glassmorphic Hero Branding Box */}
      <div className="relative p-8 sm:p-10 rounded-3xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-white/80 backdrop-blur-xl border border-white/10 light:border-slate-200 shadow-xl text-center space-y-5 overflow-hidden transition-colors">
        {/* Subtle Ambient Radial Glow background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 blur-[100px] pointer-events-none rounded-full"></div>
        <div className="absolute -bottom-24 right-10 w-80 h-80 bg-cyan-500/15 blur-[90px] pointer-events-none rounded-full"></div>

        {/* Official Logo Display */}
        <div className="flex flex-col items-center justify-center">
          <Logo size="xl" showText={true} showTagline={true} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto">
          Never Sign an Unfair Contract Again.
        </h1>
        <p className="text-sm sm:text-base text-slate-300/90 dark:text-slate-300/90 light:text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload any NDA, lease, employment agreement, or vendor contract. <strong className="text-white dark:text-white light:text-slate-900 font-semibold">SignSure AI</strong> flags hidden risks, simplifies legalese into plain language, and generates an instant pre-signing checklist.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 dark:text-rose-300 light:text-rose-800 p-4 rounded-2xl backdrop-blur-md flex items-start space-x-3 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200 dark:text-rose-200 light:text-rose-900">Analysis Error</p>
            <p className="text-rose-300/90 dark:text-rose-300/90 light:text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Glassmorphism Upload Container */}
      <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-3xl shadow-xl overflow-hidden transition-colors">
        {/* Tab Selector */}
        <div className="flex border-b border-white/10 light:border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50 backdrop-blur-md overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-4 px-4 sm:px-5 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-indigo-400 text-indigo-300 dark:text-indigo-300 light:text-indigo-600 bg-white/5 light:bg-white'
                : 'border-transparent text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload File (PDF, DOCX)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('camera');
              setIsCameraOpen(true);
            }}
            className={`flex-1 py-4 px-4 sm:px-5 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === 'camera'
                ? 'border-indigo-400 text-indigo-300 dark:text-indigo-300 light:text-indigo-600 bg-white/5 light:bg-white'
                : 'border-transparent text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Scan with Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-4 px-4 sm:px-5 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-indigo-400 text-indigo-300 dark:text-indigo-300 light:text-indigo-600 bg-white/5 light:bg-white'
                : 'border-transparent text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Paste Contract Text</span>
          </button>
        </div>

        <div className="p-6 sm:p-10">
          {isAnalyzing ? (
            <div className="py-14 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
                <div className="w-20 h-20 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin flex items-center justify-center bg-slate-950/80 dark:bg-slate-950/80 light:bg-white backdrop-blur-md border-r-cyan-400 shadow-lg">
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900 tracking-wide">
                  Analyzing Legal Terms with SignSure AI...
                </h3>
                <p className="text-sm text-slate-300/80 dark:text-slate-300/80 light:text-slate-600 max-w-md mx-auto">
                  Parsing clauses, evaluating liabilities, identifying critical red flags, and creating your pre-signing checklist...
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-300 dark:text-cyan-300 light:text-cyan-700 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full backdrop-blur-md shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Running deep contract risk score engine</span>
              </div>
            </div>
          ) : activeTab === 'upload' ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/15 shadow-lg'
                    : 'border-white/15 dark:border-white/15 light:border-slate-300 hover:border-indigo-400/60 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50 hover:bg-slate-950/70 light:hover:bg-slate-100 shadow-inner'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-white/10 light:border-slate-200 text-cyan-300 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900 mb-2">
                  Drag & Drop your legal document here
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-500 mb-6 max-w-sm mx-auto">
                  Supports PDF, Word (DOCX), Text files, or scanned contract images (PNG, JPG)
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="inline-flex items-center space-x-2 text-xs text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all">
                    <span>Browse Local Computer</span>
                    <ArrowRight className="w-4 h-4 text-indigo-200" />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCameraOpen(true);
                    }}
                    className="inline-flex items-center space-x-2 text-xs text-emerald-300 dark:text-emerald-300 light:text-emerald-800 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-5 py-2.5 rounded-xl font-bold shadow-md transition-all"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Scan Paper with Camera</span>
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center space-x-4 text-xs text-slate-400 light:text-slate-500">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>PDF & Word</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Live Scanner</span>
                  </span>
                  <span>•</span>
                  <span>Up to 50MB</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            <div className="py-8 text-center space-y-5 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 rounded-2xl border border-white/10 p-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-900">
                  Document Camera Scanner
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-600 max-w-md mx-auto">
                  Hold physical paper contracts or signed documents in front of your device camera to capture and analyze them instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 mx-auto transition-transform active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Live Camera Scanner</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasteSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Non-Disclosure Agreement for New Role"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 border border-white/10 light:border-slate-300 rounded-xl px-4 py-3 text-sm text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2">
                  Contract Legal Text
                </label>
                <textarea
                  rows={9}
                  placeholder="Paste the contract text or clause text here..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 border border-white/10 light:border-slate-300 rounded-xl p-4 text-sm text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!pastedText.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Run Instant SignSure AI Legal Analysis</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Quick Try Sample Section for Instant Demo */}
      <div className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white/80 backdrop-blur-xl border border-white/10 light:border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 light:border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">
              No Document on Hand? Try Sample Contracts
            </h3>
          </div>
          <span className="text-xs text-slate-400 light:text-slate-600 font-medium">
            Click any sample below to see an instant AI analysis breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Sample Card 1: High Risk Vendor MSA */}
          <button
            type="button"
            onClick={() => onSelectSample && onSelectSample(SAMPLE_DOC_A)}
            className="group text-left bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 hover:bg-slate-950 light:hover:bg-indigo-50/60 p-4 rounded-2xl border border-white/10 light:border-slate-300 hover:border-indigo-500/50 transition-all shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-rose-500/20 text-rose-300 light:text-rose-800 border border-rose-500/30 rounded-lg flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>High Risk Draft (Score: 78)</span>
              </span>
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 group-hover:text-indigo-300 light:group-hover:text-indigo-700 transition">
                Vendor Master Services Agreement (v1)
              </h4>
              <p className="text-xs text-slate-400 light:text-slate-600 line-clamp-2 mt-1">
                Contains auto-renewals with 15% price hikes, uncapped liability, and vendor IP forfeiture.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400 light:text-indigo-600 pt-1">
              <span>Explore High Risk Sample</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Sample Card 2: Moderate Risk Negotiated Agreement */}
          <button
            type="button"
            onClick={() => onSelectSample && onSelectSample(SAMPLE_DOC_B)}
            className="group text-left bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-50 hover:bg-slate-950 light:hover:bg-purple-50/60 p-4 rounded-2xl border border-white/10 light:border-slate-300 hover:border-purple-500/50 transition-all shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-amber-500/20 text-amber-300 light:text-amber-800 border border-amber-500/30 rounded-lg flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                <span>Balanced Terms (Score: 32)</span>
              </span>
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 group-hover:text-purple-300 light:group-hover:text-purple-700 transition">
                Vendor Master Services Agreement (v2 Counter)
              </h4>
              <p className="text-xs text-slate-400 light:text-slate-600 line-clamp-2 mt-1">
                30-day renewal window, mutual 12-month liability caps, and client IP assignment.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-purple-400 light:text-purple-600 pt-1">
              <span>Explore Negotiated Sample</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureComplete={(file) => onAnalyzeFile(file)}
        modalTitle="Scan Contract Document via Camera"
      />
    </div>
  );
};

