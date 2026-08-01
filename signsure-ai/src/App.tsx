import React, { useState } from 'react';
import { Header } from './components/Header';
import { DocumentUploader } from './components/DocumentUploader';
import { RiskScoreCard } from './components/RiskScoreCard';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { ClauseExplorer } from './components/ClauseExplorer';
import { PreSigningChecklist } from './components/PreSigningChecklist';
import { DocumentChat } from './components/DocumentChat';
import { ExportReportModal } from './components/ExportReportModal';
import { DocumentComparison } from './components/DocumentComparison';
import { DocumentAnalysis } from './types';
import { MessageSquare, Download, Scale, ClipboardCheck, FileText, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  // Single document state
  const [currentDocument, setCurrentDocument] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'clauses' | 'checklist' | 'fulltext'>('clauses');

  // Comparison mode state
  const [docA, setDocA] = useState<DocumentAnalysis | null>(null);
  const [docB, setDocB] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzingA, setIsAnalyzingA] = useState<boolean>(false);
  const [isAnalyzingB, setIsAnalyzingB] = useState<boolean>(false);

  // Chat & Export modals
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [chatSecondaryDoc, setChatSecondaryDoc] = useState<DocumentAnalysis | null>(null);

  // Handle uploading file for single review
  const handleAnalyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type || 'application/pdf';

        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: mimeType,
            fileName: file.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze document.');
        }

        setCurrentDocument(data);
        setIsAnalyzing(false);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file from disk.');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'An error occurred during analysis.');
      setIsAnalyzing(false);
    }
  };

  // Handle direct text paste for single review
  const handleAnalyzeRawText = async (title: string, text: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textContent: text,
          fileName: title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze document text.');
      }

      setCurrentDocument(data);
    } catch (err: any) {
      console.error('Text analysis error:', err);
      setAnalysisError(err.message || 'Failed to analyze legal text.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Comparison file upload handler
  const handleAnalyzeFileForCompare = async (file: File, target: 'docA' | 'docB'): Promise<DocumentAnalysis | null> => {
    if (target === 'docA') setIsAnalyzingA(true);
    else setIsAnalyzingB(true);

    try {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            const response = await fetch('/api/analyze-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileData: base64Data,
                mimeType: file.type || 'application/pdf',
                fileName: file.name,
              }),
            });
            const data = await response.json();
            if (response.ok) {
              if (target === 'docA') setDocA(data);
              else setDocB(data);
              resolve(data);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          } finally {
            if (target === 'docA') setIsAnalyzingA(false);
            else setIsAnalyzingB(false);
          }
        };
        reader.readAsDataURL(file);
      });
    } catch {
      if (target === 'docA') setIsAnalyzingA(false);
      else setIsAnalyzingB(false);
      return null;
    }
  };

  // Comparison raw text handler
  const handleAnalyzeRawTextForCompare = async (title: string, text: string, target: 'docA' | 'docB'): Promise<DocumentAnalysis | null> => {
    if (target === 'docA') setIsAnalyzingA(true);
    else setIsAnalyzingB(true);

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: text, fileName: title }),
      });
      const data = await response.json();
      if (response.ok) {
        if (target === 'docA') setDocA(data);
        else setDocB(data);
        return data;
      }
      return null;
    } catch {
      return null;
    } finally {
      if (target === 'docA') setIsAnalyzingA(false);
      else setIsAnalyzingB(false);
    }
  };

  const handleReset = () => {
    setCurrentDocument(null);
    setAnalysisError(null);
  };

  const handleGoToChecklist = () => {
    setActiveTab('checklist');
    setTimeout(() => {
      const el = document.getElementById('checklist-tab-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenChatWithComparison = (dA: DocumentAnalysis, dB: DocumentAnalysis) => {
    setCurrentDocument(dA);
    setChatSecondaryDoc(dB);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* Navigation Bar */}
      <div className="relative z-10">
        <Header
          currentDocument={currentDocument}
          onReset={handleReset}
          isAnalyzing={isAnalyzing}
          mode={mode}
          setMode={setMode}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {mode === 'compare' ? (
          <DocumentComparison
            onAnalyzeFile={handleAnalyzeFileForCompare}
            onAnalyzeRawText={handleAnalyzeRawTextForCompare}
            docA={docA}
            docB={docB}
            setDocA={setDocA}
            setDocB={setDocB}
            isAnalyzingA={isAnalyzingA}
            isAnalyzingB={isAnalyzingB}
            onOpenChatWithComparison={handleOpenChatWithComparison}
          />
        ) : !currentDocument ? (
          <DocumentUploader
            onAnalyzeFile={handleAnalyzeFile}
            onAnalyzeRawText={handleAnalyzeRawText}
            onSelectSample={(doc) => setCurrentDocument(doc)}
            isAnalyzing={isAnalyzing}
            error={analysisError}
          />
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Action Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 border border-slate-800 dark:border-white/10 light:border-slate-200 p-4 rounded-2xl shadow-md backdrop-blur-xl">
              <button
                onClick={handleReset}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-indigo-400 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Upload Another Contract</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 light:hover:bg-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-medium rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 transition flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Download className="w-4 h-4 text-slate-400 light:text-slate-600" />
                  <span>Export Report</span>
                </button>
                <button
                  onClick={() => {
                    setChatSecondaryDoc(null);
                    setIsChatOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-200" />
                  <span>Ask SignSure AI</span>
                </button>
              </div>
            </div>

            {/* Overall Risk Score Metric Card */}
            <RiskScoreCard
              analysis={currentDocument}
              onOpenChat={() => {
                setChatSecondaryDoc(null);
                setIsChatOpen(true);
              }}
              onViewChecklist={handleGoToChecklist}
            />

            {/* Key Metadata Details */}
            <ExecutiveSummary keyDetails={currentDocument.keyDetails} />

            {/* Navigation Tabs (Clauses / Checklist / Full Text) */}
            <div id="checklist-tab-section" className="space-y-6 scroll-mt-24">
              <div className="flex border-b border-slate-800 dark:border-slate-800 light:border-slate-200 space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveTab('clauses')}
                  className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 border-b-2 transition shrink-0 ${
                    activeTab === 'clauses'
                      ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                      : 'border-transparent text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-800'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span className="hidden sm:inline">Clause Breakdown ({currentDocument.clauses.length})</span>
                  <span className="sm:hidden">Clauses ({currentDocument.clauses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 border-b-2 transition shrink-0 ${
                    activeTab === 'checklist'
                      ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                      : 'border-transparent text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-800'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Pre-Signing Checklist ({currentDocument.preSigningChecklist.length})</span>
                  <span className="sm:hidden">Checklist ({currentDocument.preSigningChecklist.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('fulltext')}
                  className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 border-b-2 transition shrink-0 ${
                    activeTab === 'fulltext'
                      ? 'border-indigo-500 text-indigo-400 light:text-indigo-600'
                      : 'border-transparent text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Full Contract Text</span>
                  <span className="sm:hidden">Full Text</span>
                </button>
              </div>

              {/* Tab Views */}
              {activeTab === 'clauses' && <ClauseExplorer clauses={currentDocument.clauses} />}
              {activeTab === 'checklist' && <PreSigningChecklist checklist={currentDocument.preSigningChecklist} />}
              {activeTab === 'fulltext' && (
                <div className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 light:text-slate-600 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Raw Extracted Document Text</span>
                  </h3>
                  <div className="bg-slate-950 dark:bg-slate-950 light:bg-slate-50 p-4 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs text-slate-300 dark:text-slate-300 light:text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                    {currentDocument.fullText}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Chat Drawer */}
      {currentDocument && (
        <DocumentChat
          analysis={currentDocument}
          secondaryAnalysis={chatSecondaryDoc}
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatSecondaryDoc(null);
          }}
        />
      )}

      {/* Export Report Modal */}
      {currentDocument && (
        <ExportReportModal
          analysis={currentDocument}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SignSure AI — Enterprise Legal Intelligence Platform</p>
          <p className="text-slate-600">AI analysis for educational & review purposes. Not legal counsel.</p>
        </div>
      </footer>
    </div>
  );
}
