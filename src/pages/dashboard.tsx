import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import PortfolioForm from '../components/PortfolioForm';
import PortfolioGrid from '../components/PortfolioGrid';
import PortfolioOverviewAnalytics from '../components/PortfolioOverviewAnalytics';
import PortfolioDashboardAIInsights from '../components/PortfolioDashboardAIInsights';
import { useRouter } from 'next/router';
import PublicUsersList, { PublicUser } from '../components/PublicUsersList';

export interface Lot {
  id?: string;
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  cash: number;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED';
  lots: Lot[];
}

interface Analytics {
  portfolioName: string;
  link: string;
  viewCount: number;
  uniqueViewers: number;
  lastViewed?: string;
  token: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [, setAnalytics] = useState<Analytics[]>([]);
  const [, setAnalyticsLoading] = useState(false);
  const [, setAnalyticsError] = useState('');
  const [portfolioError, setPortfolioError] = useState('');
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [, setPricesLoading] = useState(false);
  const [, setPricesError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPortfolios();
      fetchAnalytics();
    }
  }, [status]);

  // Fetch current prices for all tickers in all portfolios
  useEffect(() => {
    if (!portfolios || portfolios.length === 0) return;
    const tickers = Array.from(new Set(portfolios.flatMap(p => p.lots.map(lot => lot.ticker))));
    if (tickers.length === 0) return;
    setPricesLoading(true);
    setPricesError('');
    fetch('/api/stock-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers }),
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch prices');
        return res.json();
      })
      .then(data => setPrices(data.prices || {}))
      .catch(e => setPricesError(e.message || 'Failed to fetch prices'))
      .finally(() => setPricesLoading(false));
  }, [portfolios]);

  async function fetchPortfolios() {
    setLoading(true);
    setPortfolioError('');
    const res = await fetch('/api/portfolio');
    const data = await res.json();
    if (Array.isArray(data)) {
      setPortfolios(data);
    } else if (data && data.error) {
      setPortfolios([]);
      setPortfolioError(data.error);
    } else {
      setPortfolios([]);
      setPortfolioError('Failed to load portfolios');
    }
    setLoading(false);
  }

  async function fetchAnalytics() {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data.analytics || []);
    } catch (e) {
      setAnalyticsError('Failed to load analytics');
      console.error(e);
    }
    setAnalyticsLoading(false);
  }

  function handleNew() {
    setEditing(null);
    setShowForm(true);
  }







  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (portfolioError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-red-500/20 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-red-300">{portfolioError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="container mx-auto px-2 sm:px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 bg-white/80 backdrop-blur-sm border-b border-blue-200 rounded-2xl shadow p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 tracking-tight leading-none">StockZenith</h1>
              <p className="text-blue-400 font-medium">Manage and track your investments</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleNew}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center gap-2 ring-1 ring-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Portfolio
            </button>
            <button
              onClick={() => signOut()}
              className="bg-gray-100 text-blue-700 font-bold py-3 px-6 rounded-full hover:bg-blue-50 transition-all duration-200 shadow flex items-center gap-2 border border-blue-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow p-4 sm:p-8 mb-8">
          <PortfolioGrid
            portfolios={portfolios}
            loading={loading}
            handleNew={handleNew}
            prices={prices}
          />
        </div>

        {/* Public Portfolios Explorer */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow p-4 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Explore Public Portfolios</h2>
          <PublicUsersList onSelect={(user: PublicUser) => router.push(`/public/${user.id}`)} />
        </div>

        {/* Portfolio Overview Analytics */}
        <PortfolioOverviewAnalytics portfolios={portfolios} prices={prices} />

        {/* AI Insights for all portfolios */}
        <PortfolioDashboardAIInsights portfolios={portfolios} />

      </div>

      {/* Form Modal */}
      {showForm && (
        <PortfolioForm
          initial={editing}
          onClose={() => { setShowForm(false); fetchPortfolios(); }}
        />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}