import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PortfolioCard from '../../../components/PortfolioCard';

interface Lot {
  id?: string;
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
}

interface PublicPortfolio {
  id: string;
  name: string;
  cash: number;
  lots: Lot[];
  createdAt: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED';
}

const UserPublicPortfoliosPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [portfolios, setPortfolios] = useState<PublicPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!userId || typeof userId !== 'string') return;
    setLoading(true);
    setError('');
    // Fetch all public portfolios for the user (with full details)
    fetch(`/api/public-portfolios?userId=${userId}`)
      .then(res => res.json())
      .then(async data => {
        if (!data.portfolios || data.portfolios.length === 0) {
          setPortfolios([]);
          setLoading(false);
          return;
        }
        // Fetch full details for each portfolio
        const details = await Promise.all(
          data.portfolios.map((p: { id: string }) =>
            fetch(`/api/public-portfolio/${p.id}`).then(res => res.json())
          )
        );
        setPortfolios(details);
        // Gather all tickers
        const tickers = Array.from(new Set(details.flatMap((p: PublicPortfolio) => p.lots.map((l: Lot) => l.ticker))));
        if (tickers.length > 0) {
          const priceRes = await fetch('/api/stock-prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tickers }),
          });
          const priceData = await priceRes.json();
          setPrices(priceData.prices || {});
        } else {
          setPrices({});
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load public portfolios');
        setLoading(false);
      });
  }, [userId]);

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between w-full mb-8 gap-4 bg-white/80 backdrop-blur-sm border-b border-blue-200 rounded-2xl shadow p-4 sm:p-8 flex-wrap">
      <div className="flex items-center gap-4 cursor-pointer sm:justify-start justify-center w-full sm:w-auto" onClick={() => router.push('/')}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="flex flex-col items-start">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 tracking-tight leading-none">StockZenith</h1>
          <p className="font-sans text-blue-400 text-base sm:text-lg font-medium">Manage and track your investments</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center w-full sm:w-auto">
        <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-blue-800 tracking-tight drop-shadow-sm text-center">Public Portfolios</h2>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-10 font-sans">
        <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
          {renderHeader()}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-blue-600 text-lg font-medium">Loading portfolios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-10 font-sans">
        <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
          {renderHeader()}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 text-lg font-medium text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-10 font-sans">
        <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
          {renderHeader()}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-center max-w-md">
              <h3 className="font-sans text-2xl sm:text-3xl font-bold text-blue-800 mb-3 tracking-tight">
                No Public Portfolios
              </h3>
              <p className="font-sans text-blue-600 text-lg font-medium mb-2 leading-relaxed">
                This user hasn&apos;t shared any portfolios yet
              </p>
              <p className="font-sans text-blue-500 text-base leading-relaxed opacity-80">
                When they make their portfolios public, you&apos;ll be able to view their investment strategies and performance here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-10 font-sans">
      <div className="container mx-auto px-2 sm:px-4  max-w-7xl">
        {renderHeader()}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {portfolios.map((portfolio,) => (
            <div key={portfolio.id}>
              <PortfolioCard
                portfolio={portfolio}
                prices={prices}
                onView={() => router.push(`/public/${userId}/${portfolio.id}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPublicPortfoliosPage;