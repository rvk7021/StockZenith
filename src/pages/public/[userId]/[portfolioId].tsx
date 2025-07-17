import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import HoldingsSection from '../../../components/HoldingsSection';
import PortfolioSummarySection from '../../../components/PortfolioSummarySection';
import ChatbotSection from '../../../components/ChatbotSection';
import { Brain, Sparkles, RefreshCw, BarChart3, PieChart, Activity, AlertCircle } from 'lucide-react';

interface Lot {
  id?: string;
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
}

interface PublicPortfolioDetailType {
  id: string;
  name: string;
  cash: number;
  lots: Lot[];
  createdAt: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED';
}

function InsightsSection({ portfolio }: { portfolio: PublicPortfolioDetailType }) {
  const [insights, setInsights] = useState<{
    summary: string;
    sectorAnalysis: string;
    diversification: string;
    risk: string;
    recommendations: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const uniqueTickers = new Set(portfolio.lots.map(lot => lot.ticker));
      const totalLots = portfolio.lots.length;
      const totalInvestment = portfolio.lots.reduce((sum, lot) => sum + (lot.quantity * lot.pricePaid), 0);
      const cash = portfolio.cash ?? 0;
      const cashPct = (cash / (cash + totalInvestment)) * 100;

      // Sector analysis
      const sectorMap: Record<string, number> = {};
      portfolio.lots.forEach(lot => {
        const sector = 'Other'; // You can add sector mapping if needed
        sectorMap[sector] = (sectorMap[sector] || 0) + lot.quantity * lot.pricePaid;
      });
      const sectorEntries = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]);
      const topSectors = sectorEntries.slice(0, 3).map(([sector, value]) => `${sector} (${((value / totalInvestment) * 100).toFixed(1)}%)`).join(', ');
      const sectorConcentration = sectorEntries.length > 0 ? ((sectorEntries[0][1] / totalInvestment) * 100).toFixed(1) : '0';

      // Holdings analysis
      const holdingMap: Record<string, number> = {};
      portfolio.lots.forEach(lot => {
        holdingMap[lot.ticker] = (holdingMap[lot.ticker] || 0) + lot.quantity * lot.pricePaid;
      });
      const holdingEntries = Object.entries(holdingMap).sort((a, b) => b[1] - a[1]);
      const largestHolding = holdingEntries.length > 0 ? holdingEntries[0] : null;
      const largestHoldingPct = largestHolding ? (largestHolding[1] / totalInvestment) * 100 : 0;

      // Diversification index (Herfindahl-Hirschman Index)
      const hhi = Object.values(holdingMap).reduce((sum, v) => sum + Math.pow(v / totalInvestment, 2), 0) * 10000;

      // Recent activity
      const recentLots = portfolio.lots.filter(lot => {
        if (!lot.date) return false;
        const lotDate = new Date(lot.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lotDate >= thirtyDaysAgo;
      });

      // Top gainers/losers (simulate, as we don't have current prices here)
      const gainers = holdingEntries.slice(0, 2).map(([ticker, ]) => ticker);
      const losers = holdingEntries.slice(-2).map(([ticker, ]) => ticker);

      // Cash to equity ratio
      const equity = totalInvestment;
      const cashToEquity = equity > 0 ? (cash / equity) * 100 : 0;

      let volatility = 'Moderate';
      if (uniqueTickers.size < 3 || hhi > 3000) volatility = 'High';
      else if (uniqueTickers.size > 10 && hhi < 1500) volatility = 'Low';

      setInsights({
        summary: totalLots === 0
          ? 'No investments yet. Start building your portfolio for AI-powered insights.'
          : `This portfolio contains ${totalLots} lots across ${uniqueTickers.size} unique stocks. The largest holding is ${largestHolding ? `${largestHolding[0]} ($${largestHolding[1].toLocaleString()}, ${largestHoldingPct.toFixed(1)}% of portfolio)` : 'N/A'}. Total invested: $${totalInvestment.toLocaleString()}. Cash available: $${cash.toLocaleString()} (${cashPct.toFixed(1)}% of total). Cash-to-equity ratio: ${cashToEquity.toFixed(1)}%.`,
        sectorAnalysis: totalLots === 0
          ? 'N/A'
          : `Top sector exposures: ${topSectors || 'N/A'}. The largest sector represents ${sectorConcentration}% of your portfolio. ${sectorEntries.length > 1 ? 'Your investments are spread across multiple sectors, which can help reduce sector-specific risk.' : 'Your portfolio is concentrated in a single sector, increasing risk if that sector underperforms.'}`,
        diversification: uniqueTickers.size < 3
          ? `Low diversification. Only ${uniqueTickers.size} unique stocks. Consider adding more positions across different sectors and market caps. Diversification index (HHI): ${hhi.toFixed(0)} (higher means more concentrated).`
          : uniqueTickers.size > 15
            ? `High diversification with ${uniqueTickers.size} stocks. This provides good risk reduction but may limit potential returns. Diversification index (HHI): ${hhi.toFixed(0)}.`
            : `Moderate diversification with ${uniqueTickers.size} stocks. Good balance between risk management and return potential. Diversification index (HHI): ${hhi.toFixed(0)}.`,
        risk: `Portfolio volatility is estimated as ${volatility}. ${hhi > 3000 ? 'High concentration risk due to large position sizes.' : hhi < 1500 ? 'Well-distributed holdings reduce concentration risk.' : 'Moderate concentration with some larger positions.'} The largest holding is ${largestHolding ? `${largestHolding[0]} at ${largestHoldingPct.toFixed(1)}%` : 'N/A'}. Sector concentration: ${sectorConcentration}%. Cash allocation: ${cashPct.toFixed(1)}% provides ${cashPct > 20 ? 'high' : cashPct > 10 ? 'moderate' : 'low'} liquidity.`,
        recommendations: totalLots === 0
          ? 'Start investing to build wealth over time. Consider a diversified approach across sectors and market caps.'
          : `Recent activity: ${recentLots.length} lots added in last 30 days. Top gainers: ${gainers.join(', ') || 'N/A'}. Top underweighted: ${losers.join(', ') || 'N/A'}. ${uniqueTickers.size < 5 ? 'Consider diversifying into new sectors and reducing concentration in your largest positions.' : largestHoldingPct > 25 ? 'Consider reducing position size of your largest holding and rebalancing your portfolio.' : 'Continue regular investing with a focus on rebalancing and monitoring sector exposures.'}`
      });
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    generateInsights();
    // eslint-disable-next-line
  }, [portfolio]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-blue-900">AI Portfolio Insights</h2>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="p-2 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-blue-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-blue-50 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : insights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-200 rounded-lg p-4 flex flex-col">
              <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Portfolio Summary
              </h3>
              <p className="text-blue-400 text-sm leading-relaxed">{insights.summary}</p>
            </div>

            <div className="bg-green-100 rounded-lg p-4 flex flex-col">
              <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Sector Analysis
              </h3>
              <p className="text-blue-400 text-sm leading-relaxed">{insights.sectorAnalysis}</p>
            </div>

            <div className="bg-yellow-100 rounded-lg p-4 flex flex-col">
              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Diversification
              </h3>
              <p className="text-blue-400 text-sm leading-relaxed">{insights.diversification}</p>
            </div>

            <div className="bg-red-100 rounded-lg p-4 flex flex-col">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Risk Assessment
              </h3>
              <p className="text-blue-400 text-sm leading-relaxed">{insights.risk}</p>
            </div>

            <div className="bg-purple-100 rounded-lg p-4 flex flex-col md:col-span-2 lg:col-span-1">
              <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recommendations
              </h3>
              <p className="text-blue-400 text-sm leading-relaxed">{insights.recommendations}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-blue-400">Click refresh to generate AI insights</p>
          </div>
        )}
      </div>
    </div>
  );
}

