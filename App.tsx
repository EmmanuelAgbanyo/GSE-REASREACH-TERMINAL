
import React, { useState, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsDisplay } from './components/ResultsDisplay';
import { searchCompanyData } from './services/geminiService';
import type { SearchResult } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Please enter a valid company or query.');
      return;
    }
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setHasSearched(true);

    try {
      const result = await searchCompanyData(searchQuery);
      setSearchResult(result);
    } catch (err) {
      setError('Failed to retrieve data. The API might be unavailable or the request failed. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-dark text-text-primary font-sans">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="text-center mb-8 pb-6 border-b-2 border-neutral-light/30">
          <div className="flex justify-center items-center gap-3 mb-2">
            <svg
              className="w-10 h-10 text-brand-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
              GSE Financial Research Terminal
            </h1>
          </div>
          <p className="text-text-secondary">
            AI-Powered Insights on Ghana Stock Exchange Listed Companies
          </p>
        </header>

        <main>
          <div className="sticky top-4 z-10 bg-neutral-dark/80 backdrop-blur-sm py-2 px-2 rounded-lg">
             <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-center">
              {error}
            </div>
          )}
          <div className="mt-8">
            <ResultsDisplay
              isLoading={isLoading}
              result={searchResult}
              hasSearched={hasSearched}
            />
          </div>
        </main>

        <footer className="text-center mt-12 py-4 border-t border-neutral-light">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} Financial Research. Data provided for informational purposes only.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;