import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, TrendingUp, TrendingDown, BarChart3, Wallet, DollarSign, PieChart } from 'lucide-react';

interface Lot {
  id?: string;
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
}

function aggregateLots(lots: Lot[]): Record<string, { totalQty: number; totalCost: number; lots: Lot[] }> {
  const byTicker: Record<string, { totalQty: number; totalCost: number; lots: Lot[] }> = {};
  for (const lot of lots) {
    if (!byTicker[lot.ticker]) byTicker[lot.ticker] = { totalQty: 0, totalCost: 0, lots: [] };
    byTicker[lot.ticker].totalQty += lot.quantity;
    byTicker[lot.ticker].totalCost += lot.quantity * lot.pricePaid;
    byTicker[lot.ticker].lots.push(lot);
  }
  return byTicker;
}

export default function PortfolioSummarySection({ lots, cash }: { lots: Lot[]; cash: number }) {
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'7d' | '1m' | '1y' | '5y' | 'all'>('all');

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
        if (data.error || Object.values(data.prices || {}).every((v: unknown) => v === null)) {
          setError('Stock prices unavailable or rate limit reached.');
        }
      } catch (err) {
        setError('Failed to fetch stock prices');
        console.log(err)
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
      'bg-blue-200', 'bg-blue-100', 'bg-blue-300', 'bg-blue-50',
      'bg-blue-400', 'bg-blue-100', 'bg-blue-200', 'bg-blue-50',
    ];
    return colors[ticker.length % colors.length];
  };


  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold text-blue-900 my-2">Portfolio Summary</h2>
        </div>
        <div className="w-full overflow-x-auto pb-2 mb-4">
          <div className="flex flex-nowrap gap-1 items-center min-w-[240px]">
            <span className="text-blue-400 font-medium text-sm shrink-0">Period:</span>
            {(['7d', '1m', '1y', '5y', 'all'] as Array<'7d' | '1m' | '1y' | '5y' | 'all'>).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-0.5 rounded font-medium text-xs shrink-0 ${period === p ? 'bg-blue-400 text-white' : 'bg-blue-50 text-blue-900'}`}
              >
                {p === '7d' ? '7D' : p === '1m' ? '1M' : p === '1y' ? '1Y' : p === '5y' ? '5Y' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {error && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">{error}</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          {/* Desktop table */}
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
                      <td className={`text-right py-4 font-semibold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}> <div className="flex items-center justify-end gap-1"> {pl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} <span>{pl >= 0 ? '+' : ''}${pl.toFixed(2)}</span> </div> </td>
                      <td className={`text-right py-4 font-semibold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}> {plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile version: stacked cards */}
          <div className="md:hidden flex flex-col">
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
                <div key={ticker} className="rounded-lg bg-blue-50 p-3 flex flex-col gap-2 border border-blue-100">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 ${getTickerColor(ticker)} rounded-lg flex items-center justify-center`}>
                      <span className="text-blue-900 font-bold text-sm">{ticker.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="text-blue-900 font-semibold text-base">{ticker}</span>
                      <div className="text-blue-400 text-xs">{data.lots.length} lot{data.lots.length > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex-1 min-w-[90px]">
                      <span className="block text-blue-400">Quantity</span>
                      <span className="block text-blue-900 font-semibold">{data.totalQty.toLocaleString()}</span>
                    </div>
                    <div className="flex-1 min-w-[90px]">
                      <span className="block text-blue-400">Avg Price</span>
                      <span className="block text-blue-900 font-semibold">${avgPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex-1 min-w-[90px]">
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
                    <div className="flex-1 min-w-[90px]">
                      <span className="block text-blue-400">Market Value</span>
                      <span className="block text-blue-900 font-semibold">${value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mt-2">
                    <div className="flex-1 min-w-[90px]">
                      <span className="block text-blue-400">P/L</span>
                      <span className={`block font-semibold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pl >= 0 ? '+' : ''}${pl.toFixed(2)}</span>
                    </div>
                    <div className="flex-1 min-w-[90px]">
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
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="text-blue-400 text-sm">Total P/L</span>
              </div>
              <div className={`text-xl font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString()}</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 text-sm">Unique Holdings</span>
              </div>
              <div className="text-blue-900 font-bold text-xl">{Object.keys(byTicker).length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 