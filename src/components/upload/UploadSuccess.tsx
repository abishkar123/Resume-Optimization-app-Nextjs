'use client';

interface UploadSuccessProps {
  isOptimizing: boolean;
  onOptimize: () => void;
}

export function UploadSuccess({ isOptimizing, onOptimize }: UploadSuccessProps) {
  return (
    <div className="bg-white shadow rounded-lg p-8">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Successfully Uploaded!</h3>
        <p className="text-sm text-gray-500 mb-8">Your file has been uploaded and is ready for AI analysis.</p>
        <button
          type="button"
          onClick={onOptimize}
          disabled={isOptimizing}
          className="bg-blue-600 py-2.5 px-6 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isOptimizing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Optimizing Resume...
            </span>
          ) : (
            'Optimize My Resume'
          )}
        </button>
      </div>
    </div>
  );
}
