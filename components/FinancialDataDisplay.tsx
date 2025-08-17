import React from 'react';
import type { FinancialData, FinancialStatementItem } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface FinancialDataDisplayProps {
  data: FinancialData;
}

const renderValue = (value: any) => {
    if (value === null || value === undefined || value === 'N/A' || value === '') return 'N/A';

    const num = parseFloat(String(value).replace(/,/g, ''));

    if (isNaN(num)) {
        return String(value); 
    }

    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(num));

    return num < 0 ? `(${formatted})` : formatted;
};

// A generic, responsive table component
const FinancialTable = ({ title, headers, rows }: { title: string; headers: string[]; rows: (string | number | undefined)[][] }) => (
    <div>
        <h4 className="text-lg font-semibold text-text-primary mb-3">{title}</h4>
        <div className="overflow-x-auto rounded-lg border border-neutral-light/50">
            <table className="min-w-full divide-y divide-neutral-light/50">
                <thead className="bg-neutral-light/10">
                    <tr className="border-b-2 border-neutral-light/20">
                        {headers.map((header, i) => (
                            <th key={i} scope="col" className={`px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider ${i > 0 ? 'text-right' : ''}`}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-neutral-medium divide-y divide-neutral-light/50">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-neutral-light/20 even:bg-neutral-dark/30 transition-colors duration-200">
                            {row.map((cell, j) => (
                                <td key={j} className={`px-4 py-3 whitespace-nowrap text-sm ${j === 0 ? 'font-medium text-text-primary' : 'text-text-secondary text-right'}`}>
                                    {j === 0 ? cell : renderValue(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const AnalysisBlock = ({ title, content }: { title: string; content?: string }) => {
    if (!content) return null;
    return (
        <div>
            <h4 className="text-lg font-semibold text-text-primary mb-3">{title}</h4>
            <div className="p-4 bg-neutral-dark/40 rounded-lg border border-neutral-light/50">
                <p className="text-text-secondary text-sm leading-relaxed">{content}</p>
            </div>
        </div>
    );
};


export const FinancialDataDisplay: React.FC<FinancialDataDisplayProps> = ({ data }) => {
    const { statements, keyMetrics, financialAnalysis } = data;

    // Prepare data for Key Metrics table
    const keyMetricsHeaders = ['Year', 'Price/Share', 'Market Cap', 'Shares Outstanding', 'Dividend/Share', 'YTD Return'];
    const keyMetricsRows = (keyMetrics || []).sort((a,b) => b.year - a.year).map(metric => [
        metric.year,
        metric.pricePerShare,
        metric.marketCap,
        metric.sharesOutstanding,
        metric.dividendPerShare,
        metric.ytdReturn
    ]);

    // Prepare data for Key Ratios table
    const keyRatiosHeaders = ['Year', 'P/E Ratio', 'Debt-to-Equity', 'Return on Equity', 'EPS'];
    const keyRatiosRows = (financialAnalysis?.keyRatios || []).sort((a,b) => b.year - a.year).map(ratio => [
        ratio.year,
        ratio.peRatio,
        ratio.debtToEquity,
        ratio.returnOnEquity,
        ratio.eps
    ]);

    // Prepare data for Financial Statement tables
    const prepareStatementTable = (statementItems: FinancialStatementItem[] | undefined) => {
        if (!statementItems || statementItems.length === 0) return { headers: [], rows: [] };
        
        const allHeaders = new Set<string>();
        statementItems.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'metric') allHeaders.add(key);
            });
        });

        const sortedHeaders = Array.from(allHeaders).sort().reverse();
        const headers = ['Metric', ...sortedHeaders];

        const rows = statementItems.map(item => {
            const row: (string | number | undefined)[] = [item.metric];
            sortedHeaders.forEach(header => {
                row.push(item[header]);
            });
            return row;
        });
        return { headers, rows };
    };
    
    const incomeStatementData = prepareStatementTable(statements?.incomeStatement);
    const cashflowStatementData = prepareStatementTable(statements?.cashflowStatement);
    const balanceSheetData = prepareStatementTable(statements?.balanceSheet);

    const hasData = keyMetricsRows.length > 0 || incomeStatementData.rows.length > 0 || cashflowStatementData.rows.length > 0 || balanceSheetData.rows.length > 0 || keyRatiosRows.length > 0;
    if (!hasData) return null;

    const handleExportCSV = () => {
        if (!data) return;
    
        const escapeCsvCell = (cell: any): string => {
            const value = cell === null || cell === undefined ? '' : String(cell);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };
        
        const toCsvRows = (rows: any[][]): string => {
            return rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
        }
        
        let csvContent = [];
    
        // Key Metrics
        if (keyMetricsRows.length > 0) {
            csvContent.push('Annual Metrics');
            csvContent.push(keyMetricsHeaders.join(','));
            csvContent.push(toCsvRows(keyMetricsRows));
            csvContent.push(''); 
        }

        // Key Ratios
        if (keyRatiosRows.length > 0) {
            csvContent.push('Key Financial Ratios');
            csvContent.push(keyRatiosHeaders.join(','));
            csvContent.push(toCsvRows(keyRatiosRows));
            csvContent.push('');
        }
    
        // Statements
        const processStatement = (title: string, data: { headers: string[], rows: (string | number | undefined)[][] }) => {
            if (!data.rows || data.rows.length === 0) return;
            csvContent.push(title);
            csvContent.push(data.headers.join(','));
            csvContent.push(toCsvRows(data.rows));
            csvContent.push('');
        };
        
        processStatement('Income Statement Highlights', incomeStatementData);
        processStatement('Cash Flow Statement Highlights', cashflowStatementData);
        processStatement('Statement of Financial Position Highlights', balanceSheetData);
    
        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'financial_data_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-brand-secondary">Financial Deep-Dive</h3>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary bg-neutral-light/40 hover:bg-neutral-light/70 border border-neutral-light rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasData}
                  aria-label="Export financial data as CSV"
                >
                  <DownloadIcon />
                  <span>Export as CSV</span>
                </button>
            </div>
            
            {financialAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <AnalysisBlock title="Financial Health Summary" content={financialAnalysis.healthSummary} />
                   <AnalysisBlock title="Competitor Snapshot" content={financialAnalysis.competitorSnapshot} />
                </div>
            )}

            {keyRatiosRows.length > 0 && (
                <FinancialTable
                    title="Key Financial Ratios"
                    headers={keyRatiosHeaders}
                    rows={keyRatiosRows}
                />
            )}

            {keyMetricsRows.length > 0 && (
                <FinancialTable 
                    title="Annual Metrics"
                    headers={keyMetricsHeaders}
                    rows={keyMetricsRows}
                />
            )}

            {incomeStatementData.rows.length > 0 && (
                <FinancialTable 
                    title="Income Statement Highlights"
                    headers={incomeStatementData.headers}
                    rows={incomeStatementData.rows}
                />
            )}

            {cashflowStatementData.rows.length > 0 && (
                 <FinancialTable 
                    title="Cash Flow Statement Highlights"
                    headers={cashflowStatementData.headers}
                    rows={cashflowStatementData.rows}
                />
            )}

            {balanceSheetData.rows.length > 0 && (
                 <FinancialTable 
                    title="Statement of Financial Position Highlights"
                    headers={balanceSheetData.headers}
                    rows={balanceSheetData.rows}
                />
            )}
        </div>
    );
};