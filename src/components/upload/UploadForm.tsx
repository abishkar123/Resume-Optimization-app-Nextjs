'use client';

import { Upload } from 'lucide-react';

interface UploadFormProps {
  file: File | null;
  error: string;
  isUploading: boolean;
  uploadProgress: number;
  isDragging: boolean;
  onFileChange: (file: File) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onUpload: () => void;
  onReset: () => void;
}

export function UploadForm({
  file, error, isUploading, uploadProgress, isDragging,
  onFileChange, onDragOver, onDragLeave, onDrop, onUpload, onReset,
}: UploadFormProps) {
  const fileLabel = file?.type === 'application/pdf' ? 'PDF' : 'DOC';

  return (
    <div className="bg-white shadow rounded-lg p-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => { if (e.target.files?.[0]) onFileChange(e.target.files[0]); }}
        />
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-600 font-bold">{fileLabel}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Drag and drop your resume here</h3>
            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, Word (.doc, .docx) · Max 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4 flex gap-3">
          <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isUploading && (
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-blue-600">Uploading to server...</span>
            <span className="text-xs font-semibold text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-blue-100 rounded overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onReset} className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Clear
        </button>
        <button type="button" onClick={onUpload} disabled={!file || isUploading} className="py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isUploading ? 'Uploading...' : 'Upload My Resume'}
        </button>
      </div>
    </div>
  );
}
