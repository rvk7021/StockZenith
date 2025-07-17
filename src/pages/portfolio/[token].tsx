import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, MessageCircle, Search, RefreshCw, AlertCircle, Eye, Users, Lock, Globe, Wallet, BarChart3, Brain, Sparkles, Send, ChevronDown, ChevronUp, Calendar as CalendarIcon } from 'lucide-react';
import { useRef } from 'react';
import ChatbotSection from '../../components/ChatbotSection';

interface Lot {
  id?: string;
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
}

interface Portfolio {
  id: string;
  name: string;
  cash: number;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED';
  lots: Lot[];
  user?: { name?: string };
}

interface Shared {
  id: string;
  token: string;
  revoked: boolean;
}

export default function SharedPortfolio() {
  const router = useRouter();
  const { token } = router.query;
  const [data, setData] = useState<{ portfolio: Portfolio; sharedBy: string; shared: Shared } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  // Persist chat messages across open/close
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
  }>>([
    {
      id: '1',
      content: data?.portfolio ? `Hello! I'm your AI portfolio assistant. I can help you analyze "${data.portfolio.name}" and answer questions about your investments.` : "Hello! I'm your AI portfolio assistant. I can help you analyze your portfolio and answer questions about your investments.",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  // Handler to reset chat if needed (optional)
  // const handleResetChat = () => setChatMessages([...]);

  useEffect(() => {
    if (typeof token === 'string') {
      try {
        const viewed = JSON.parse(localStorage.getItem('viewedTokens') || '[]');
        if (!viewed.includes(token)) {
          viewed.push(token);
          localStorage.setItem('viewedTokens', JSON.stringify(viewed));
        }
      } catch { }
      fetch(`/api/portfolio/${token}`)
        .then(res => res.json())
        .then(d => {
          if (d.error) setError(d.error);
          else setData(d);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load portfolio data');
          setLoading(false);
        });
    }
  }, [token]);

  if (loading) {
    return (
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
  }

  if (error) {
    return (
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
  }

  if (!data) return null;
  const { portfolio, sharedBy } = data;

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE': return <Lock className="w-4 h-4 text-red-400" />;
      case 'PUBLIC': return <Globe className="w-4 h-4 text-blue-500" />;
      case 'SMART_SHARED': return <Users className="w-4 h-4 text-blue-400" />;
      default: return <Eye className="w-4 h-4 text-blue-200" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-indigo-900 mb-2 tracking-tight leading-tight">
              {portfolio.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-blue-600 font-medium justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Shared by: <span className="text-indigo-900 font-bold">{sharedBy}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-500" />
                <span>Cash: <span className="text-blue-700 font-bold">${portfolio.cash.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-2">
                {getVisibilityIcon(portfolio.visibility)}
                <span className="font-semibold text-blue-700">{portfolio.visibility.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Holdings - Full Width */}
          <div className="xl:col-span-4 space-y-6">
            <HoldingsSection lots={portfolio.lots} />
          </div>

          {/* Portfolio Summary - Full Width Below */}
          <div className="xl:col-span-4">
            <PortfolioSummary lots={portfolio.lots} cash={portfolio.cash} />
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
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 sm:px-6 rounded-full shadow-lg flex items-center gap-2 font-bold text-base sm:text-lg transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          Ask Me
        </button>
        {/* Chat Panel - Bottom Right */}
        {chatOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-8 sm:right-8 z-50 flex items-end sm:block justify-center">
            <div className="w-full sm:w-[370px] md:w-[420px] max-w-full bg-white/80 rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col relative animate-fade-in-up border border-blue-200 mx-0 sm:mx-auto" style={{ minHeight: '400px', maxHeight: '80vh' }}>
              {/* Chat Header with Close Button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-blue-900">AI Assistant</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-blue-400 hover:text-blue-700 p-2 rounded-full focus:outline-none"
                  aria-label="Close chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <ChatbotSection portfolio={data?.portfolio} messages={chatMessages} setMessages={setChatMessages} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HoldingsSection({ lots }: { lots: Lot[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const itemsPerPage = 10;

  // Aggregate lots by ticker
  const byTicker = aggregateLots(lots);
  const tickers = Object.keys(byTicker).filter(ticker =>
    ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(tickers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickers = tickers.slice(startIndex, endIndex);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getTickerColor = (ticker: string) => {
    const colors = [
      'bg-blue-200',
      'bg-blue-100',
      'bg-blue-300',
      'bg-blue-50',
      'bg-blue-400',
      'bg-blue-100',
      'bg-blue-200',
      'bg-blue-50',
    ];
    return colors[ticker.length % colors.length];
  };

  const toggleExpand = (ticker: string) => {
    setExpanded(prev => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="p-6 border-b border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <PieChart className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-extrabold text-indigo-900 tracking-tight">Holdings</h2>
            <span className="text-base text-blue-600 font-semibold">({tickers.length} positions)</span>
          </div>
          {tickers.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="Search tickers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-blue-50 border border-blue-100 rounded-lg pl-10 pr-4 py-2 text-indigo-900 text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent font-medium"
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {tickers.length > 0 ? (
          <>
            <div className="space-y-3">
              {currentTickers.map((ticker, i) => {
                const data = byTicker[ticker];
                const avgPrice = data.totalCost / data.totalQty;
                return (
                  <div key={startIndex + i} className="bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleExpand(ticker)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${getTickerColor(ticker)} rounded-lg flex items-center justify-center shadow-sm`}>
                          <span className="text-indigo-900 font-extrabold text-xl tracking-tight">{ticker.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-indigo-900 font-bold text-lg tracking-tight">{ticker}</span>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="text-blue-700 text-base font-medium">
                            {data.totalQty.toLocaleString()} shares @ ${avgPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-indigo-900 font-extrabold mb-1 text-lg">${(data.totalQty * avgPrice).toLocaleString()}</div>
                        <button
                          className="ml-2 p-1 rounded hover:bg-blue-100"
                          onClick={e => { e.stopPropagation(); toggleExpand(ticker); }}
                          aria-label={expanded[ticker] ? 'Collapse lots' : 'Expand lots'}
                        >
                          {expanded[ticker] ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                        </button>
                      </div>
                    </div>
                    {expanded[ticker] && (
                      <div className="bg-blue-100 rounded-b-lg px-2 py-2 mt-1">
                        <div className="text-blue-700 font-semibold mb-2 flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-blue-400" /> Lots
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {data.lots.map((lot: Lot, idx: number) => (
                            <div key={idx} className="flex flex-col gap-1 bg-white border-l-4 border-blue-400 rounded-lg shadow-sm p-2">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-blue-900 text-lg tracking-tight">{lot.quantity.toLocaleString()} <span className='font-semibold text-blue-700 text-base'>shares</span></span>
                                <span className="text-blue-600 text-base font-mono flex items-center gap-1 font-semibold"><DollarSign className="w-4 h-4" />${lot.pricePaid.toFixed(2)}</span>
                              </div>
                              {lot.date && (
                                <div className="flex items-center gap-1 text-blue-400 text-xs font-light italic">
                                  <CalendarIcon className="w-4 h-4" />
                                  {formatDate(lot.date)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-blue-100">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-900 rounded-lg transition-colors"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 text-sm rounded-lg transition-colors ${page === currentPage
                        ? 'bg-blue-400 text-white'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-900'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-900 rounded-lg transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-indigo-900 font-extrabold mb-2 text-xl">No Holdings Found</h3>
            <p className="text-blue-600 text-base font-medium">This portfolio doesn&apos;t have any stock positions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function aggregateLots(lots: Lot[]) {
  const byTicker: Record<string, { totalQty: number; totalCost: number; lots: Lot[] }> = {};
  for (const lot of lots) {
    if (!byTicker[lot.ticker]) byTicker[lot.ticker] = { totalQty: 0, totalCost: 0, lots: [] };
    byTicker[lot.ticker].totalQty += lot.quantity;
    byTicker[lot.ticker].totalCost += lot.quantity * lot.pricePaid;
    byTicker[lot.ticker].lots.push(lot);
  }
  return byTicker;
}

function PortfolioSummary({ lots, cash }: { lots: Lot[]; cash: number }) {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      setError('');
      const tickers = Array.from(new Set(lots.map(l => l.ticker)));
      if (tickers.length === 0) {
        setPrices({});
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/stock-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tickers }),
        });
        const data = await res.json();
        setPrices(data.prices || {});
        if (data.error || Object.values(data.prices || {}).every((v: any) => v === null)) {
          setError('Stock prices unavailable or rate limit reached.');
        }
      } catch (err) {
        setError('Failed to fetch stock prices');
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, [lots]);

  const byTicker = aggregateLots(lots);
  let totalValue = cash;
  let totalCost = 0;
  let totalPL = 0;

  if (lots.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold text-blue-900">Portfolio Summary</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-blue-900 font-semibold mb-2">Ready to Invest</h3>
          <p className="text-blue-400 mb-4">No investments to analyze yet</p>
          <div className="bg-green-100 rounded-lg p-4 inline-block">
            <span className="text-green-400 font-semibold">Available Cash: ${cash.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  const getTickerColor = (ticker: string) => {
    const colors = [
      'bg-blue-200',
      'bg-blue-100',
      'bg-blue-300',
      'bg-blue-50',
      'bg-blue-400',
      'bg-blue-100',
      'bg-blue-200',
      'bg-blue-50',
    ];
    return colors[ticker.length % colors.length];
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-blue-900">Portfolio Summary</h2>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-blue-300" />
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

        <div className="overflow-x-auto">
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-100">
                  <th className="text-left py-4 text-blue-400 font-medium text-sm">Stock</th>
                  <th className="text-right py-4 text-blue-400 font-medium text-sm">Quantity</th>
                  <th className="text-right py-4 text-blue-400 font-medium text-sm">Avg Price</th>
                  <th className="text-right py-4 text-blue-400 font-medium text-sm">Current Price</th>
                  <th className="text-right py-4 text-blue-400 font-medium text-sm">Market Value</th>
                  <th className="text-right py-4 text-blue-400 font-medium text-sm">P/L</th>
                  <th className="text-right py-4 text-blue-400 font-medium text-sm">P/L %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byTicker).map(([ticker, data]) => {
                  const avgPrice = data.totalCost / data.totalQty;
                  const curPrice = prices[ticker] || 0;
                  const value = data.totalQty * curPrice;
                  const cost = data.totalCost;
                  const pl = value - cost;
                  const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                  totalValue += value;
                  totalCost += cost;
                  totalPL += pl;
                  return (
                    <tr key={ticker} className="border-b border-blue-50 hover:bg-blue-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getTickerColor(ticker)} rounded-lg flex items-center justify-center`}>
                            <span className="text-blue-900 font-bold text-sm">{ticker.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="text-blue-900 font-semibold">{ticker}</span>
                            <div className="text-blue-400 text-xs">{data.lots.length} lot{data.lots.length > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 text-blue-900">{data.totalQty.toLocaleString()}</td>
                      <td className="text-right py-4 text-blue-900">${avgPrice.toFixed(2)}</td>
                      <td className="text-right py-4">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block"></div>
                        ) : curPrice === null ? (
                          <span className="text-blue-300">N/A</span>
                        ) : (
                          <span className="text-blue-900">${curPrice.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="text-right py-4 text-blue-900">${value.toLocaleString()}</td>
                      <td className={`text-right py-4 font-semibold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {pl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{pl >= 0 ? '+' : ''}${pl.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className={`text-right py-4 font-semibold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile version: stacked cards */}
          <div className="md:hidden flex flex-col gap-4">
            {Object.entries(byTicker).map(([ticker, data]) => {
              const avgPrice = data.totalCost / data.totalQty;
              const curPrice = prices[ticker] || 0;
              const value = data.totalQty * curPrice;
              const cost = data.totalCost;
              const pl = value - cost;
              const plPct = cost > 0 ? (pl / cost) * 100 : 0;
              totalValue += value;
              totalCost += cost;
              totalPL += pl;
              return (
                <div key={ticker} className="rounded-lg bg-blue-50 p-4 flex flex-col gap-2 border border-blue-100">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-10 h-10 ${getTickerColor(ticker)} rounded-lg flex items-center justify-center`}>
                      <span className="text-blue-900 font-bold text-sm">{ticker.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="text-blue-900 font-semibold text-lg">{ticker}</span>
                      <div className="text-blue-400 text-xs">{data.lots.length} lot{data.lots.length > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex-1 min-w-[120px]">
                      <span className="block text-blue-400">Quantity</span>
                      <span className="block text-blue-900 font-semibold">{data.totalQty.toLocaleString()}</span>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <span className="block text-blue-400">Avg Price</span>
                      <span className="block text-blue-900 font-semibold">${avgPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <span className="block text-blue-400">Current Price</span>
                      <span className="block text-blue-900 font-semibold">
                        {loading ? (
                          <span className="inline-block align-middle"><div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block"></div></span>
                        ) : curPrice === null ? (
                          <span className="text-blue-300">N/A</span>
                        ) : (
                          `$${curPrice.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <span className="block text-blue-400">Market Value</span>
                      <span className="block text-blue-900 font-semibold">${value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm mt-2">
                    <div className="flex-1 min-w-[120px]">
                      <span className="block text-blue-400">P/L</span>
                      <span className={`block font-semibold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pl >= 0 ? '+' : ''}${pl.toFixed(2)}</span>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <span className="block text-blue-400">P/L %</span>
                      <span className={`block font-semibold ${plPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-blue-100">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 text-sm">Total Value</span>
              </div>
              <div className="text-blue-900 font-bold text-xl">${totalValue.toLocaleString()}</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-purple-400" />
                <span className="text-blue-400 text-sm">Total Cost</span>
              </div>
              <div className="text-blue-900 font-bold text-xl">${totalCost.toLocaleString()}</div>
            </div>
            <div className={`${totalPL >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                {totalPL >= 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                <span className="text-blue-400 text-sm">Total P/L</span>
              </div>
              <div className={`font-bold text-xl ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
              </div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-yellow-400" />
                <span className="text-blue-400 text-sm">Cash</span>
              </div>
              <div className="text-blue-900 font-bold text-xl">${cash.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsSection({ portfolio }: { portfolio: Portfolio }) {
  const [insights, setInsights] = useState<{
    summary: string;
    sectorAnalysis: string;
    diversification: string;
    risk: string;
    recommendations: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateInsights();
  }, [portfolio]);

  const SECTOR_MAP: Record<string, string> = {
    AAPL: 'Technology', MSFT: 'Technology', GOOGL: 'Technology', AMZN: 'Consumer Discretionary', TSLA: 'Consumer Discretionary',
    JPM: 'Financials', V: 'Financials', JNJ: 'Healthcare', UNH: 'Healthcare', XOM: 'Energy', CVX: 'Energy',
    META: 'Communication Services', NVDA: 'Technology', WMT: 'Consumer Staples', PG: 'Consumer Staples',
  };

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
        const sector = SECTOR_MAP[lot.ticker.toUpperCase()] || 'Other';
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
      const gainers = holdingEntries.slice(0, 2).map(([ticker, value]) => ticker);
      const losers = holdingEntries.slice(-2).map(([ticker, value]) => ticker);

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