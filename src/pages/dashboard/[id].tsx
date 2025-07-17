import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import PortfolioForm from '../../components/PortfolioForm';
import AnalyticsSection from '../../components/AnalyticsSection';
import ChatbotSection from '../../components/ChatbotSection';
import { MessageCircle, Brain } from 'lucide-react';
import PortfolioDetailHeader from '../../components/PortfolioDetailHeader';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import HoldingsSection from '../../components/HoldingsSection';
import PortfolioSummarySection from '../../components/PortfolioSummarySection';
import PortfolioAIInsightsSection from '../../components/PortfolioAIInsightsSection';

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
}

interface Analytics {
  portfolioName: string;
  link: string;
  viewCount: number;
  uniqueViewers: number;
  lastViewed?: string;
  token: string;
}


// Add a type for AI insights
interface AIInsights {
  summary?: string;
  sector_analysis?: string;
  diversification?: string;
  risk_assessment?: string;
  recommendations?: string;
}

// Helper to render up to 5 bullet points for AI insight sections
function renderInsightSection(section: string | string[] | Record<string, unknown>, noBullets?: boolean): React.ReactNode {
  if (!section) return 'No data available.';
  if (typeof section === 'string') {
    // Split into sentences or lines, show up to 5
    const points = section.split(/\n|\. /).map(s => s.trim()).filter(Boolean).slice(0, 5);
    if (noBullets) {
      return points.join('\n');
    }
    return (
      <ul className="list-disc pl-5 space-y-1">
        {points.map((point, idx) => <li key={idx}>{point}</li>)}
      </ul>
    );
  }
  if (Array.isArray(section)) {
    const items = section.slice(0, 5);
    if (noBullets) {
      return items.map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join('\n');
    }
    return (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, idx) => <li key={idx}>{renderInsightSection(item)}</li>)}
      </ul>
    );
  }
  if (typeof section === 'object') {
    // Try to extract up to 5 descriptive values (skip keys like 'title', 'type', etc.)
    const values = Object.entries(section)
      .filter(([key]) => !['title', 'type', 'status'].includes(key.toLowerCase()))
      .map(([key, value]) => {
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(', ');
        return JSON.stringify(value);
      })
      .filter(Boolean)
      .slice(0, 5);
    if (noBullets) {
      return values.join('\n');
    }
    return (
      <ul className="list-disc pl-5 space-y-1">
        {values.map((val, idx) => <li key={idx}>{val}</li>)}
      </ul>
    );
  }
  // Fallback: stringify anything else
  return String(section);
}

