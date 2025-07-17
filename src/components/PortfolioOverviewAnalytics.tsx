import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Layers } from 'lucide-react';

interface Lot {
  ticker: string;
  quantity: number;
  pricePaid: number;
}

interface Portfolio {
  id: string;
  name: string;
  cash: number;
  lots: Lot[];
}

interface PortfolioOverviewAnalyticsProps {
  portfolios: Portfolio[];
  prices: Record<string, number | null>;
}

function calcPortfolioStats(portfolio: Portfolio, prices: Record<string, number | null>) {
  const totalCost = portfolio.lots.reduce((sum, lot) => sum + lot.pricePaid * lot.quantity, 0);
  const totalValue = portfolio.lots.reduce((sum, lot) => {
    const cur = prices[lot.ticker];
    return sum + lot.quantity * (typeof cur === 'number' && cur > 0 ? cur : lot.pricePaid);
  }, 0) + portfolio.cash;
  const profitValue = totalValue - totalCost;
  const profitPct = totalCost > 0 ? (profitValue / totalCost) * 100 : 0;
  return { totalCost, totalValue, profitValue, profitPct };
}

const cardBase =
  'flex flex-col items-start justify-center rounded-lg shadow-sm p-6 bg-white border border-neutral-200 transition-all duration-200 min-h-[120px] font-sans hover:shadow-md hover:bg-blue-50';

const labelClass = 'text-gray-400 text-xs font-normal mb-1 tracking-wide uppercase font-sans';
const valueClass = 'text-2xl font-medium text-blue-700 font-sans mb-1 break-words';
const subValueClass = 'text-base font-normal text-gray-500 font-sans break-words tracking-wide';
const percentClass = 'text-lg font-medium text-neutral-500 font-sans break-words tracking-wide';

function PercentageField({ value, color }: { value: number, color?: string }) {
  const pctString = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const colorClass = color ? color : 'text-neutral-500';
  if (pctString.length > 8) {
    return <div className={percentClass + ' mt-1 ' + colorClass}>{pctString}</div>;
  }
  return <span className={percentClass + ' ml-2 ' + colorClass}>{pctString}</span>;
}

const PortfolioOverviewAnalytics: React.FC<PortfolioOverviewAnalyticsProps> = ({ portfolios, prices }) => {
  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 font-sans">
        No portfolios to analyze.
      </div>
    );
  }

  // Calculate stats for each portfolio
  const stats = portfolios.map(p => ({
    ...p,
    ...calcPortfolioStats(p, prices),
  }));

  // Find best and worst by profitPct
  const best = stats.reduce((a, b) => (b.profitPct > a.profitPct ? b : a), stats[0]);
  const worst = stats.reduce((a, b) => (b.profitPct < a.profitPct ? b : a), stats[0]);

  // Calculate total value and overall profit/loss
  const totalValue = stats.reduce((sum, p) => sum + p.totalValue, 0);
  const totalCost = stats.reduce((sum, p) => sum + p.totalCost, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
  const averagePortfolioValue = totalValue / portfolios.length;

  // Unique tickers across all portfolios
  const allLots = portfolios.flatMap(p => p.lots);
  const uniqueTickers = Array.from(new Set(allLots.map(lot => lot.ticker)));
  const totalStocks = uniqueTickers.length;

  return (
    <section className="w-full max-w-6xl mx-auto my-10 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Portfolio Value */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className={labelClass}>Total Portfolio Value</span>
          </div>
          <span className={valueClass}>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        {/* Net Profit / Loss */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 mb-2">
            {totalPL >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className={labelClass}>Net Profit / Loss</span>
          </div>
          <div className="flex flex-wrap items-baseline w-full">
            <span className={valueClass + (totalPL >= 0 ? ' text-green-600' : ' text-red-500')}>{totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <PercentageField value={totalPLPct} color={totalPL >= 0 ? 'text-green-600' : 'text-red-500'} />
          </div>
        </div>
        {/* Average Portfolio Size */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            <span className={labelClass}>Average Portfolio Size</span>
          </div>
          <span className={valueClass}>${averagePortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        {/* Unique Stocks Held */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span className={labelClass}>Unique Stocks Held</span>
          </div>
          <span className={valueClass}>{totalStocks}</span>
        </div>
      </div>
      {/* Divider */}
      <div className="my-8 border-t border-neutral-200" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performing Portfolio */}
        <div className={cardBase + ' bg-green-50 border-green-100'}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className={labelClass}>Top Performing Portfolio</span>
          </div>
          <span className={subValueClass + ' text-green-700'}>{best.name}</span>
          <div className="flex flex-wrap items-baseline w-full">
            <span className="text-2xl font-medium text-green-600 font-sans break-words">{best.profitPct >= 0 ? '+' : ''}{best.profitPct.toFixed(2)}%</span>
          </div>
        </div>
        {/* Lowest Performing Portfolio */}
        <div className={cardBase + ' bg-red-50 border-red-100'}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span className={labelClass}>Lowest Performing Portfolio</span>
          </div>
          <span className={subValueClass + ' text-red-700'}>{worst.name}</span>
          <div className="flex flex-wrap items-baseline w-full">
            <span className="text-2xl font-medium text-red-500 font-sans break-words">{worst.profitPct >= 0 ? '+' : ''}{worst.profitPct.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioOverviewAnalytics; 