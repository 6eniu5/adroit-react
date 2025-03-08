// libs
import { toast } from 'react-toastify';
import { z } from 'zod';

// schemas
import { stockTradeArraySchema, stockTradeDataArraySchema } from './schemas/tradeSchema';

// types
import type { TradeRequestParams, StockTradeData, StockTrade } from './schemas/tradeSchema';

const API_BASE_URL = 'http://localhost:5072/api';

function transformTradeData(backendData: StockTrade[]): StockTradeData[] {
  return backendData.map(item => ({
    id: item.id.toString(),
    timeStamp: item.timestamp,
    tradeSize: item.tradeSize,
    price: item.price,
    symbol: item.symbol
  }));
}

export async function fetchTradesFromApi(
  params: TradeRequestParams,
  signal?: AbortSignal
): Promise<StockTradeData[]> {
  try {
    const url = new URL(`${API_BASE_URL}/trades`);
    url.searchParams.append('startTimestamp', params.startTimestamp);
    url.searchParams.append('minQuoteSize', params.minQuoteSize.toString());

    const response = await fetch(url.toString(), { signal });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();
    
    try {
      const validatedData = stockTradeArraySchema.parse(rawData);
      const transformedData = transformTradeData(validatedData);
      return stockTradeDataArraySchema.parse(transformedData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('Validation error:', validationError.format());
        throw new Error(`Data validation failed: ${validationError.message}`);
      }
      throw validationError;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was cancelled');
      return [];
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';
    
    toast.error(errorMessage);
    throw error;
  }
}