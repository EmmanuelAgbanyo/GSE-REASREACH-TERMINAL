import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import type { FinancialStatementItem } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MetricChartProps {
  statementData: FinancialStatementItem[];
}

export const MetricChart: React.FC<MetricChartProps> = ({ statementData }) => {
    
  const metricsToPlot = [
    { name: 'Operating Income', color: 'rgba(212, 175, 55, 0.7)', borderColor: 'rgba(212, 175, 55, 1)'},
    { name: 'Profit for the year', color: 'rgba(74, 85, 104, 0.6)', borderColor: 'rgba(74, 85, 104, 1)'},
    { name: 'Net Income', color: 'rgba(74, 85, 104, 0.6)', borderColor: 'rgba(74, 85, 104, 1)'},
  ];

  // Extract all unique years from the data and sort them
  const allYearKeys = new Set<string>();
  statementData.forEach(item => {
    Object.keys(item).forEach(key => {
        // A simple check for year-like strings
        if (key !== 'metric' && /^\d{4}(?!\d)|(Q\d\s\d{4})|(H\d\s\d{4})$/.test(key)) {
            allYearKeys.add(key);
        }
    });
  });

  const labels = Array.from(allYearKeys).sort();

  const datasets = metricsToPlot.map(metricInfo => {
    const dataRow = statementData.find(row => row.metric.toLowerCase().includes(metricInfo.name.toLowerCase()));
    
    if (!dataRow) return null;

    const data = labels.map(year => {
        if (dataRow && (dataRow[year] !== undefined)) {
            const val = String(dataRow[year]);
            // Allow for numbers in parentheses to be negative
            const isNegative = val.includes('(') && val.includes(')');
            const num = parseFloat(val.replace(/[^0-9.-]+/g,""));
            if (isNaN(num)) return 0;
            return isNegative ? -num : num;
        }
        return 0;
    });

    return {
        label: metricInfo.name,
        data: data,
        backgroundColor: metricInfo.color,
        borderColor: metricInfo.borderColor,
        borderWidth: 1,
    };
  }).filter(dataset => dataset && dataset.data.some(d => d !== 0)); // Only include datasets with actual data


  if (!datasets || datasets.length === 0) {
    return (
        <div className="h-full flex items-center justify-center">
            <p className="text-text-secondary">Not enough data to display performance chart.</p>
        </div>
    );
  }


  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#a0aec0', // text-secondary
        }
      },
      title: {
        display: true,
        text: 'Key Performance Indicators',
        color: '#f7fafc', // text-primary
        font: {
            size: 16,
        }
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'decimal' }).format(context.parsed.y);
                }
                return label;
            }
        }
      }
    },
    scales: {
        x: {
            ticks: {
                color: '#a0aec0',
            },
            grid: {
                display: false,
            }
        },
        y: {
            ticks: {
                color: '#a0aec0',
                callback: function(value: any) {
                    if (Math.abs(value) >= 1e6) {
                        return (value / 1e6) + 'M';
                    } else if (Math.abs(value) >= 1e3) {
                        return (value / 1e3) + 'K';
                    }
                    return value;
                }
            },
            grid: {
                color: 'rgba(74, 85, 104, 0.4)',
            }
        }
    }
  };

  return (
    <div className="h-full">
      <div className="relative h-80">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};