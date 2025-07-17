import { Share2, CheckCircle, Home, Eye, EyeOff, Users, Lock } from 'lucide-react';
import React from 'react';
import type { Portfolio } from '../pages/dashboard';
import Link from 'next/link';

export default function PortfolioDetailHeader({
  portfolio,
  shareLink,
  shareLoading,
  shareError,
  showShareLinkInline,
  copySuccess,
  shareInputRef,
  onShare,
  onEdit,
  onDelete,
  onCopy,

}: {
  portfolio: Portfolio;
  shareLink: string | null;
  shareLoading: boolean;
  shareError: string;
  showShareLinkInline: boolean;
  copySuccess: boolean;
  shareInputRef: React.RefObject<HTMLInputElement>;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  setShowShareLinkInline: (v: boolean) => void;
  getVisibilityIcon: (v: string) => React.ReactNode;
}) {
  const getVisibilityDetails = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return { icon: <Lock className="w-4 h-4" />, label: 'Private', color: 'text-gray-600' };
      case 'public':
        return { icon: <Eye className="w-4 h-4" />, label: 'Public', color: 'text-green-600' };
      case 'friends_only':
        return { icon: <Users className="w-4 h-4" />, label: 'Friends Only', color: 'text-blue-600' };
      default:
        return { icon: <EyeOff className="w-4 h-4" />, label: visibility, color: 'text-gray-600' };
    }
  };

  const visibilityDetails = getVisibilityDetails(portfolio.visibility);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors group">
                <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">Dashboard</span>
              </div>
            </Link>
            <div className="text-gray-400 hidden sm:block">/</div>
            <span className="text-gray-600 font-medium text-xs sm:text-sm hidden sm:block">Portfolio Details</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {!shareLink && (
              <button
                onClick={onShare}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 border border-transparent rounded-lg shadow-sm hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                disabled={shareLoading}
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{shareLoading ? 'Generating...' : 'Share Portfolio'}</span>
                <span className="sm:hidden">{shareLoading ? 'Generating...' : 'Share'}</span>
              </button>
            )}
            
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Portfolio
            </button>
            
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 text-sm font-bold text-red-700 bg-white border border-red-300 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Portfolio
            </button>
          </div>
        </div>

        {/* Portfolio Header */}
        <div className="py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Portfolio Title and Basic Info */}
            <div className="flex flex-col">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-4 break-words tracking-tight leading-tight">
                  {portfolio.name}
                </h1>
                
                {/* Portfolio Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Owner Card */}
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-indigo-600 uppercase tracking-wide">Owner</p>
                        <p className="text-sm sm:text-base font-bold text-indigo-900">You</p>
                      </div>
                    </div>
                  </div>

                  {/* Cash Balance Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-600 uppercase tracking-wide">Available Cash</p>
                        <p className="text-sm sm:text-base font-bold text-green-900 font-mono">${portfolio.cash.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Visibility Card */}
                  <div className={`bg-gradient-to-r ${
                    portfolio.visibility === 'PRIVATE' ? 'from-gray-50 to-gray-100 border-gray-200' :
                    portfolio.visibility === 'PUBLIC' ? 'from-blue-50 to-blue-100 border-blue-200' :
                    'from-purple-50 to-purple-100 border-purple-200'
                  } border rounded-xl p-4 sm:p-5 sm:col-span-2 lg:col-span-1`}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        portfolio.visibility === 'PRIVATE' ? 'bg-gray-500' :
                        portfolio.visibility === 'PUBLIC' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}>
                        <span className="text-white">
                          {visibilityDetails.icon}
                        </span>
                      </div>
                      <div>
                        <p className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${
                          portfolio.visibility === 'PRIVATE' ? 'text-gray-600' :
                          portfolio.visibility === 'PUBLIC' ? 'text-blue-600' :
                          'text-purple-600'
                        }`}>Visibility</p>
                        <p className={`text-sm sm:text-base font-bold ${
                          portfolio.visibility === 'PRIVATE' ? 'text-gray-900' :
                          portfolio.visibility === 'PUBLIC' ? 'text-blue-900' :
                          'text-purple-900'
                        }`}>{visibilityDetails.label}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Link Section */}
            {shareLink && showShareLinkInline && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">Share Portfolio</h3>
                      <p className="text-xs sm:text-sm text-slate-600">Anyone with this link can view your portfolio</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        ref={shareInputRef}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono bg-white transition-all duration-200 hover:border-slate-400 min-w-0"
                        value={shareLink}
                        readOnly
                        onFocus={e => e.target.select()}
                        placeholder="Share link will appear here..."
                      />
                    </div>
                    <button
                      onClick={onCopy}
                      className="inline-flex items-center justify-center px-4 sm:px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 border border-transparent rounded-lg hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                      <span className="sm:hidden">{copySuccess ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {shareError && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-red-900 mb-1">Error</h3>
                    <p className="text-xs sm:text-sm text-red-800">{shareError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}