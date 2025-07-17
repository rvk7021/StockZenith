import React from 'react';
import type { Portfolio } from '../pages/dashboard';
import PortfolioCard from './PortfolioCard';
import { useRouter } from 'next/router';

interface PortfolioGridProps {
  portfolios: Portfolio[];
  loading: boolean;
  handleNew: () => void;
  prices: Record<string, number | null>;
}

export default function PortfolioGrid({
  portfolios,
  loading,
  handleNew,
  prices,
}: PortfolioGridProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 animate-pulse">
            <div className="h-6 bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-600 rounded flex-1"></div>
              <div className="h-8 bg-gray-600 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No portfolios yet</h3>
        <p className="text-gray-400 mb-8">Create your first portfolio to get started</p>
        <button
          onClick={handleNew}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transform  transition-all duration-300 shadow-lg"
        >
          Create Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {portfolios.map((p, index) => (
        <div
          key={p.id}
          style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
        >
          <PortfolioCard
            portfolio={p}
            prices={prices}
            onView={(id) => router.push(`/dashboard/${id}`)}
          />
        </div>
      ))}
    </div>
  );
} 