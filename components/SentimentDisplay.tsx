import React from 'react';
import type { NewsSentiment } from '../types';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';
import { MinusIcon } from './icons/MinusIcon';

interface SentimentDisplayProps {
  sentiment: NewsSentiment;
}

const sentimentConfig = {
  Positive: {
    Icon: TrendingUpIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-900/50',
    borderColor: 'border-green-700',
    text: 'Positive',
  },
  Negative: {
    Icon: TrendingDownIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-900/50',
    borderColor: 'border-red-700',
    text: 'Negative',
  },
  Neutral: {
    Icon: MinusIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/50',
    borderColor: 'border-yellow-700',
    text: 'Neutral',
  },
};

export const SentimentDisplay: React.FC<SentimentDisplayProps> = ({ sentiment }) => {
  if (!sentiment?.score) return null;
  const config = sentimentConfig[sentiment.score] || sentimentConfig.Neutral;
  const { Icon, color, bgColor, text } = config;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-bold text-brand-secondary mb-4">News Sentiment</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full ${color} ${bgColor}`}>
            <Icon />
        </div>
        <span className={`text-2xl font-semibold ${color}`}>{text}</span>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{sentiment.summary}</p>
    </div>
  );
};