export default function DashboardPortfolioDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const shareInputRef = useRef<HTMLInputElement>(null);
  // Update aiInsights state
  const [aiInsights, setAiInsights] = useState<AIInsights | string>('');
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsightsError, setAiInsightsError] = useState('');
  const [chatInput, ] = useState('');
  const [, setChatLoading] = useState(false);
  const [, setChatError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  // Add state for hiding the share link after copy
  const [showShareLinkInline, setShowShareLinkInline] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Automatically hide share link after 2 seconds
  useEffect(() => {
    if (shareLink && showShareLinkInline) {
      const timer = setTimeout(() => {
        setShowShareLinkInline(false);
        setCopySuccess(false);
        setShareLink(null);
      }, 4000); // Changed from 2000 to 4000
      return () => clearTimeout(timer);
    }
  }, [shareLink, showShareLinkInline]);

  useEffect(() => {
    if (id && status === 'authenticated') {
      fetchPortfolio();
      fetchAnalytics();
    }
    // eslint-disable-next-line
  }, [id, status]);

  async function fetchPortfolio() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (Array.isArray(data)) {
        const found = data.find((p: Portfolio) => p.id === id);
        if (found) {
          setPortfolio(found);
          fetchAiInsights(found); // Pass the portfolio object
        } else setError('Portfolio Not Found');
      } else {
        setError('Portfolio Not Found');
      }
    } catch (e) {
      setError('Failed to load portfolio');
    }
    setLoading(false);
  }

  async function fetchAnalytics() {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data.analytics || []);
    } catch (e) {
      setAnalyticsError('Failed to load analytics');
    }
    setAnalyticsLoading(false);
  }

  async function fetchAiInsights(portfolioObj?: Portfolio) {
    setAiInsightsLoading(true);
    setAiInsightsError('');
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio: portfolioObj || portfolio }),
      });
      const data = await res.json();
      setAiInsights(data);
    } catch (e) {
      setAiInsightsError('Failed to load AI insights');
    }
    setAiInsightsLoading(false);
  }

  async function handleChatSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatError('');
    try {
      const res = await fetch('/api/insights-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId: id, messages: [{ role: 'user', content: chatInput }] }),
      });
      const data = await res.json();
      if (data.reply) {
        // setChatMessages([...chatMessages, { role: 'assistant', content: data.reply }]); // Removed as per edit hint
      } else {
        setChatError(data.error || 'No reply from AI');
      }
    } catch (e) {
      setChatError('Failed to send message');
    }
    setChatLoading(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this portfolio?')) return;
    await fetch('/api/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.replace('/dashboard');
  }

  async function handleShare() {
    setShareLoading(true);
    setShareError('');
    setShareLink(null);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId: id }),
      });
      const data = await res.json();
      if (data.link) setShareLink(data.link);
      else setShareError(data.error || 'Failed to generate link');
    } catch (e) {
      setShareError('Failed to generate link');
    }
    setShareLoading(false);
  }

  async function handleDeleteConfirmed() {
    setShowDeleteModal(false);
    await fetch('/api/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    router.replace('/dashboard');
  }

  function getVisibilityIcon(visibility: string) {
    switch (visibility) {
      case 'PRIVATE': return (<svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3v2a3 3 0 003 3h6a3 3 0 003-3v-2c0-1.657-1.343-3-3-3s-3 1.343-3 3z" /></svg>);
      case 'PUBLIC': return (<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
      case 'SMART_SHARED': return (<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>);
      default: return (<svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v10m-6-10v10m6 0H9" /></svg>);
    }
  }

  async function handleRevoke(token: string) {
    try {
      console.log('revoking', token);
      const res = await fetch('/api/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to revoke link');
        return;
      }
      await fetchAnalytics();
    } catch (err) {
      alert('Network error while revoking link');
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-blue-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-blue-900 mt-4 text-center font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;
  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-red-500/20 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h2>
            <p className="text-red-300">{error || 'This portfolio does not exist or you do not have access.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-0 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <PortfolioDetailHeader
              portfolio={portfolio}
              shareLink={shareLink}
              shareLoading={shareLoading}
              shareError={shareError}
              showShareLinkInline={showShareLinkInline}
              copySuccess={copySuccess}
              shareInputRef={shareInputRef as React.RefObject<HTMLInputElement>}
              onShare={async () => { await handleShare(); setShowShareLinkInline(true); }}
              onEdit={() => setShowForm(true)}
              onDelete={() => setShowDeleteModal(true)}
              onCopy={() => {
                if (shareInputRef.current) {
                  shareInputRef.current.select();
                  document.execCommand('copy');
                  setCopySuccess(true);
                }
              }}
              setShowShareLinkInline={setShowShareLinkInline}
              getVisibilityIcon={getVisibilityIcon}
            />
          </div>
          {/* If PortfolioDetailHeader doesn't render the buttons, you can move them here as a separate right-aligned div */}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirmed}
      />
      <div className="w-full px-0 py-12 flex flex-col gap-4">
        {/* Holdings Section */}
        <HoldingsSection lots={portfolio.lots} />
        {/* Portfolio Summary Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden mb-8 w-full">
          <div className="p-6">
            <PortfolioSummarySection lots={portfolio.lots} cash={portfolio.cash} />
          </div>
        </div>
        {showForm && (
          <PortfolioForm
            initial={portfolio}
            onClose={() => { setShowForm(false); fetchPortfolio(); }}
          />
        )}
        <div className="mt-8">
          <PortfolioAIInsightsSection
            aiInsights={aiInsights}
            aiInsightsLoading={aiInsightsLoading}
            aiInsightsError={aiInsightsError}
            renderInsightSection={renderInsightSection}
          />
        </div>
        <div className="w-full">
          <AnalyticsSection
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
            handleRevoke={handleRevoke}
          />
        </div>
      </div>
      {/* Floating Chat Button */}
      {portfolio && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 sm:px-6 rounded-full shadow-lg flex items-center gap-2 font-bold text-base sm:text-lg transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          Ask Me
        </button>
      )}
      {/* Chat Panel - Bottom Right */}
      {portfolio && chatOpen && (
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
            <ChatbotSection portfolio={portfolio} />
          </div>
        </div>
      )}
    </div>
  );
} 