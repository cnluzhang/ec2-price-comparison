import React from 'react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mt-8 flex justify-center">
      <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 max-w-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;