export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface FinancialStatementItem {
  metric: string;
  [year: string]: string | number; // e.g., '2023 H1': 1000000
}

export interface FinancialStatements {
  incomeStatement: FinancialStatementItem[];
  cashflowStatement: FinancialStatementItem[];
  balanceSheet: FinancialStatementItem[];
}

export interface YearlyMetric {
  year: number;
  pricePerShare?: string;
  marketCap?: string;
  sharesOutstanding?: string;
  dividendPerShare?: string;
  ytdReturn?: string;
}

export interface YearlyRatio {
    year: number;
    peRatio?: string;
    debtToEquity?: string;
    returnOnEquity?: string;
    eps?: string;
}

export interface FinancialAnalysis {
    healthSummary: string;
    competitorSnapshot: string;
    keyRatios: YearlyRatio[];
}

export interface FinancialData {
  statements: FinancialStatements;
  keyMetrics: YearlyMetric[];
  financialAnalysis?: FinancialAnalysis;
}

export interface NewsSentiment {
  summary: string;
  score: 'Positive' | 'Neutral' | 'Negative';
}

export interface SearchResult {
  summary: string;
  sources: GroundingChunk[];
  financialData?: FinancialData | null;
  newsSentiment?: NewsSentiment | null;
}