import type { AggregationPeriod, Chart } from '../../hooks/useTradeData';
import type { StockTradeData } from '../../models/StockTradeData';
import { PriceVolumeChart } from './PriceVolumeChart';
import { TreeMapChart } from './TreeMapChart';

interface ChartContainerProps {
  data: StockTradeData[];
  chartType: Chart;
  aggregation: AggregationPeriod;
}

export const ChartContainer = ({ data, chartType, aggregation }: ChartContainerProps) => {
  if (!data || data.length === 0) {
    return <p>No data to display. Select parameters and click Go.</p>;
  }

  return (
    <>
      {chartType === 'TreeMap' ? (
        <TreeMapChart data={data} />
      ) : (
        <PriceVolumeChart data={data} aggregation={aggregation} />
      )}
    </>
  );
};