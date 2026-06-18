'use client';

import { useState } from 'react';
import { ThumbsUp, Edit, Copy, Download, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface OptimizationResultProps {
  originalResume: string;
  optimizedResume: string;
  onReset: () => void;
}

export function OptimizationResult({ originalResume, optimizedResume, onReset }: OptimizationResultProps) {
  const [activeTab, setActiveTab] = useState<'optimized' | 'original' | 'compare'>('optimized');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsWord = (content: string, filename: string) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [new Paragraph({ children: [new TextRun(content)] })],
      }],
    });
    if (!filename.toLowerCase().endsWith('.docx')) filename = filename.replace(/\.[^/.]+$/, '') + '.docx';
    Packer.toBlob(doc).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    });
  };

  const tabs = [
    { id: 'optimized', label: 'Optimized Resume' },
    { id: 'original', label: 'Original Resume' },
    { id: 'compare', label: 'Compare' },
  ] as const;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="text-center py-4 mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <ThumbsUp className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Resume Optimization Complete!</h3>
        <p className="text-gray-600">Your resume has been optimized for better visibility with hiring managers and ATS systems.</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'optimized' && (
          <div className="relative">
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button onClick={() => copyToClipboard(optimizedResume)} className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors" title="Copy to clipboard">
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
              <button onClick={() => downloadAsWord(optimizedResume, 'optimized-resume')} className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors" title="Download as Word">
                <Download className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200 h-[600px] overflow-y-auto">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 text-sm">AI Assistant</span>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                  <div className="prose prose-blue prose-sm max-w-none bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimizedResume}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
            {copied && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm shadow-lg">
                Copied to clipboard!
              </div>
            )}
          </div>
        )}

        {activeTab === 'original' && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-[600px] overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{originalResume}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2 py-2">
                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs border border-gray-300">ORIGINAL</span>
                <span className="text-xs text-gray-500">Before optimization</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-y-auto flex-1">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{originalResume}</ReactMarkdown>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2 py-2">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs border border-blue-200">OPTIMIZED</span>
                <span className="text-xs text-gray-500">After optimization</span>
              </div>
              <div className="bg-blue-50/30 rounded-lg p-4 border border-blue-100 overflow-y-auto flex-1">
                <div className="prose prose-blue prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimizedResume}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key improvements */}
      <div className="bg-blue-50/50 rounded-lg p-4 mb-6 border border-blue-100">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Edit className="h-5 w-5 text-blue-600" />
          Key Improvements
        </h4>
        <ul className="text-sm text-gray-600 space-y-2 pl-8 list-disc marker:text-blue-500">
          <li>Enhanced keywords for better ATS visibility</li>
          <li>Improved action verbs to highlight accomplishments</li>
          <li>Restructured content for better readability</li>
          <li>Streamlined information to focus on relevant skills and experience</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onReset} className="py-2.5 px-5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
          Upload Another Resume
        </button>
        <button
          type="button"
          onClick={() => downloadAsWord(optimizedResume, 'optimized-resume')}
          className="flex items-center justify-center gap-2 py-2.5 px-5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
        >
          <Download className="w-4 h-4" />
          Download Optimized Resume
        </button>
      </div>
    </div>
  );
}
