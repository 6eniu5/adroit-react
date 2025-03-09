import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import type { StockTradeData } from '../../models/StockTradeData';

interface TreeMapChartProps {
  data: StockTradeData[];
}

interface TreeMapItem {
  name: string;
  size: number;
  value: number;
  fill: string;
}

// Color palette for different stocks
const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

export const TreeMapChart = ({ data }: TreeMapChartProps) => {
  // Skip rendering if no data
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

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
  const treeMapData: TreeMapItem[] = Object.entries(symbolGroups).map(([symbol, data], index) => ({
    name: symbol,
    size: data.totalSize,
    value: Math.round(data.totalValue), // Round for cleaner display
    fill: COLORS[index % COLORS.length]
  }));

  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="chart-container" style={{ height: 400, width: '100%' }}>
      <h3>Total Value by Security</h3>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeMapData}
          dataKey="value"
          stroke="#fff"
          fill="#8884d8"
          aspectRatio={4 / 3}
          nameKey="name"
        >
          <Tooltip 
            formatter={(value: number) => formatTooltip(value)} 
            labelFormatter={(label: string) => `Symbol: ${label}`}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};