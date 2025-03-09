import type { AggregationPeriod } from '../hooks/useTradeData';

/**
 * Formats a date string based on the specified aggregation period
 * @param timestamp ISO date string
 * @param aggregation Aggregation period (Daily, Weekly, Monthly, Quarterly)
 * @returns Formatted date string
 */
export const formatDateByAggregation = (timestamp: string, aggregation: AggregationPeriod): string => {
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

/**
 * Formats a date object to include month, day and year
 * @param date JavaScript Date object
 * @returns Formatted date string with month, day and year
 */
export const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};