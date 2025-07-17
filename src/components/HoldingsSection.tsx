import React, { useState, useEffect } from 'react';
import { PieChart, Search, ChevronDown, ChevronUp, DollarSign, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

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

export default function HoldingsSection({ lots }: { lots: Lot[] }) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [prices, setPrices] = useState<Record<string, number | null>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const itemsPerPage = 10;

    useEffect(() => {
        async function fetchPrices() {
            setLoading(true);
            setError('');
            const tickers = Array.from(new Set(lots.map((l: Lot) => l.ticker)));
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
                    setError('Stock price unavailable or rate limit reached.');
                }
            } catch {
                setError('Failed to fetch stock prices');
            } finally {
                setLoading(false);
            }
        }
        fetchPrices();
    }, [lots]);

    const byTicker = aggregateLots(lots);
    const tickers = Object.keys(byTicker).filter((ticker: string) =>
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
            'bg-blue-200', 'bg-blue-100', 'bg-blue-300', 'bg-blue-50',
            'bg-blue-400', 'bg-blue-100', 'bg-blue-200', 'bg-blue-50',
        ];
        return colors[ticker.length % colors.length];
    };

    const toggleExpand = (ticker: string) => {
        setExpanded(prev => ({ ...prev, [ticker]: !prev[ticker] }));
    };

    function getDaysHeld(lots: Lot[]): number {
        if (!lots.length) return 0;
        const earliest = Math.min(...lots.map(lot => lot.date ? new Date(lot.date).getTime() : Date.now()));
        const now = Date.now();
        return Math.floor((now - earliest) / (1000 * 60 * 60 * 24));
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-extrabold text-indigo-900 tracking-tight">Holdings</h2>
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
                                className="bg-blue-50 border border-blue-100 rounded-lg pl-10 pr-4 py-1 text-indigo-900 text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent font-medium"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="p-2">
                {tickers.length > 0 ? (
                    <>
                        <div className="space-y-2">
                            {currentTickers.map((ticker, i) => {
                                const data = byTicker[ticker];
                                const avgPrice = data.totalCost / data.totalQty;
                                const curPrice = prices[ticker] || 0;
                                const value = data.totalQty * curPrice;
                                const cost = data.totalCost;
                                const pl = value - cost;
                                const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                                const daysHeld = getDaysHeld(data.lots);
                                return (
                                    <div key={startIndex + i} className="bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                        <div className="flex items-center justify-between p-2 cursor-pointer min-h-[48px]" onClick={() => toggleExpand(ticker)}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${getTickerColor(ticker)} rounded-lg flex items-center justify-center shadow-sm`}>
                                                    <span className="text-indigo-900 font-extrabold text-base tracking-tight">{ticker.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-indigo-900 font-bold text-base tracking-tight">{ticker}</span>
                                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                                    </div>
                                                    <div className="text-blue-700 text-sm font-medium">
                                                        {data.totalQty.toLocaleString()} shares @ ${avgPrice.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-indigo-900 font-extrabold mb-1 text-base">${value.toLocaleString()}</div>
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
                                                    {data.lots.map((lot, idx) => (
                                                        <div key={idx} className="flex flex-col gap-1 bg-white border-l-4 border-blue-400 rounded-lg shadow-sm p-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-extrabold text-blue-900 text-base tracking-tight">{lot.quantity.toLocaleString()} <span className='font-semibold text-blue-700 text-xs'>shares</span></span>
                                                                <span className="text-blue-600 text-xs font-mono flex items-center gap-1 font-semibold"><DollarSign className="w-4 h-4" />${lot.pricePaid.toFixed(2)}</span>
                                                            </div>
                                                            {lot.date && (
                                                                <div className="flex items-center gap-1 text-blue-400 text-xs font-light italic">
                                                                    <CalendarIcon className="w-4 h-4" />
                                                                    {formatDate(lot.date)}
                                                                </div>
                                                            )}
                                                            <div className="flex flex-wrap gap-2 text-xs mt-1">
                                                                <div className="flex-1 min-w-[80px]">
                                                                    <span className="block text-blue-400">Days Held</span>
                                                                    <span className="block text-blue-900 font-semibold">{daysHeld} days</span>
                                                                </div>
                                                            </div>
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
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-100">
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
                                            className={`w-8 h-8 text-xs rounded-lg transition-colors ${page === currentPage
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
                    <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        No holdings yet
                    </div>
                )}
            </div>
        </div>
    );
} 