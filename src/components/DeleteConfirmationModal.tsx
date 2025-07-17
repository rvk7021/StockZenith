import React from 'react';

export default function DeleteConfirmationModal({ open, onCancel, onConfirm }: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm border border-red-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-red-600 mb-2">Delete Portfolio?</h2>
          <p className="text-gray-700 mb-6">Are you sure you want to delete this portfolio? This action cannot be undone.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-extrabold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-lg bg-red-500 text-white font-extrabold hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 