import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import * as pdfParseModule from 'pdf-parse';
import mammoth from 'mammoth';

// Safe helper for PDF text extraction from buffer across module bundler formats
async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const fn = typeof pdfParseModule === 'function' 
      ? pdfParseModule 
      : (pdfParseModule as any)?.default;

    if (typeof fn === 'function') {
      const result = await fn(buffer, { max: 0 });
      return result?.text || '';
    }
  } catch (_err) {
    // pdf-parse module compatibility fallback; Gemini handles PDF natively via inlineData
  }
  return '';
}

const app = express();
const PORT = 3000;

// Express json middleware with 50MB payload limit for file uploads
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client (Server-Side)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clean markdown formatting helper for plain and simple replies
function cleanPlainText(str: string): string {
  if (!str) return '';
  return str
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers like ### Header
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
    .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
    .replace(/`(.*?)`/g, '$1') // Remove inline code `text`
    .replace(/~{2}(.*?)~{2}/g, '$1')
    .replace(/^\s*[\*\-]\s+/gm, '• ') // Convert markdown bullets * or - to clean dot bullet
    .trim();
}

// Endpoint: Analyze Legal Document
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { fileData, mimeType, textContent, fileName } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets.',
      });
    }

    let extractedText = textContent || '';
    let imageOrPdfPart: any = null;

    // Server-side parsing for PDF or DOCX if fileData base64 is provided
    if (fileData && mimeType) {
      const buffer = Buffer.from(fileData, 'base64');

      if (mimeType === 'application/pdf') {
        const textFromPdf = await parsePdfBuffer(buffer);
        if (textFromPdf && textFromPdf.trim().length > 0) {
          extractedText = textFromPdf;
        }
        // Also attach multimodal inlineData for Gemini 3.6 Flash PDF analysis
        imageOrPdfPart = {
          inlineData: {
            data: fileData,
            mimeType: 'application/pdf',
          },
        };
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        try {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } catch (docxErr) {
          console.warn('mammoth parsing failed:', docxErr);
        }
      } else if (mimeType.startsWith('image/')) {
        imageOrPdfPart = {
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          },
        };
      }
    }

    const systemPrompt = `You are SignSure AI, an elite legal risk analysis engine and veteran contract attorney.
Analyze the legal document provided and return a comprehensive structured legal analysis.

Your goal is to safeguard the user (typically a consumer, freelancer, employee, or small business owner) by highlighting hidden traps, aggressive terms, ambiguous phrasing, unreasonable liabilities, auto-renewals, and unfair IP transfers.

IMPORTANT STYLE RULE:
Write all explanations, executive summaries, risk reasonings, and recommendations in PLAIN, SIMPLE text. Do NOT use markdown symbols like **, ##, ###, or raw code blocks.

For every clause analyzed:
1. Provide a plain-English "Simplified Explanation" in plain text that anyone can understand without legal jargon.
2. Assign a Risk Level (High, Medium, or Low). High risk means severe potential financial, legal, or operational harm.
3. Provide a clear reasoning for the risk rating in simple sentences.
4. Offer an actionable negotiation recommendation or rewrite in plain English.

Categorize clauses into:
- Payment & Fees
- Termination & Cancellation
- Liability & Indemnity
- Intellectual Property
- Confidentiality
- Governing Law
- General Terms

Provide an overall risk score from 0 to 100 where:
- 0 to 30: Low Risk (Standard, balanced terms)
- 31 to 60: Moderate Risk (Some notable conditions to review)
- 61 to 85: High Risk (Aggressive terms, unfair waivers, or long payment locks)
- 86 to 100: Critical Risk (Bankrupting liabilities, complete loss of IP, global non-compete traps)`;

    const promptText = extractedText
      ? `Document Title / Filename: ${fileName || 'Uploaded Legal Document'}\n\nFull Document Text:\n${extractedText.slice(0, 40000)}`
      : `Please analyze the attached scanned legal document (${fileName || 'document'}) in detail.`;

    const contentsParts: any[] = [];
    if (imageOrPdfPart) {
      contentsParts.push(imageOrPdfPart);
    }
    contentsParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contentsParts.length === 1 ? contentsParts[0].text : { parts: contentsParts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentTitle: { type: Type.STRING, description: 'Formal name or descriptive title of document' },
            documentCategory: { type: Type.STRING, description: 'e.g. Freelance Contract, SaaS Terms, NDA, Employment Agreement, Lease' },
            overallRiskScore: { type: Type.INTEGER, description: '0 to 100 risk score' },
            overallRiskLevel: { type: Type.STRING, description: 'Low Risk | Moderate Risk | High Risk | Critical Risk' },
            executiveSummary: { type: Type.STRING, description: '2-3 sentence overview of main risks and key purpose of contract' },
            keyDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'Parties | Financial | Dates | Jurisdiction | General' },
                },
                required: ['label', 'value', 'category'],
              },
            },
            clauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  clauseNumber: { type: Type.STRING },
                  title: { type: Type.STRING },
                  originalText: { type: Type.STRING },
                  simplifiedExplanation: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, description: 'Low | Medium | High' },
                  riskReasoning: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'Payment & Fees | Termination & Cancellation | Liability & Indemnity | Intellectual Property | Confidentiality | Governing Law | General Terms' },
                },
                required: ['title', 'originalText', 'simplifiedExplanation', 'riskLevel', 'riskReasoning', 'recommendation', 'category'],
              },
            },
            preSigningChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  item: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'critical | warning | info' },
                  recommendation: { type: Type.STRING },
                },
                required: ['item', 'severity', 'recommendation'],
              },
            },
          },
          required: ['documentTitle', 'documentCategory', 'overallRiskScore', 'overallRiskLevel', 'executiveSummary', 'keyDetails', 'clauses', 'preSigningChecklist'],
        },
      },
    });

    const analysisResult = JSON.parse(response.text || '{}');

    // Attach full extracted text for client-side context
    analysisResult.fullText = extractedText || 'Document content processed via multimodal AI analysis.';
    analysisResult.id = 'doc-' + Date.now();
    analysisResult.fileName = fileName || 'Uploaded Document';
    analysisResult.fileType = mimeType?.includes('pdf') ? 'pdf' : mimeType?.includes('word') ? 'docx' : mimeType?.includes('image') ? 'image' : 'txt';
    analysisResult.uploadDate = new Date().toISOString().split('T')[0];

    return res.json(analysisResult);
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze document',
    });
  }
});

