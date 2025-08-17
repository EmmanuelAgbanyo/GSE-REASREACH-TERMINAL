import { GoogleGenAI } from "@google/genai";
import type { SearchResult, GroundingChunk, FinancialData, NewsSentiment } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const JSON_DELIMITER_START = '---JSON_START---';
const JSON_DELIMITER_END = '---JSON_END---';

interface ParsedResponse {
    financialData?: FinancialData;
    newsSentiment?: NewsSentiment;
}

export async function searchCompanyData(query: string): Promise<SearchResult> {
  const prompt = `
You are an expert financial analyst. Your task is to provide a comprehensive financial overview for the query: "${query}".
Use Google Search to find the most recent and reliable data from official company reports, financial statements, and reputable news outlets.

**Output Requirements:**

1.  **Narrative Summary:** Begin with a concise, data-driven summary of the company's recent financial performance, market position, and outlook.
2.  **JSON Data:** After the summary, provide a single, well-formed JSON object enclosed between '${JSON_DELIMITER_START}' and '${JSON_DELIMITER_END}'. Do not include any text or markdown formatting before or after the JSON content within the delimiters.

**JSON Object Specification:**

The JSON object must contain two top-level keys: "financialData" and "newsSentiment".

-   **"financialData"**:
    -   **"statements"**: Object with arrays for "incomeStatement", "cashflowStatement", "balanceSheet".
        -   For each statement, extract key line items for the last 5 available fiscal years or half-year periods.
        -   **Prioritize these items**:
            -   **Income Statement**: 'Interest Income', 'Net Interest Income', 'Operating Income', 'Profit Before Tax', 'Profit for the year', 'Revenue', 'Net Income'.
            -   **Balance Sheet**: 'Total Assets', 'Total Liabilities', 'Total Equity', 'Cash and Cash Equivalents'.
            -   **Cash Flow**: 'Net Cash from Operating Activities', 'Net Cash from Investing Activities', 'Net Cash from Financing Activities'.
    -   **"keyMetrics"**: Array of annual objects. For each of the last 5 years, include: 'year', 'pricePerShare', 'marketCap', 'sharesOutstanding', 'dividendPerShare'.
    -   **"financialAnalysis"**:
        -   "healthSummary": A brief text analysis of the company's financial health.
        -   "competitorSnapshot": A brief text comparison against key competitors.
        -   "keyRatios": Array of annual objects. For each of the last 5 years, include: 'year', 'peRatio', 'eps' (Earnings Per Share), 'returnOnEquity', 'debtToEquity', 'EBITDA Margin'.

-   **"newsSentiment"**:
    -   "summary": A brief summary of the prevailing market sentiment based on recent news.
    -   "score": A single string value: 'Positive', 'Neutral', or 'Negative'.

Provide 'N/A' for any missing values. Ensure all financial figures are returned as numbers or strings that can be parsed as numbers.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    const validSources = sources.filter(s => s && s.web && s.web.uri && s.web.title);
    
    let summary = rawText;
    let financialData: FinancialData | null = null;
    let newsSentiment: NewsSentiment | null = null;
    
    const jsonStartIndex = rawText.indexOf(JSON_DELIMITER_START);
    const jsonEndIndex = rawText.indexOf(JSON_DELIMITER_END);

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        summary = rawText.substring(0, jsonStartIndex).trim();
        const jsonString = rawText.substring(jsonStartIndex + JSON_DELIMITER_START.length, jsonEndIndex).trim();
        try {
            const parsedJson = JSON.parse(jsonString) as ParsedResponse;
            financialData = parsedJson.financialData || null;
            newsSentiment = parsedJson.newsSentiment || null;
        } catch (e) {
            console.error("Failed to parse financial data JSON:", e);
            // If JSON parsing fails, we still have the summary and sources
            summary += "\n\n(Could not parse structured financial data from the response)";
        }
    }

    return {
      summary,
      sources: validSources,
      financialData,
      newsSentiment,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to fetch data from the Gemini API.");
  }
}