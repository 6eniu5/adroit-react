// libs
import { useCallback, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// utils
import { fetchTradesFromApi } from './tradeApi';

// components
import { ChartContainer } from './components/charts/ChartContainer';

// styles
import './App.css'
import 'react-toastify/dist/ReactToastify.css';

// types
import type { StockTradeData } from './models/StockTradeData';
import type { AggregationPeriod, Chart } from './hooks/useTradeData';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Dashboard() {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())
      .toISOString().split('T')[0]
  );
  const [minSize, setMinSize] = useState<number>(10);
  const [aggregation, setAggregation] = useState<AggregationPeriod>('Daily');
  const [chart, setChart] = useState<Chart>('BarChart');
  const [isLoading, setIsLoading] = useState(false);
  const [tradeData, setTradeData] = useState<StockTradeData[]>([]);

  const handleFetchTrades = useCallback(async () => {
    setIsLoading(true);
    try {
      const trades = await fetchTradesFromApi({
        startTimestamp: new Date(startDate).toISOString(),
        minQuoteSize: minSize
      });
      setTradeData(trades);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, minSize]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleMinSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinSize(parseInt(e.target.value) || 0);
  };

  const handleAggregationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAggregation(e.target.value as AggregationPeriod);
  };

  const handleChartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChart(e.target.value as Chart);
  };

  return (
    <>
      <div className='main-container'>
        <div className='menu-container'>
          <div className='input-group'>
            <label>Start Date</label>
            <input 
              type="date" 
              id="start" 
              name="trip-start"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div className='input-group'>
            <label>Min Size</label>
            <input 
              type="number" 
              id="minSize" 
              name="trip-start"
              value={minSize}
              onChange={handleMinSizeChange}
            />
          </div>
          <div className='input-group'>
            <label>Aggregation</label>
            <select 
              name="aggregation" 
              id="aggregation"
              value={aggregation}
              onChange={handleAggregationChange}
            >
              <option value="Daily">Daily (1 Day)</option>
              <option value="Weekly">Weekly (7 Days)</option>
              <option value="Monthly">Monthly (30 Days)</option>
              <option value="Quarterly">Quarterly (91 Days)</option>
            </select>
          </div>
          <div className='input-group'>
            <label>Chart</label>
            <select 
              name="chart" 
              id="chart"
              value={chart}
              onChange={handleChartChange}
            >
              <option value="BarChart">Bar Chart</option>
              <option value="TreeMap">Tree Map</option>
            </select>
          </div>
          <button onClick={handleFetchTrades} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Go'}
          </button>
        </div>
        <div>
          <div className='chart-container'>
            {tradeData.length === 0 ? (
              <p>No data to display. Select parameters and click Go.</p>
            ) : (
              <ChartContainer 
                data={tradeData} 
                chartType={chart} 
                aggregation={aggregation} 
              />
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}

export default App;