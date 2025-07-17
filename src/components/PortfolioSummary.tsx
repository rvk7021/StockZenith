import { useState, useEffect } from 'react';
import type { Lot } from '../pages/dashboard';

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

export default function PortfolioSummary({ lots, cash }: { lots: Lot[]; cash: number }) {
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
      const res = await fetch('/api/stock-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });
      const data = await res.json();
      setPrices(data.prices || {});
      if (data.error || Object.values(data.prices || {}).every((v: unknown) => v === null)) {
        setError('Stock price unavailable or rate limit reached.');
      }
      setLoading(false);
    }
    fetchPrices();
  }, [lots]);

  const byTicker = aggregateLots(lots);
  let totalValue = cash;
  let totalCost = 0;
  let totalPL = 0;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Portfolio Breakdown
      </h3>

      {Object.keys(byTicker).length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left text-gray-300 font-medium py-2">Ticker</th>
                <th className="text-right text-gray-300 font-medium py-2">Qty</th>
                <th className="text-right text-gray-300 font-medium py-2">Avg Price</th>
                <th className="text-right text-gray-300 font-medium py-2">Current</th>
                <th className="text-right text-gray-300 font-medium py-2">Value</th>
                <th className="text-right text-gray-300 font-medium py-2">P/L</th>
                <th className="text-right text-gray-300 font-medium py-2">P/L %</th>
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
                  <tr key={ticker} className="border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                    <td className="py-2 font-medium text-white">{ticker}</td>
                    <td className="py-2 text-right text-gray-300">{data.totalQty}</td>
                    <td className="py-2 text-right text-gray-300">${avgPrice.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-300">
                      {loading ? (
                        <div className="animate-pulse bg-gray-600 h-4 w-12 rounded ml-auto"></div>
                      ) : curPrice === null ? (
                        'N/A'
                      ) : (
                        `${curPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-2 text-right text-white font-medium">${value.toFixed(2)}</td>
                    <td className={`py-2 text-right font-medium ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pl >= 0 ? '+' : ''}${pl.toFixed(2)}
                    </td>
                    <td className={`py-2 text-right font-medium ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          No holdings yet
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/30 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Total P/L</div>
          <div className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
} 