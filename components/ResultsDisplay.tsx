import React from 'react';
import type { SearchResult } from '../types';
import { SourceLink } from './SourceLink';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { FinancialDataDisplay } from './FinancialDataDisplay';
import { SentimentDisplay } from './SentimentDisplay';
import { MetricChart } from './MetricChart';

interface ResultsDisplayProps {
  isLoading: boolean;
  result: SearchResult | null;
  hasSearched: boolean;
}

const WelcomeMessage: React.FC = () => (
    <div className="text-center p-8 bg-neutral-medium rounded-lg border-2 border-dashed border-neutral-light">
      <svg className="mx-auto h-12 w-12 text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <h2 className="mt-6 text-2xl font-semibold text-text-primary">Welcome to the Research Terminal</h2>
      <p className="mt-2 text-text-secondary">
        Your AI-powered gateway to financial insights on the Ghana Stock Exchange.
      </p>
      <div className="mt-8 text-left max-w-md mx-auto space-y-3 text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">Start by asking for:</p>
        <ul className="list-none space-y-2">
            <li className="flex items-center gap-2"><span className="text-brand-secondary">›</span>"Financial summary for Fan Milk PLC"</li>
            <li className="flex items-center gap-2"><span className="text-brand-secondary">›</span>"Recent news for Standard Chartered Bank"</li>
            <li className="flex items-center gap-2"><span className="text-brand-secondary">›</span>"Key financial ratios for Tullow Oil"</li>
        </ul>
      </div>
    </div>
);

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-neutral-medium rounded-lg border border-neutral-light">
    <SpinnerIcon />
    <p className="mt-4 text-text-secondary animate-pulse">Fetching and analyzing real-time data...</p>
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, result, hasSearched }) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!hasSearched) {
    return <WelcomeMessage />;
  }
  
  if (!result) {
    return null; // Don't show anything if there's no result and not loading (e.g. on error)
  }

  const hasFinancials = result.financialData && (result.financialData.keyMetrics?.length > 0 || result.financialData.statements?.incomeStatement?.length > 0);
  const hasIncomeStatementForChart = result.financialData?.statements?.incomeStatement && result.financialData.statements.incomeStatement.length > 0;
  const cardStyle = "bg-neutral-medium rounded-lg border border-neutral-light p-6 shadow-lg transition-all duration-300 hover:border-brand-secondary/50 hover:-translate-y-1";


  return (
    <div className="space-y-8">
      {/* Summary Section */}
      {result.summary && (
        <div className={cardStyle}>
          <h2 className="text-2xl font-bold text-brand-secondary mb-4">AI-Generated Summary</h2>
          <div className="prose prose-invert max-w-none text-text-primary whitespace-pre-wrap">
            {result.summary}
          </div>
        </div>
      )}

      {/* New Dashboard Grid for Sentiment and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {result.newsSentiment && (
              <div className={`lg:col-span-1 ${cardStyle}`}>
                  <SentimentDisplay sentiment={result.newsSentiment} />
              </div>
          )}
          {hasIncomeStatementForChart && (
            <div className={`${cardStyle} ${result.newsSentiment ? "lg:col-span-2" : "lg:col-span-3"}`}>
                <MetricChart statementData={result.financialData!.statements.incomeStatement!} />
            </div>
          )}
      </div>

      {/* Financial Data Section */}
      {hasFinancials && (
          <div className={cardStyle}>
             <FinancialDataDisplay data={result.financialData!} />
          </div>
      )}

      {/* Sources Section */}
      {result.sources && result.sources.length > 0 && (
        <div className={cardStyle}>
          <h3 className="text-xl font-bold text-brand-secondary mb-4">Data Sources</h3>
          <p className="text-sm text-text-secondary mb-4">
            The summary above was generated using information from the following web pages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.sources.map((source, index) => (
              <SourceLink key={index} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};