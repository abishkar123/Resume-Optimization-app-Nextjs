'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Resume {
  _id: string;
  filename: string;
  uploadedAt: string;
  optimizations?: number;
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { setError('Not authenticated'); return; }

        const res = await fetch('/api/resume', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error ?? 'Failed to fetch resumes');
        }
        setResumes(Array.isArray(json.data) ? (json.data as Resume[]) : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  return (
    <div>
      {/* Header row */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Resumes</h1>
          <p className="text-gray-500 mt-1">Manage and optimize your uploaded resumes</p>
        </div>
        <Link
          href="/resume"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          + Upload New Resume
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && resumes.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
          <p className="text-gray-500 mb-6">Upload your first resume and let AI optimize it for you.</p>
          <Link
            href="/resume"
            className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:shadow-lg transition-all"
          >
            Upload Your First Resume
          </Link>
        </div>
      )}

      {/* Resume list */}
      {!loading && !error && resumes.length > 0 && (
        <ul className="space-y-3">
          {resumes.map((resume) => (
            <li key={resume._id}>
              <Link
                href={`/resume/${resume._id}`}
                className="flex justify-between items-center p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{resume.filename}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {resume.optimizations !== undefined && resume.optimizations > 0 && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {resume.optimizations} optimization{resume.optimizations !== 1 ? 's' : ''}
                    </span>
                  )}
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
