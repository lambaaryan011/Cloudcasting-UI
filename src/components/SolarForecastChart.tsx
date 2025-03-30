
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Event bus for communication between components
export const chartEvents = {
  listeners: new Map(),
  subscribe: (id: string, callback: (data: any) => void) => {
    chartEvents.listeners.set(id, callback);
    return () => chartEvents.listeners.delete(id);
  },
  publish: (data: any) => {
    chartEvents.listeners.forEach(callback => callback(data));
  }
};

const generateMockData = (locationId: string = 'default') => {
  const data = [];
  const days = ['Sat 22', 'Sun 23', 'Today', 'Tue 25'];
  const hoursPerDay = 24;
  const totalPoints = days.length * hoursPerDay;
  
  // Generate a seed value from the locationId string
  let seed = 0;
  for (let i = 0; i < locationId.length; i++) {
    seed += locationId.charCodeAt(i);
  }
  
  for (let i = 0; i < totalPoints; i++) {
    const hour = i % hoursPerDay;
    const dayIndex = Math.floor(i / hoursPerDay);
    const formattedHour = hour.toString().padStart(2, '0') + ':00';
    
    // Create a basic sine wave for the yellow line (actual energy)
    // Use the seed to slightly modify the pattern for different locations
    const seedFactor = (seed % 10) / 10;
    const baseValue = Math.sin(((i / 12) + seedFactor) * Math.PI) * (7 + seedFactor * 2);
    const actualValue = hour >= 6 && hour <= 18 ? Math.max(0, baseValue) : 0;
    
    // Create a slightly different forecast line
    const forecastValue = actualValue * (1 + (Math.random() * 0.1 - 0.05));
    
    // Create bar data for the blue bars (cloud cover or precipitation)
    const cloudValue = hour >= 6 && hour <= 18 ? 
      Math.random() * 5 * (Math.random() > (0.7 - seedFactor * 0.2) ? 1 : 0) : 0;
    
    data.push({
      time: formattedHour,
      day: days[dayIndex],
      hourIndex: i,
      actual: actualValue,
      forecast: forecastValue,
      cloud: cloudValue,
      label: hour === 12 ? `${formattedHour}\n${days[dayIndex]}` : hour % 6 === 0 ? formattedHour : '',
    });
  }
  
  return data;
};

const chartConfig = {
  actual: {
    label: 'PV Live Initial Estimate',
    color: '#F59E0B',
  },
  forecast: {
    label: 'OCF Latest Forecast',
    color: '#F59E0B',
  },
  cloud: {
    label: 'Cloud Cover',
    color: '#93C5FD',
  },
};

const SolarForecastChart: React.FC = () => {
  const [solarData, setSolarData] = useState(generateMockData());
  const [locationText, setLocationText] = useState('Default Location');

  // Listen for map click events and regenerate chart data
  useEffect(() => {
    const unsubscribe = chartEvents.subscribe('map-click', (data) => {
      // Update the chart data based on the clicked location
      setSolarData(generateMockData(data.id));
      setLocationText(data.name || `Location ${data.id}`);
    });
    
    return unsubscribe;
  }, []);

  return (
    <Card className="p-0 border-0 bg-gray-700 rounded-none h-full">
      <div className="h-[350px] w-full">
        <div className="absolute left-4 top-3 z-10 bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded text-sm text-white">
          {locationText}
        </div>
        
        <ChartContainer config={chartConfig} className="h-full bg-gray-700 text-white">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={solarData}
              margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#555" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#999" 
                axisLine={{ stroke: '#555' }} 
                tickLine={false}
                tick={{ fill: '#999', fontSize: 10 }}
              />
              <YAxis stroke="#999" axisLine={{ stroke: '#555' }} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="cloud" 
                fill="#93C5FD" 
                stroke="none"
                fillOpacity={0.5}
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#F59E0B" 
                strokeDasharray="3 3"
                strokeWidth={2}
                fill="none"
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#F59E0B" 
                strokeWidth={2}
                fill="url(#colorActual)"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="absolute left-1/2 top-10 -translate-x-1/2 bg-gray-600 text-white text-sm px-3 py-1">
            17:00
          </div>
          
          <div className="mt-2 px-4 pt-4 border-t border-gray-600">
            <p className="text-center text-gray-400 text-sm">
              [ Delta values not available until PV Live output available ]
            </p>
          </div>
          
          <div className="flex justify-between p-4 border-t border-gray-600 mt-4">
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-4 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-300">PV LIVE INITIAL ESTIMATE</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-4 h-0 border border-dashed border-yellow-500 mr-2"></div>
                  <span className="text-sm text-gray-300">OCF LATEST FORECAST</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-gray-600 rounded px-2 py-1 flex items-center gap-1">
                <span className="text-white">4</span>
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default SolarForecastChart;
