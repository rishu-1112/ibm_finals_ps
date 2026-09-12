import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-900 shadow-xs">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <strong className="font-bold block">Failed to load live data</strong>
          <span className="text-red-700 font-medium">{message || 'Unable to connect to backend server.'}</span>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
