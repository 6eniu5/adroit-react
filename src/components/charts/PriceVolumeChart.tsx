import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { StockTradeData } from '../../models/StockTradeData';
import type { AggregationPeriod } from '../../hooks/useTradeData';

interface PriceVolumeChartProps {
  data: StockTradeData[];
  aggregation: AggregationPeriod;
}

interface ChartDataItem {
  date: string;       // Formatted date for display
  fullDate: Date;     // Original date object for tooltip
  volume: number;
  avgPrice: number;
}

export const PriceVolumeChart = ({ data, aggregation }: PriceVolumeChartProps) => {
  // Skip rendering if no data
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  // Format date based on aggregation period
  const formatDate = (timestamp: string, aggregation: AggregationPeriod): string => {
    const date = new Date(timestamp);
    
    switch (aggregation) {
      case 'Daily': {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      case 'Weekly': {
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      case 'Monthly': {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      case 'Quarterly': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      }
      default:
        return timestamp;
    }
  };

  // Prepare chart data - data should already be aggregated
  const chartData: ChartDataItem[] = data
    .filter((item, index, self) => 
      // Filter unique timestamps (should be pre-aggregated)
      index === self.findIndex(t => t.timeStamp === item.timeStamp)
    )
    .map(item => {
      const dateObj = new Date(item.timeStamp);
      return {
        date: formatDate(item.timeStamp, aggregation),
        fullDate: dateObj,
        volume: item.tradeSize,
        avgPrice: item.price
      };
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  // Format currency values
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  
  // Format volume values
  const formatVolume = (value: number) => `${value.toLocaleString()}`;

  return (
    <div className="chart-container" style={{ height: 400, width: '100%' }}>
      <h3>Average Price vs Volume ({aggregation})</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          
          {/* Left Y-axis for volume */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#8884d8"
            tickFormatter={formatVolume}
            label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
          />
          
          {/* Right Y-axis for price */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#82ca9d"
            tickFormatter={formatCurrency}
            label={{ value: 'Price', angle: 90, position: 'insideRight' }}
          />
          
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'avgPrice') return [formatCurrency(value), 'Avg Price'];
              return [formatVolume(value), 'Volume'];
            }}
            labelFormatter={(label) => {
              // Find the matching data item to get the full date
              const matchingDataItem = chartData.find(item => item.date === label);
              if (matchingDataItem) {
                // Format with full date including year
                return matchingDataItem.fullDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                });
              }
              return label;
            }}
          />
          
          <Legend />
          
          {/* Volume bars */}
          <Bar 
            yAxisId="left" 
            dataKey="volume" 
            fill="#8884d8" 
            name="Volume" 
            barSize={20}
          />
          
          {/* Price line */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="avgPrice" 
            stroke="#82ca9d" 
            name="Avg Price"
            dot={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};