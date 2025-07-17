import React, { useState } from 'react';
import { BarChart3, Eye, Users, Link2, Clock, XCircle, Copy, Check } from 'lucide-react';

interface Analytics {
  portfolioName: string;
  link: string;
  viewCount: number;
  uniqueViewers: number;
  lastViewed?: string;
  token: string;
}

export default function AnalyticsSection({
  analytics,
  analyticsLoading,
  analyticsError,
  handleRevoke,
}: {
  analytics: Analytics[];
  analyticsLoading: boolean;
  analyticsError: string;
  handleRevoke: (token: string) => Promise<void>;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [revokingIdx, setRevokingIdx] = useState<number | null>(null);
  console.log(revokingIdx);
  function handleCopy(link: string, idx: number) {
    navigator.clipboard.writeText(link);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  async function handleRevokeClick(token: string, idx: number) {
    setRevokingIdx(idx);
    console.log('revoking', token); 
    await handleRevoke(token);
    setRevokingIdx(null);
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateLink = (link: string, maxLength: number = 35) => {
    if (link.length <= maxLength) return link;
    return link.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 w-full mx-auto mt-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Share Link Analytics</h2>
        </div>
        {analytics.length > 0 && (
          <div className="text-sm font-medium text-blue-600">
            {analytics.length} active {analytics.length === 1 ? 'link' : 'links'}
          </div>
        )}
      </div>

      {analyticsLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500">Loading analytics data...</p>
        </div>
      ) : analyticsError ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">{analyticsError}</p>
        </div>
      ) : analytics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Link2 className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-slate-500 mb-2">No shared links yet</p>
          <p className="text-sm text-slate-400">Create your first shareable portfolio link to see analytics here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analytics.map((a, i) => (
            <div key={i} className="bg-slate-50 rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-blue-900 truncate tracking-tight" title={a.portfolioName}>
                      {a.portfolioName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900 text-sm font-semibold transition-colors block truncate"
                        title={a.link}
                      >
                        {truncateLink(a.link)}
                      </a>
                    </div>
                    <button
                      onClick={() => handleCopy(a.link, i)}
                      className={`flex-shrink-0 p-1.5 rounded-md border transition-all ${
                        copiedIdx === i
                          ? 'bg-green-50 border-green-200 text-green-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                      }`}
                      title="Copy link"
                    >
                      {copiedIdx === i ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-900 leading-tight">{a.viewCount}</div>
                    <div className="text-xs font-medium text-slate-500">Total Views</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-700 leading-tight">{a.uniqueViewers}</div>
                    <div className="text-xs font-medium text-slate-500">Unique Viewers</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-amber-700 leading-tight">{formatDate(a.lastViewed)}</div>
                    <div className="text-xs font-medium text-slate-500">Last Viewed</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleRevokeClick(a.token, i)}
                  className={`px-3 py-1.5 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-md flex items-center gap-1.5 tracking-tight transition-colors ${revokingIdx === i ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-100'}`}
                  title="Revoke access"
                  disabled={revokingIdx === i}
                >
                  {revokingIdx === i ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}