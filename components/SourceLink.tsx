
import React from 'react';
import type { GroundingChunk } from '../types';

interface SourceLinkProps {
  source: GroundingChunk;
}

export const SourceLink: React.FC<SourceLinkProps> = ({ source }) => {
  if (!source?.web?.uri) {
    return null;
  }

  const { title, uri } = source.web;
  
  const displayUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.hostname;
    } catch (e) {
      return urlString;
    }
  };

  return (
    <a
      href={uri}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-neutral-dark hover:bg-neutral-light rounded-md border border-neutral-light/50 transition duration-200 group"
    >
      <p className="font-semibold text-text-primary group-hover:text-brand-secondary truncate">
        {title || 'Untitled Source'}
      </p>
      <p className="text-sm text-text-secondary truncate">{displayUrl(uri)}</p>
    </a>
  );
};
