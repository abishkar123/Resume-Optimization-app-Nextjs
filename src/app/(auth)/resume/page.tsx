'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UploadForm } from '@/components/upload/UploadForm';
import { FeaturesSection } from '@/components/upload/FeaturesSection';

export default function ResumeUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selected: File) => {
    setError('');
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(selected.type)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90));
      }, 150);

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Upload failed');
      }

      const { resumeId } = json.data as { resumeId: string };
      toast.success('Resume uploaded!');
      router.push(`/resume/${resumeId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Upload Your Resume</h2>
          <p className="mt-2 text-lg text-gray-600">
            We&apos;ll analyze your resume and provide AI-powered optimization suggestions to help you land your dream job.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
        )}

        <UploadForm
          file={file}
          error=""
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          isDragging={isDragging}
          onFileChange={handleFileChange}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
          }}
          onUpload={handleUpload}
          onReset={handleReset}
        />

        <FeaturesSection />
      </div>
    </div>
  );
}