// Endpoint: Q&A Chat with Document
app.post('/api/chat', async (req, res) => {
  try {
    const { documentContext, clausesContext, messages } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const systemInstruction = `You are SignSure AI Assistant, a direct, friendly human legal advisor helping a user understand their uploaded document.

Document Context:
${(documentContext || '').slice(0, 15000)}

Key Analyzed Clauses:
${JSON.stringify(clausesContext || []).slice(0, 8000)}

STRICT COMMUNICATION RULES:
- Provide PLAIN and SIMPLE answers in clear, natural human sentences.
- ABSOLUTELY DO NOT use markdown formatting syntax (NO hashes ###, NO bold asterisks **, NO italic underscores _, NO markdown code blocks, NO markdown headings).
- Keep responses short, direct, and conversational (2 to 4 simple sentences max).
- If listing points, use simple numbered lines (1., 2.) or short plain sentences.
- Answer ONLY what the user asked in plain language.`;

    const formattedMessages = messages.map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedMessages,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const rawReply = response.text || "I'm sorry, I could not generate a response for that query.";
    const plainReply = cleanPlainText(rawReply);

    return res.json({
      reply: plainReply,
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate chat response',
    });
  }
});

// Vite middleware for development vs production static serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SignSure AI server running on http://localhost:${PORT}`);
  });
}

startServer();
