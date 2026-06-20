'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { OptimizationResult } from '@/components/upload/OptimizationResult';
import { JobDescriptionInput } from '@/components/upload/JobDescriptionInput';

interface ResumeDetail {
  _id: string;
  filename: string;
  text: string;
  uploadedAt: string;
}

interface OptimizationEntry {
  _id: string;
  optimizedText: string;
  targetRole?: string;
  jobDescriptions?: string[];
  createdAt: string;
  model: string;
}

interface ResumeEnvelope {
  resume: ResumeDetail;
  optimizations: OptimizationEntry[];
}

interface OptimizeEnvelope {
  optimizationId: string;
  originalText: string;
  optimizedText: string;
  targetRole: string;
  jobDescriptions: string[];
}

export default function ResumeDetailPage() {
  const params = useParams<{ id: string }>();
  const resumeId = params.id;

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [history, setHistory] = useState<OptimizationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [targetRole, setTargetRole] = useState('');
  const [jobDescriptions, setJobDescriptions] = useState<string[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [result, setResult] = useState<{ original: string; optimized: string } | null>(null);

  useEffect(() => {
    async function fetchResume() {
      try {
        const res = await fetch(`/api/v1/resume/${resumeId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error ?? 'Failed to load resume');
        }
        const data = json.data as ResumeEnvelope;
        setResume(data.resume);
        setHistory(data.optimizations ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [resumeId]);

  async function handleOptimize() {
    if (!resume?.text) {
      setOptimizeError('No resume text found.');
      return;
    }
    setOptimizing(true);
    setOptimizeError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          targetRole: targetRole.trim() || undefined,
          jobDescriptions: jobDescriptions.filter((s) => s.trim().length > 0),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Optimization failed');
      }

      const data = json.data as OptimizeEnvelope;
      const newEntry: OptimizationEntry = {
        _id: data.optimizationId,
        optimizedText: data.optimizedText,
        targetRole: data.targetRole,
        jobDescriptions: data.jobDescriptions,
        createdAt: new Date().toISOString(),
        model: 'gpt-3.5-turbo',
      };
      setHistory((h) => [newEntry, ...h]);
      setResult({ original: data.originalText, optimized: data.optimizedText });
      toast.success('Resume optimized!');
      setJobDescriptions([]);
      setTargetRole('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Optimization failed.';
      setOptimizeError(msg);
      toast.error(msg);
    } finally {
      setOptimizing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <button onClick={() => setResult(null)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to resume
        </button>
        <OptimizationResult
          originalResume={result.original}
          optimizedResume={result.optimized}
          onReset={() => setResult(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 truncate max-w-xs">{resume?.filename}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{resume?.filename}</h1>
          {resume?.uploadedAt && (
            <p className="text-sm text-gray-500">Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI Resume Optimization</h2>
          <p className="text-sm text-gray-500">Tailor the optimization with a target role and one or more job descriptions, or just hit Optimize.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="target-role" className="block text-sm font-medium text-gray-700">
            Target Role / Industry <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="target-role"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={optimizing}
            placeholder="e.g. Senior Software Engineer (defaults to 'General Professional')"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>

        <JobDescriptionInput
          value={jobDescriptions}
          onChange={setJobDescriptions}
          disabled={optimizing}
        />

        {optimizeError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{optimizeError}</div>
        )}

        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 transition-all"
        >
          {optimizing ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Optimizing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Optimize Resume
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Optimization History</h2>

        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No optimizations yet. Use the form above to get started.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map((opt) => (
              <li key={opt._id} className="py-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{opt.optimizedText}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(opt.createdAt).toLocaleString()} · {opt.model}
                      {opt.targetRole ? ` · ${opt.targetRole}` : ''}
                      {opt.jobDescriptions && opt.jobDescriptions.length > 0
                        ? ` · ${opt.jobDescriptions.length} JD${opt.jobDescriptions.length > 1 ? 's' : ''}`
                        : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setResult({ original: resume?.text ?? '', optimized: opt.optimizedText })}
                    className="flex-shrink-0 text-xs font-medium text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
