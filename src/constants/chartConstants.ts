// Chart colors
export const CHART_COLORS = {
  // Volume bar color
  VOLUME: '#8884d8',
  // Average price line color
  PRICE: '#82ca9d',
  // TreeMap colors for different stocks
  TREEMAP: ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'],
  // Button colors
  BUTTON_BG: '#f0f0f0',
  BUTTON_BORDER: '#ccc',
};

// Chart configuration
export const CHART_CONFIG = {
  // Maximum data points to display for optimal performance
  MAX_POINTS: 50,
  // Default height for chart containers
  DEFAULT_HEIGHT: 450,
  TREE_MAP_DEFAULT_HEIGHT: 'auto',
  // Chart margins
  MARGINS: { top: 10, right: 35, left: 25, bottom: 10 },
  // Y-axis width
  AXIS_WIDTH: 85,
};

// Zoom presets
export const ZOOM_PRESETS = [
  { label: 'All', range: [0, 1] },
  { label: 'First Half', range: [0, 0.5] },
  { label: 'Second Half', range: [0.5, 1] },
  { label: 'First Quarter', range: [0, 0.25] },
  { label: 'Last Quarter', range: [0.75, 1] }
];