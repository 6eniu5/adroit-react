import { useState, useMemo } from 'react';
import { CHART_CONFIG } from '../constants/chartConstants';

/**
 * Custom hook for optimizing chart data and managing zoom states
 * @param data Original data array to be optimized
 * @returns Optimized data and zoom control functions
 */
export function useChartOptimization<T>(data: T[]) {
  // Track visible data range
  const [dataRange, setDataRange] = useState({
    startIndex: 0,
    endIndex: Number.MAX_SAFE_INTEGER
  });
  
  // Optimize data for better chart performance
  const optimizedData = useMemo(() => {
    const maxPoints = CHART_CONFIG.MAX_POINTS;
    
    if (data.length <= maxPoints) {
      return data; // Use all data if under max points
    }
    
    // Calculate visible slice based on range
    const actualEnd = Math.min(dataRange.endIndex, data.length - 1);
    const visibleData = data.slice(dataRange.startIndex, actualEnd + 1);
    
    // Sample points if still too many
    if (visibleData.length <= maxPoints) {
      return visibleData;
    }
    
    // Sample data at regular intervals
    const interval = Math.ceil(visibleData.length / maxPoints);
    return visibleData.filter((_, index) => index % interval === 0);
  }, [data, dataRange]);
  
  // Zoom to specific percentage range of the data
  const zoomToRange = (startPct: number, endPct: number) => {
    const totalItems = data.length;
    
    // Convert percentage to indices
    const newStart = Math.floor(totalItems * startPct);
    const newEnd = Math.ceil(totalItems * endPct);
    
    setDataRange({
      startIndex: newStart,
      endIndex: newEnd
    });
  };
  
  return {
    optimizedData,
    zoomToRange,
    dataRange
  };
}