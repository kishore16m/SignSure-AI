import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DocumentAnalysis } from '../types';
import { MessageSquare, Send, Sparkles, Bot, User, X, HelpCircle, CornerDownLeft } from 'lucide-react';

interface DocumentChatProps {
  analysis: DocumentAnalysis;
  secondaryAnalysis?: DocumentAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
}

const cleanPlainText = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/^#{1,6}\s+/gm, '') // Strip headers ###
    .replace(/\*\*(.*?)\*\*/g, '$1') // Strip bold **text**
    .replace(/\*(.*?)\*/g, '$1') // Strip italic *text*
    .replace(/`(.*?)`/g, '$1') // Strip inline code `text`
    .replace(/~{2}(.*?)~{2}/g, '$1')
    .replace(/^\s*[\*\-]\s+/gm, '• ') // Convert markdown bullets * or - to clean dot bullet
    .trim();
};

export const DocumentChat: React.FC<DocumentChatProps> = ({ analysis, secondaryAnalysis, isOpen, onClose }) => {
  const isComparisonMode = Boolean(secondaryAnalysis);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isComparisonMode && secondaryAnalysis
        ? `Hello! I'm your SignSure AI Assistant. I have both "${analysis.documentTitle}" (Doc A) and "${secondaryAnalysis.documentTitle}" (Doc B) loaded. Ask me anything about how they compare, risk differences, or negotiation trade-offs!`
        : `Hello! I'm your SignSure AI Assistant. I've thoroughly analyzed "${analysis.documentTitle}". Ask me any specific question about clauses, hidden risks, financial obligations, or negotiation tactics!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = isComparisonMode
    ? [
        'Which document is safer for me?',
        'What are the key clause differences?',
        'How did liability caps change between A and B?',
        'Did notice periods for auto-renewal change?',
      ]
    : [
        'What are the termination conditions?',
        'Are there any hidden auto-renewal fees?',
        'Who owns the intellectual property?',
        'Can I perform side work or freelancing for other clients?',
        'What is the maximum liability cap?',
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const documentContext = secondaryAnalysis
        ? `DOCUMENT A (${analysis.documentTitle} - Score: ${analysis.overallRiskScore}/100):\n${analysis.fullText}\n\nDOCUMENT B (${secondaryAnalysis.documentTitle} - Score: ${secondaryAnalysis.overallRiskScore}/100):\n${secondaryAnalysis.fullText}`
        : analysis.fullText;

      const clausesContext = secondaryAnalysis
        ? [
            ...analysis.clauses.map((c) => ({ ...c, docSource: 'Doc A' })),
            ...secondaryAnalysis.clauses.map((c) => ({ ...c, docSource: 'Doc B' })),
          ]
        : analysis.clauses;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContext,
          clausesContext,
          messages: [...messages, userMsg].map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reach SignSure AI assistant');
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'I am unable to process that query at the moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `Error: ${err.message || 'Could not communicate with SignSure AI.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-950/90 dark:bg-slate-950/90 light:bg-white backdrop-blur-2xl border-l border-white/10 light:border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 transition-colors">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white dark:text-white light:text-slate-900 flex items-center space-x-2 tracking-tight">
                <span>SignSure AI Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 truncate max-w-[160px] sm:max-w-[280px]">
                Analyzing "{analysis.documentTitle}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-200 border border-white/10 light:border-slate-300 rounded-xl transition backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-3 bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100 border-b border-white/10 light:border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider block mb-2 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Suggested Questions:</span>
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isTyping}
                className="text-xs bg-slate-900/80 dark:bg-slate-900/80 light:bg-white text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 px-3 py-1.5 rounded-xl border border-white/10 light:border-slate-300 hover:border-indigo-400/40 whitespace-nowrap transition backdrop-blur-md shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-white/10 light:border-slate-300 text-indigo-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-tr-none shadow-sm'
                    : 'bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-white/10 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-900 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{cleanPlainText(msg.text)}</p>
                <span className="text-[10px] text-slate-400 light:text-slate-500 block mt-1.5 text-right font-mono">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-indigo-300 dark:text-indigo-300 light:text-indigo-800 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-white/10 light:border-slate-300 p-3.5 rounded-2xl w-fit shadow-sm">
              <Bot className="w-4 h-4 animate-bounce text-indigo-400" />
              <span>SignSure AI is reviewing document text...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 light:border-slate-200 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about this document..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white border border-white/10 light:border-slate-300 text-xs text-white dark:text-white light:text-slate-900 p-3.5 rounded-2xl placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white p-3.5 rounded-2xl transition disabled:opacity-50 shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <span className="text-[10px] text-slate-400 light:text-slate-500 block text-center mt-2.5 font-medium">
            SignSure AI risk assessments are provided for informational clarity and do not constitute formal legal counsel.
          </span>
        </div>
      </div>
    </div>
  );

};