const initialChatMessages = (portfolio: PublicPortfolioDetailType) => ([
  {
    id: '1',
    content: `Hello! I'm your AI portfolio assistant. I can help you analyze "${portfolio.name}" and answer questions about your investments.`,
    isUser: false,
    timestamp: new Date()
  }
]);

const PublicPortfolioDetailPage = () => {
  const router = useRouter();
  const { portfolioId } = router.query;
  const [portfolio, setPortfolio] = useState<PublicPortfolioDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    if (!portfolioId || typeof portfolioId !== 'string') return;
    setLoading(true);
    fetch(`/api/public-portfolio/${portfolioId}`)
      .then(res => res.json())
      .then(data => {
        setPortfolio(data);
        setChatMessages(initialChatMessages(data));
      })
      .catch(() => setError('Failed to load portfolio details'))
      .finally(() => setLoading(false));
  }, [portfolioId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
        <p className="text-indigo-900 text-lg font-bold tracking-tight">Loading portfolio...</p>
        <p className="text-blue-600 text-base mt-2 font-medium">Please wait while we fetch your data</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-red-600 font-extrabold text-2xl mb-2 tracking-tight">Error Loading Portfolio</h2>
        <p className="text-blue-700 mb-6 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-400 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );

  if (!portfolio) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Improved Header */}
      <header className="w-full bg-white/90 backdrop-blur-lg border-b border-blue-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 lg:py-8 gap-6">
            {/* Logo Section */}
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push('/')}
            >
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <svg 
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                    />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 tracking-tight leading-none">
                  StockZenith
                </h1>
                <p className="text-sm sm:text-base text-blue-500/80 font-medium tracking-wide">
                  Smart Portfolio Management
                </p>
              </div>
            </div>

            {/* Portfolio Info Section */}
            <div className="flex-1 lg:max-w-2xl">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {portfolio.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm sm:text-base">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-semibold">Public Portfolio</span>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-700">
                      Cash: <span className="font-bold">${portfolio.cash.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 font-semibold">
                      {portfolio.visibility.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Holdings - Full Width */}
          <div className="xl:col-span-4 space-y-6">
            <HoldingsSection lots={portfolio.lots} />
          </div>

          {/* Portfolio Summary - Full Width Below */}
          <div className="xl:col-span-4">
            <PortfolioSummarySection lots={portfolio.lots} cash={portfolio.cash} />
          </div>

          {/* AI Insights - Full Width Below */}
          <div className="xl:col-span-4">
            <InsightsSection portfolio={portfolio} />
          </div>
        </div>
        
        {/* Floating Chat Button */}
        <button
          ref={chatButtonRef}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-3 sm:px-6 rounded-full shadow-lg flex items-center gap-2 font-bold text-base sm:text-lg transition-all transform hover:scale-105"
        >
          <Brain className="w-6 h-6" />
          <span className="hidden sm:inline">Ask Me</span>
        </button>
        
        {/* Chat Panel - Bottom Right */}
        {chatOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-8 sm:right-8 z-50 flex items-end sm:block justify-center">
            <div className="w-full sm:w-[370px] md:w-[420px] max-w-full bg-white/90 backdrop-blur-lg rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col relative animate-fade-in-up border border-blue-200/50 mx-0 sm:mx-auto" style={{ minHeight: '400px', maxHeight: '80vh' }}>
              {/* Chat Header with Close Button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-900">AI Assistant</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-blue-400 hover:text-blue-700 p-2 rounded-full focus:outline-none hover:bg-blue-100 transition-colors"
                  aria-label="Close chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ChatbotSection portfolio={portfolio} messages={chatMessages} setMessages={setChatMessages} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPortfolioDetailPage;