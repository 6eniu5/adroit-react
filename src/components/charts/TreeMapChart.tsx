import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import { useMemo } from 'react';
import type { StockTradeData } from '../../models/StockTradeData';
import { formatCurrency } from '../../helpers/numberFormatters';
import { CHART_COLORS, CHART_CONFIG } from '../../constants/chartConstants';

interface TreeMapChartProps {
  data: StockTradeData[];
}

// Define the shape of a TreeMap item
type TreeMapDataItem = {
  name: string;
  size: number;
  value: number;
  fill: string;
}

export const TreeMapChart = ({ data }: TreeMapChartProps) => {
  // Memoize tree map data - always call hooks before conditional returns
  const treeMapData: TreeMapDataItem[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Group data by symbol and calculate total value (price * tradeSize)
    const symbolGroups = data.reduce((acc, trade) => {
      const symbol = trade.symbol;
      const value = trade.price * trade.tradeSize;
      
      if (!acc[symbol]) {
        acc[symbol] = {
          totalValue: 0,
          totalSize: 0
        };
      }
      
      acc[symbol].totalValue += value;
      acc[symbol].totalSize += trade.tradeSize;
      
      return acc;
    }, {} as Record<string, { totalValue: number; totalSize: number }>);

    // Convert grouped data to format required by Treemap
    return Object.entries(symbolGroups).map(([symbol, data], index) => ({
      name: symbol,
      size: data.totalSize,
      value: Math.round(data.totalValue), // Round for cleaner display
      fill: CHART_COLORS.TREEMAP[index % CHART_COLORS.TREEMAP.length]
    }));
  }, [data]);

  // Format tooltip value as currency with thousand separators
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value, 0);
  };
  
  // Skip rendering if no data - after all hooks
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  return (
    <div className="chart-container" style={{ height: CHART_CONFIG.DEFAULT_HEIGHT, width: '100%' }}>
      <h3>Total Value by Security</h3>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeMapData}
          dataKey="value"
          stroke="#fff"
          fill={CHART_COLORS.VOLUME} // Default fill
          aspectRatio={4 / 3}
          nameKey="name"
        >
          <Tooltip 
            formatter={(value: number) => formatTooltipValue(value)} 
            labelFormatter={(label: string) => `Symbol: ${label}`}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};