import React from 'react';
import type { Portfolio } from '../pages/dashboard';
import { DollarSign, Wallet, BarChart3 } from 'lucide-react';

interface PortfolioCardProps {
  portfolio: Portfolio;
  prices: Record<string, number | null>;
  onView: (id: string) => void;
}

export default function PortfolioCard({ portfolio: p, prices, onView }: PortfolioCardProps) {
  // Calculate total cost and profit value using live prices
  const totalCost = p.lots.reduce((sum, lot) => sum + lot.pricePaid * lot.quantity, 0);
  const totalHolding = p.lots.reduce((sum, lot) => sum + lot.quantity, 0);
  const totalValue = p.lots.reduce((sum, lot) => {
    const cur = prices[lot.ticker];
    return sum + lot.quantity * (typeof cur === 'number' && cur > 0 ? cur : lot.pricePaid);
  }, 0);
  const profitValue = totalValue - totalCost;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-0 flex flex-col h-full min-h-[420px] transition-all duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-6 px-8 pt-8 pb-3">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow">
          <span className="text-white font-extrabold text-3xl tracking-wide">{p.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 truncate mb-2">{p.name}</h2>
          <span className="inline-block bg-blue-50 text-blue-500 text-sm font-semibold rounded-full px-4 py-1">{p.visibility.replace('_', ' ')}</span>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 px-8 py-6">
        <div className="bg-blue-100 rounded-lg p-4 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-xs font-semibold">Cash</span>
          </div>
          <span className="text-blue-900 font-bold text-lg">${p.cash.toLocaleString()}</span>
        </div>
        <div className="bg-purple-100 rounded-lg p-4 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-blue-400 text-xs font-semibold">Total Cost</span>
          </div>
          <span className="text-blue-900 font-bold text-lg">${totalCost.toLocaleString()}</span>
        </div>
        <div className={`rounded-lg p-4 flex flex-col items-start ${profitValue >= 0 ? 'bg-green-100' : 'bg-red-100'}`}> 
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="text-blue-400 text-xs font-semibold">Profit</span>
          </div>
          <span className={`text-lg font-bold ${profitValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profitValue >= 0 ? '+' : ''}${profitValue.toLocaleString()}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-start">
          <span className="text-blue-400 text-xs font-semibold mb-1">Holdings</span>
          <span className="text-blue-900 font-bold text-lg">{totalHolding}</span>
        </div>
      </div>
      {/* View Button */}
      <div className="px-8 pb-8 mt-auto">
        <button
          onClick={() => onView(p.id)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg mt-4"
        >
          View Portfolio
        </button>
      </div>
    </div>
  );
} 