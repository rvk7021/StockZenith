import React, { useEffect, useState } from 'react';
import HoldingsSection from '../components/HoldingsSection';
import InsightsSection from '../components/PortfolioDashboardAIInsights';
import PublicUsersList, { PublicUser } from '../components/PublicUsersList';
import PortfolioCard from '../components/PortfolioCard';

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

interface PublicPortfolioDetailType {
  id: string;
  name: string;
  cash: number;
  lots: Lot[];
  createdAt: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED';
}

const UserPublicPortfolios: React.FC<{
  user: PublicUser;
  onBack: () => void;
  onSelectPortfolio: (portfolioId: string) => void;
}> = ({ user, onBack, onSelectPortfolio }) => {
  const [portfolios, setPortfolios] = useState<PublicPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState<Record<string, number | null>>({});

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/public-portfolios?userId=${user.id}`)
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
  }, [user.id]);

  if (loading) return <div className="p-8 text-center">Loading portfolios...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (portfolios.length === 0) return <div className="p-8 text-center text-gray-500">No public portfolios found for this user.</div>;

  return (
    <div>
      <button className="mb-4 text-blue-500 hover:underline" onClick={onBack}>
        ← Back to users
      </button>
      <h2 className="text-xl font-bold mb-6 text-center">{user.name || 'Unnamed User'}&apos;s Public Portfolios</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {portfolios.map((portfolio: PublicPortfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            prices={prices}
            onView={() => onSelectPortfolio(portfolio.id)}
          />
        ))}
      </div>
    </div>
  );
};

const PublicPortfolioDetail: React.FC<{ portfolioId: string; onBack: () => void }> = ({ portfolioId, onBack }) => {
  const [portfolio, setPortfolio] = useState<PublicPortfolioDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/public-portfolio/${portfolioId}`)
      .then(res => res.json())
      .then(data => setPortfolio(data))
      .catch(() => setError('Failed to load portfolio details'))
      .finally(() => setLoading(false));
  }, [portfolioId]);

  if (loading) return <div className="p-8 text-center">Loading portfolio details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!portfolio) return <div className="p-8 text-center text-gray-500">Portfolio not found.</div>;

  return (
    <div>
      <button className="mb-4 text-blue-500 hover:underline" onClick={onBack}>
        ← Back to portfolios
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center">{portfolio.name}</h2>
      <div className="mb-8">
        <HoldingsSection lots={portfolio.lots} />
      </div>
      <div>
        <InsightsSection portfolios={[portfolio]} />
      </div>
    </div>
  );
};

const PublicPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {!selectedUser ? (
        <PublicUsersList onSelect={setSelectedUser} />
      ) : !selectedPortfolioId ? (
        <div className="max-w-xl mx-auto mt-10">
          <UserPublicPortfolios
            user={selectedUser}
            onBack={() => setSelectedUser(null)}
            onSelectPortfolio={setSelectedPortfolioId}
          />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto mt-10">
          <PublicPortfolioDetail
            portfolioId={selectedPortfolioId}
            onBack={() => setSelectedPortfolioId(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PublicPage; 