import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-2 p-1 rounded-md transition-all duration-300 border border-transparent focus-within:border-brand-secondary/50 focus-within:bg-neutral-medium/50">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., 'Financials for MTN Ghana' or 'GCB Bank stock trend'"
        className="flex-grow bg-neutral-medium border border-neutral-light rounded-md px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary transition duration-200"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="flex-shrink-0 bg-brand-secondary text-brand-primary font-bold px-4 py-3 rounded-md hover:bg-yellow-500 disabled:bg-neutral-light disabled:cursor-not-allowed transition duration-200 flex items-center justify-center w-28"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <SearchIcon />
        )}
        <span className="ml-2">{isLoading ? '' : 'Search'}</span>
      </button>
    </form>
  );
};