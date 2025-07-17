import { useState } from 'react';
import { TICKERS } from '@/lib/tickers';
import type { Portfolio, Lot } from '../pages/dashboard';

export default function PortfolioForm({ initial, onClose }: { initial: Portfolio | null, onClose: () => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [visibility, setVisibility] = useState<Portfolio['visibility']>(initial?.visibility || 'PRIVATE');
  const [lots, setLots] = useState<Lot[]>(initial?.lots || []);
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [pricePaid, setPricePaid] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [cash, setCash] = useState<number>(initial?.cash || 0);
  const [saving, setSaving] = useState(false);
  const [tickerSearch, setTickerSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [holdingsSearch, setHoldingsSearch] = useState('');
  const filteredTickers = TICKERS.filter(t =>
    tickerSearch &&
    (t.symbol.toLowerCase().includes(tickerSearch.toLowerCase()) ||
      t.name.toLowerCase().includes(tickerSearch.toLowerCase()))
  ).slice(0, 8);

  function addLot() {
    const t = tickerSearch.trim().toUpperCase();
    const qty = parseFloat(quantity);
    const price = parseFloat(pricePaid);
    if (!t || !qty || qty <= 0 || !price || price <= 0) return;
    setLots([...lots, { ticker: t, quantity: qty, pricePaid: price, date }]);
    setTicker('');
    setTickerSearch('');
    setQuantity('');
    setPricePaid('');
    setDate('');
  }

  function removeLot(idx: number) {
    setLots(lots.filter((_, i) => i !== idx));
  }

  function formatDate(dateStr: string | undefined) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const method = initial ? 'PUT' : 'POST';
    const body = initial ? { id: initial.id, name, cash, visibility, lots } : { name, cash, visibility, lots };
    await fetch('/api/portfolio', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100/80 via-white/80 to-purple-100/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-0 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2 sm:px-0 sm:pt-0 sm:pb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
              {initial ? 'Edit Portfolio' : 'Create New Portfolio'}
            </h2>
            <button
              onClick={onClose}
              className="text-blue-300 hover:text-blue-500 transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8 mt-2">
            {/* Main Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-blue-50/60 rounded-2xl p-4 sm:p-6 shadow-inner">
              <div>
                <label className="block text-blue-700 text-sm font-semibold mb-2">Portfolio Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full min-w-0 bg-white text-blue-900 px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm break-words"
                  placeholder="My Investment Portfolio"
                  required
                />
              </div>
              <div>
                <label className="block text-blue-700 text-sm font-semibold mb-2">Cash Reserve</label>
                <input
                  type="number"
                  value={cash}
                  onChange={e => setCash(Number(e.target.value))}
                  className="w-full min-w-0 bg-white text-blue-900 px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                  placeholder="10000"
                  min={0}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-blue-700 text-sm font-semibold mb-2">Visibility</label>
                <select
                  value={visibility}
                  onChange={e => setVisibility(e.target.value as Portfolio['visibility'])}
                  className="w-full min-w-0 bg-white text-blue-900 px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="PUBLIC">Public</option>
                  <option value="SMART_SHARED">Smart Shared</option>
                </select>
              </div>
            </div>

            {/* Holdings Section */}
            <div>
              <label className="block text-blue-700 text-base font-bold mb-3">Holdings</label>
              <input
                type="text"
                value={holdingsSearch}
                onChange={e => setHoldingsSearch(e.target.value)}
                placeholder="Search holdings by ticker..."
                className="mb-3 w-full bg-white text-blue-900 px-3 py-2 rounded border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
              />
              {lots.filter(lot =>
                !holdingsSearch.trim() || lot.ticker.toLowerCase().includes(holdingsSearch.trim().toLowerCase())
              ).length > 0 && (
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {lots.filter(lot =>
                      !holdingsSearch.trim() || lot.ticker.toLowerCase().includes(holdingsSearch.trim().toLowerCase())
                    ).map((lot, i) => (
                      <div key={i} className="flex items-center justify-between bg-gradient-to-r from-blue-100 via-purple-100 to-blue-50 p-4 rounded-xl shadow border border-blue-100 min-w-0 overflow-x-auto">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow shrink-0">
                            <span className="text-white font-extrabold text-lg tracking-wide">{lot.ticker.slice(0, 2)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-blue-900 font-bold text-lg break-words">{lot.ticker}</div>
                            <div className="text-blue-400 text-sm break-words flex flex-wrap items-center gap-1">
                              {lot.quantity} shares @ ${lot.pricePaid}
                              {lot.date && <span className="whitespace-nowrap">• {formatDate(lot.date)}</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLot(i)}
                          className="text-red-400 hover:text-red-600 transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-300 shrink-0"
                          aria-label="Remove holding"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              {/* Add Holding Form */}
              <div className="bg-blue-50/60 p-4 rounded-2xl shadow-inner">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto">
                  <div className="md:col-span-2 relative min-w-0">
                    <label className="block text-blue-700 text-xs font-semibold mb-1">Ticker</label>
                    <input
                      type="text"
                      value={tickerSearch}
                      onChange={e => {
                        setTickerSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      className="w-full max-w-full min-w-0 bg-white text-blue-900 px-3 py-2 rounded border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                      placeholder="Search ticker (e.g. AAPL)"
                      autoComplete="off"
                    />
                    {showSuggestions && filteredTickers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {filteredTickers.map(t => (
                          <button
                            key={t.symbol}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors"
                            onMouseDown={() => {
                              setTickerSearch(t.symbol);
                              setTicker(t.symbol);
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="text-blue-900 font-bold">{t.symbol}</div>
                            <div className="text-blue-400 text-xs truncate">{t.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className="block text-blue-700 text-xs font-semibold mb-1">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className="bg-white text-blue-900 px-3 py-2 rounded border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm w-full max-w-full min-w-0"
                      placeholder="Quantity"
                      min={0}
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-blue-700 text-xs font-semibold mb-1">Price Paid</label>
                    <input
                      type="number"
                      value={pricePaid}
                      onChange={e => setPricePaid(e.target.value)}
                      className="bg-white text-blue-900 px-3 py-2 rounded border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm w-full max-w-full min-w-0"
                      placeholder="Price"
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-blue-700 text-xs font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="bg-white text-blue-900 px-3 py-2 rounded border border-blue-200 focus:border-blue-500 focus:outline-none transition-colors shadow-sm w-full max-w-full min-w-0"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addLot}
                  disabled={!tickerSearch.trim() || !quantity || parseFloat(quantity) <= 0 || !pricePaid || parseFloat(pricePaid) <= 0}
                  className="mt-2 w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white font-bold py-2 px-4 rounded-xl shadow hover:from-blue-500 hover:to-purple-500 transition-colors disabled:opacity-50"
                >
                  Add Holding
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-blue-400 font-semibold rounded-xl hover:bg-blue-50 transition-colors border border-blue-100 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow"
              >
                {saving ? 'Saving...' : (initial ? 'Update Portfolio' : 'Create Portfolio')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 