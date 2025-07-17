import React from 'react';
import { BarChart3, PieChart, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

interface AIInsights {
  summary?: string;
  sector_analysis?: string;
  diversification?: string;
  risk_assessment?: string;
  recommendations?: string;
}

export default function PortfolioAIInsightsSection({
  aiInsights,
  aiInsightsLoading,
  aiInsightsError,
  renderInsightSection,
}: {
  aiInsights: AIInsights | string;
  aiInsightsLoading: boolean;
  aiInsightsError: string;
  renderInsightSection: (section: string | string[] | Record<string, unknown>, noBullets?: boolean) => React.ReactNode;
}) {
  // Consistent color classes
  const boxBase = "rounded-2xl bg-blue-100 p-5 flex flex-col min-h-[180px]";
  const titleClass = "text-blue-700 font-bold text-lg";
  const iconClass = "w-5 h-5 text-blue-500";
  const textClass = "text-blue-900 whitespace-pre-line text-base leading-relaxed min-h-[80px] flex items-center justify-center";

  return (
    <div className="mb-8 w-full">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-7 h-7 text-blue-400" />
        <h2 className="text-2xl font-extrabold text-indigo-900">AI Portfolio Insights ✨</h2>
      </div>
      {aiInsightsLoading ? (
        <div className="w-full flex flex-col items-center justify-center py-10">
          <div className="relative w-16 h-16 mb-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-blue-700 text-lg font-bold">Generating insights...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Portfolio Summary */}
          <div className={boxBase}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className={iconClass} />
              <span className={titleClass}>Portfolio Summary</span>
            </div>
            <div className={textClass}>
              {aiInsightsError ? aiInsightsError : renderInsightSection(typeof aiInsights === 'object' && 'summary' in aiInsights ? aiInsights.summary ?? '' : String(aiInsights ?? ''), true)}
            </div>
          </div>
          {/* Sector Analysis */}
          <div className={boxBase}>
            <div className="flex items-center gap-2 mb-2">
              <PieChart className={iconClass} />
              <span className={titleClass}>Sector Analysis</span>
            </div>
            <div className={textClass}>
              {aiInsightsError ? aiInsightsError : renderInsightSection(typeof aiInsights === 'object' && 'sector_analysis' in aiInsights ? aiInsights.sector_analysis ?? '' : String(aiInsights ?? ''), true)}
            </div>
          </div>
          {/* Diversification */}
          <div className={boxBase}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={iconClass} />
              <span className={titleClass}>Diversification</span>
            </div>
            <div className={textClass}>
              {aiInsightsError ? aiInsightsError : renderInsightSection(typeof aiInsights === 'object' && 'diversification' in aiInsights ? aiInsights.diversification ?? '' : String(aiInsights ?? ''), true)}
            </div>
          </div>
          {/* Risk Assessment */}
          <div className={boxBase + ' md:col-span-1 lg:col-span-1'}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={iconClass} />
              <span className={titleClass}>Risk Assessment</span>
            </div>
            <div className={textClass}>
              {aiInsightsError ? aiInsightsError : renderInsightSection(typeof aiInsights === 'object' && 'risk_assessment' in aiInsights ? aiInsights.risk_assessment ?? '' : String(aiInsights ?? ''), true)}
            </div>
          </div>
          {/* Recommendations */}
          <div className={boxBase + ' md:col-span-2 lg:col-span-1'}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={iconClass} />
              <span className={titleClass}>Recommendations</span>
            </div>
            <div className={textClass}>
              {aiInsightsError ? aiInsightsError : renderInsightSection(typeof aiInsights === 'object' && 'recommendations' in aiInsights ? aiInsights.recommendations ?? '' : String(aiInsights ?? ''), true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 