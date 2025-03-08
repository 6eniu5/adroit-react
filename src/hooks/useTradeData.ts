// libs
import { useMemo, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// utils
import { fetchTradesFromApi } from '../tradeApi';

// types
import type { StockTradeData, TradeRequestParams } from '../schemas/tradeSchema';

export type AggregationPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
export type Chart = "BarChart" | "TreeMap";

interface UseTradeDataParams extends TradeRequestParams {
  aggregation: AggregationPeriod;
}

export function useTradeData({ startTimestamp, minQuoteSize, aggregation }: UseTradeDataParams) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const queryKey = useMemo(() => 
    ['trades', startTimestamp, minQuoteSize], 
    [startTimestamp, minQuoteSize]
  );

  const { 
    data: trades,
    isLoading,
    error,
    isError,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      const combinedSignal = signal 
        ? new AbortController().signal 
        : abortControllerRef.current.signal;

      return fetchTradesFromApi(
        { startTimestamp, minQuoteSize },
        combinedSignal
      );
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const aggregatedData = useMemo(() => {
    if (!trades) return [];
    
    return aggregateTradeData(trades, aggregation);
  }, [trades, aggregation]);

  return {
    trades,
    aggregatedData,
    isLoading,
    isFetching,
    error,
    isError,
    refreshData
  };
}

function aggregateTradeData(trades: StockTradeData[], period: AggregationPeriod): StockTradeData[] {
  if (!trades.length) return [];

  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
  );

  const groupedTrades = groupTradesByPeriod(sortedTrades, period);
  
  return Object.entries(groupedTrades).flatMap(([timestamp, tradesInPeriod]) => {
    if (!tradesInPeriod.length) return [];
    
    const symbolGroups = groupTradesBySymbol(tradesInPeriod);
    
    return Object.entries(symbolGroups).map(([symbol, symbolTrades]) => {
      const totalSize = symbolTrades.reduce((sum, trade) => sum + trade.tradeSize, 0);
      const averagePrice = symbolTrades.reduce((sum, trade) => 
        sum + (trade.price * trade.tradeSize), 0) / totalSize;
        
      return {
        id: `${timestamp}-${symbol}`,
        timeStamp: timestamp,
        tradeSize: totalSize,
        price: parseFloat(averagePrice.toFixed(2)),
        symbol: symbol as StockTradeData['symbol']
      };
    });
  });
}

function groupTradesByPeriod(
  trades: StockTradeData[], 
  period: AggregationPeriod
): Record<string, StockTradeData[]> {
  const groups: Record<string, StockTradeData[]> = {};
  
  trades.forEach(trade => {
    const date = new Date(trade.timeStamp);
    let periodKey: string;
    
    switch (period) {
      case 'Daily': {
        periodKey = date.toISOString().split('T')[0];
        break;
      }
      
      case 'Weekly': {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        periodKey = startOfWeek.toISOString().split('T')[0];
        break;
      }
      
      case 'Monthly': {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      }
      
      case 'Quarterly': {
        const quarter = Math.floor(date.getMonth() / 3);
        periodKey = `${date.getFullYear()}-Q${quarter + 1}`;
        break;
      }
        
      default:
        periodKey = date.toISOString().split('T')[0];
    }
    
    if (!groups[periodKey]) {
      groups[periodKey] = [];
    }
    
    groups[periodKey].push(trade);
  });
  
  return groups;
}

function groupTradesBySymbol(trades: StockTradeData[]): Record<string, StockTradeData[]> {
  const groups: Record<string, StockTradeData[]> = {};
  
  trades.forEach(trade => {
    if (!groups[trade.symbol]) {
      groups[trade.symbol] = [];
    }
    
    groups[trade.symbol].push(trade);
  });
  
  return groups;
}