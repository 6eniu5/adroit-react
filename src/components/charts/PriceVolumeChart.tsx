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
import { useMemo } from 'react';
import type { StockTradeData } from '../../models/StockTradeData';
import type { AggregationPeriod } from '../../hooks/useTradeData';
import { formatDateByAggregation, formatFullDate } from '../../helpers/dateFormatters';
import { formatCurrency, formatVolume } from '../../helpers/numberFormatters';
import { useChartOptimization } from '../../hooks/useChartOptimization';
import { CHART_COLORS, CHART_CONFIG, ZOOM_PRESETS } from '../../constants/chartConstants';

interface PriceVolumeChartProps {
  data: StockTradeData[];
  aggregation: AggregationPeriod;
}

type ChartDataItem = {
  date: string;
  fullDate: Date;
  volume: number;
  avgPrice: number;
};

export const PriceVolumeChart = ({ data, aggregation }: PriceVolumeChartProps) => {
  // Process chart data - always call useMemo before conditional returns
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter((item, index, self) => 
        // Filter unique timestamps (should be pre-aggregated)
        index === self.findIndex(t => t.timeStamp === item.timeStamp)
      )
      .map(item => {
        const dateObj = new Date(item.timeStamp);
        return {
          date: formatDateByAggregation(item.timeStamp, aggregation),
          fullDate: dateObj,
          volume: item.tradeSize,
          avgPrice: item.price
        };
      })
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [data, aggregation]);
  
  // Use our custom hook for chart optimization - always call hooks before conditional returns
  const { optimizedData, zoomToRange } = useChartOptimization<ChartDataItem>(chartData);
  
  // Skip rendering if no data - after all hooks are called
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  return (
    <div className="chart-container" style={{ height: CHART_CONFIG.DEFAULT_HEIGHT, width: '100%' }}>
      <h3>Average Price vs Volume ({aggregation})</h3>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '10px' }}>
        {ZOOM_PRESETS.map(option => (
          <button 
            key={option.label}
            onClick={() => zoomToRange(option.range[0], option.range[1])}
            style={{ 
              padding: '4px 8px', 
              background: CHART_COLORS.BUTTON_BG, 
              border: `1px solid ${CHART_COLORS.BUTTON_BORDER}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart 
          data={optimizedData}
          margin={CHART_CONFIG.MARGINS}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            interval="preserveStartEnd"
            tick={{ fontSize: 11 }}
          />
          
          {/* Left Y-axis for volume */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke={CHART_COLORS.VOLUME}
            tickFormatter={formatVolume}
            label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
            width={CHART_CONFIG.AXIS_WIDTH}
          />
          
          {/* Right Y-axis for price */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke={CHART_COLORS.PRICE}
            tickFormatter={formatCurrency}
            label={{ value: 'Price', angle: 90, position: 'insideRight' }}
            width={CHART_CONFIG.AXIS_WIDTH}
          />
          
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'avgPrice') return [formatCurrency(value), 'Avg Price'];
              return [formatVolume(value), 'Volume'];
            }}
            labelFormatter={(label) => {
              // Find the matching data item to get the full date
              const matchingDataItem = optimizedData.find(item => item.date === label);
              if (matchingDataItem) {
                return formatFullDate(matchingDataItem.fullDate);
              }
              return label;
            }}
          />
          
          <Legend />
          
          {/* Volume bars */}
          <Bar 
            yAxisId="left" 
            dataKey="volume" 
            fill={CHART_COLORS.VOLUME} 
            name="Volume" 
            barSize={20}
          />
          
          {/* Price line */}
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="avgPrice" 
            stroke={CHART_COLORS.PRICE} 
            name="Avg Price"
            dot={true}
          />
          
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '5px', color: '#666' }}>
        Click zoom buttons above to show different time ranges.
      </div>
    </div>
  );
};