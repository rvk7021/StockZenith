import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Portfolio } from '../pages/dashboard';

interface AIInsights {
  summary?: string | string[];
  sector_analysis?: string | string[];
  diversification?: string | string[];
  risk_assessment?: string | string[];
  recommendations?: string | string[];
}

function renderInsightSection(section: string | string[] | undefined): React.ReactNode {
  if (!section) return <span className="text-gray-400 font-medium">No data available.</span>;
  if (typeof section === 'string') {
    const points = section.split(/\n|\. /).map(s => s.trim()).filter(Boolean).slice(0, 5);
    return (
      <ul className="list-disc pl-6 space-y-1 text-blue-900 text-base font-medium">
        {points.map((point, idx) => <li key={idx}>{point}</li>)}
      </ul>
    );
  }
  if (Array.isArray(section)) {
    return (
      <ul className="list-disc pl-6 space-y-1 text-blue-900 text-base font-medium">
        {section.slice(0, 5).map((item, idx) => <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
      </ul>
    );
  }
  return String(section);
}

const PortfolioDashboardAIInsights: React.FC<{ portfolios: Portfolio[] }> = ({ portfolios }) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Combine all portfolios into one
  const combinedPortfolio = React.useMemo(() => {
    if (!portfolios || portfolios.length === 0) return null;
    const allLots = portfolios.flatMap(p => p.lots);
    const totalCash = portfolios.reduce((sum, p) => sum + (p.cash || 0), 0);
    return {
      id: 'all',
      name: 'All Portfolios',
      cash: totalCash,
      visibility: 'PRIVATE',
      lots: allLots,
    };
  }, [portfolios]);

  useEffect(() => {
    if (!combinedPortfolio) return;
    setLoading(true);
    setError('');
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio: combinedPortfolio }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch insights');
        return res.json();
      })
      .then((data) => setInsights(data))
      .catch((e) => setError(e.message || 'Failed to fetch insights'))
      .finally(() => setLoading(false));
  }, [JSON.stringify(combinedPortfolio)]);

  if (!portfolios || portfolios.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto my-10 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-7 h-7 text-blue-400" />
        <h2 className="text-2xl font-extrabold text-indigo-900">AI Insights for All Portfolios</h2>
      </div>
      <div className="rounded-2xl bg-white/90 p-7 flex flex-col min-h-[260px] shadow-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-800 font-extrabold text-xl tracking-wide">All Portfolios</span>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-400 rounded-full animate-spin mb-2"></div>
            <span className="text-blue-700 font-medium">Generating insights...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm font-semibold">{error}</div>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1 block">Summary</span>
              {renderInsightSection(insights?.summary)}
            </div>
            <div className="mb-4">
              <span className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1 block">Sector</span>
              {renderInsightSection(insights?.sector_analysis)}
            </div>
            <div className="mb-4">
              <span className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1 block">Diversification</span>
              {renderInsightSection(insights?.diversification)}
            </div>
            <div className="mb-4">
              <span className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1 block">Risk</span>
              {renderInsightSection(insights?.risk_assessment)}
            </div>
            <div>
              <span className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1 block">Recommendations</span>
              {renderInsightSection(insights?.recommendations)}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PortfolioDashboardAIInsights; 