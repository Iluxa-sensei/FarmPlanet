// Mock data for the Orbiview dashboard

export const mockKpData = [
  { time: '6 days ago', kp: 2.1 },
  { time: '5 days ago', kp: 3.2 },
  { time: '4 days ago', kp: 4.8 },
  { time: '3 days ago', kp: 6.1 },
  { time: '2 days ago', kp: 5.3 },
  { time: '1 day ago', kp: 3.9 },
  { time: 'Today', kp: 4.2 },
];

export const mockTemperatureData = [
  { region: 'Arctic', temperature: -15 },
  { region: 'N. America', temperature: 12 },
  { region: 'Europe', temperature: 8 },
  { region: 'Asia', temperature: 18 },
  { region: 'Africa', temperature: 28 },
  { region: 'S. America', temperature: 22 },
  { region: 'Oceania', temperature: 16 },
  { region: 'Antarctica', temperature: -35 },
];

export const mockNdviData = [
  { month: 'Jan', ndvi: 0.3 },
  { month: 'Feb', ndvi: 0.35 },
  { month: 'Mar', ndvi: 0.45 },
  { month: 'Apr', ndvi: 0.6 },
  { month: 'May', ndvi: 0.75 },
  { month: 'Jun', ndvi: 0.8 },
  { month: 'Jul', ndvi: 0.85 },
  { month: 'Aug', ndvi: 0.8 },
  { month: 'Sep', ndvi: 0.7 },
  { month: 'Oct', ndvi: 0.55 },
  { month: 'Nov', ndvi: 0.4 },
  { month: 'Dec', ndvi: 0.32 },
];

export const mockAlerts = [
  {
    id: 1,
    title: 'Severe Geomagnetic Storm Warning',
    description: 'Kp-index expected to reach 7+ in the next 6 hours. Potential power grid disruptions in northern regions.',
    severity: 'critical' as const,
    time: '2 minutes ago',
    type: 'geomagnetic'
  },
  {
    id: 2,
    title: 'Temperature Anomaly Detected',
    description: 'Unusual temperature spike detected in Northern Canada (+15°C above normal).',
    severity: 'warning' as const,
    time: '15 minutes ago',
    type: 'temperature'
  },
  {
    id: 3,
    title: 'Aurora Activity Increase',
    description: 'Enhanced aurora activity visible at lower latitudes than usual.',
    severity: 'info' as const,
    time: '1 hour ago',
    type: 'aurora'
  },
  {
    id: 4,
    title: 'NDVI Decline in Amazon Basin',
    description: 'Vegetation health index showing concerning decline in southeastern Amazon.',
    severity: 'warning' as const,
    time: '2 hours ago',
    type: 'vegetation'
  },
  {
    id: 5,
    title: 'Solar Flare Detected',
    description: 'M-class solar flare observed. Minor radio communication disruptions possible.',
    severity: 'info' as const,
    time: '4 hours ago',
    type: 'solar'
  }
];

export const mockMapData = {
  temperature: [
    { lat: 64.2008, lng: -149.4937, value: -12, intensity: 0.8 }, // Alaska
    { lat: 55.7558, lng: 37.6176, value: -5, intensity: 0.6 }, // Moscow
    { lat: 40.7128, lng: -74.0060, value: 3, intensity: 0.4 }, // New York
    { lat: 35.6762, lng: 139.6503, value: 8, intensity: 0.3 }, // Tokyo
    { lat: 1.3521, lng: 103.8198, value: 28, intensity: 0.9 }, // Singapore
    { lat: -33.8688, lng: 151.2093, value: 22, intensity: 0.7 }, // Sydney
    { lat: 19.4326, lng: -99.1332, value: 18, intensity: 0.5 }, // Mexico City
    { lat: -1.2921, lng: 36.8219, value: 24, intensity: 0.8 }, // Nairobi
  ],
  ndvi: [
    { lat: -3.4653, lng: -62.2159, value: 0.85, intensity: 0.9 }, // Amazon
    { lat: 1.3733, lng: 32.2903, value: 0.72, intensity: 0.8 }, // Uganda
    { lat: 46.2276, lng: 2.2137, value: 0.68, intensity: 0.7 }, // France
    { lat: 39.9042, lng: 116.4074, value: 0.45, intensity: 0.5 }, // Beijing
    { lat: 37.0902, lng: -95.7129, value: 0.78, intensity: 0.8 }, // Kansas
    { lat: -26.2041, lng: 28.0473, value: 0.62, intensity: 0.6 }, // Johannesburg
  ],
  aurora: [
    { lat: 69.3498, lng: -133.0568, value: 'High', intensity: 0.9 }, // Northwest Territories
    { lat: 68.9731, lng: 33.0744, value: 'Medium', intensity: 0.7 }, // Murmansk
    { lat: 64.0685, lng: -21.9422, value: 'High', intensity: 0.8 }, // Iceland
    { lat: 70.2676, lng: 31.1107, value: 'Low', intensity: 0.4 }, // Northern Norway
    { lat: 66.5039, lng: 25.7294, value: 'Medium', intensity: 0.6 }, // Finnish Lapland
  ]
};