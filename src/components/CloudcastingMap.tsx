import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Info, ZoomIn, ZoomOut } from 'lucide-react';

// Replace with your Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmxvd2lydHoiLCJhIjoiY2tlcGhtMnFnMWRzajJ2bzhmdGs5ZXVveSJ9.Dq5iSpi54SaajfdMyM_8fQ';

// Define correct GeoJSON types
interface CloudFeature {
  type: "Feature";
  properties: {
    id: string;
    density: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

interface CloudCollection {
  type: "FeatureCollection";
  features: CloudFeature[];
}

// Properly typed cloud data
const dummyCloudData: CloudCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: 'cloud1', density: 0.7 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-100, 40],
          [-95, 37],
          [-90, 35],
          [-85, 37],
          [-82, 42],
          [-85, 45],
          [-90, 47],
          [-95, 45],
          [-100, 40]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: 'cloud2', density: 0.5 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-120, 35],
          [-115, 32],
          [-110, 33],
          [-108, 38],
          [-110, 40],
          [-115, 42],
          [-120, 38],
          [-120, 35]
        ]]
      }
    }
  ]
};

const CloudcastingMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxTokenInput, setMapboxTokenInput] = useState(MAPBOX_TOKEN);
  const [useCustomToken, setUseCustomToken] = useState(false);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Use the provided token or the default one
    const token = useCustomToken && mapboxTokenInput ? mapboxTokenInput : MAPBOX_TOKEN;
    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Changed to dark style
        center: [-122.4, 37.8], // Centered on San Francisco
        zoom: 11,
        projection: 'mercator'
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add cloud data source with properly typed data
        if (map.current) {
          map.current.addSource('clouds', {
            type: 'geojson',
            data: dummyCloudData
          });
          
          // Add cloud layer
          map.current.addLayer({
            id: 'clouds-fill',
            type: 'fill',
            source: 'clouds',
            paint: {
              'fill-color': '#93C5FD',
              'fill-opacity': ['get', 'density']
            }
          });
          
          map.current.addLayer({
            id: 'clouds-outline',
            type: 'line',
            source: 'clouds',
            paint: {
              'line-color': '#60A5FA',
              'line-width': 1
            }
          });
        }
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
    } catch (error) {
      console.error("Error initializing map:", error);
    }
    
    return () => {
      map.current?.remove();
    };
  }, [mapboxTokenInput, useCustomToken]);

  const handleCustomTokenChange = () => {
    setUseCustomToken(true);
  };

  return (
    <div className="flex flex-col h-full">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-500 rounded-full border-t-transparent mx-auto"></div>
            <p className="text-lg font-medium text-white">Loading Map...</p>
            
            {/* Token input option if default fails */}
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-300 mb-2">
                If the map doesn't load, you might need to provide a Mapbox token:
              </p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={mapboxTokenInput}
                  onChange={(e) => setMapboxTokenInput(e.target.value)}
                  className="flex h-9 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 flex-1 text-white"
                  placeholder="Enter Mapbox token"
                />
                <Button onClick={handleCustomTokenChange} variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                  Apply
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Get a token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">mapbox.com</a>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Map Container */}
      <div className="relative flex-grow">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 z-10 space-y-2">
          <Button variant="outline" size="icon" className="bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:bg-slate-700" onClick={() => map.current?.zoomIn()}>
            <ZoomIn className="h-4 w-4 text-white" />
          </Button>
          <Button variant="outline" size="icon" className="bg-slate-800/80 backdrop-blur-sm border-slate-700 hover:bg-slate-700" onClick={() => map.current?.zoomOut()}>
            <ZoomOut className="h-4 w-4 text-white" />
          </Button>
        </div>
        
        {/* Legend Panel */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-md shadow-md border border-slate-700">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <div className="w-5 h-2 bg-blue-700 rounded"></div>
                <span className="text-xs text-gray-300">-100</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-5 h-2 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-300">-75</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-5 h-2 bg-blue-400 rounded"></div>
                <span className="text-xs text-gray-300">-50</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-5 h-2 bg-blue-300 rounded"></div>
                <span className="text-xs text-gray-300">-25</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-5 h-2 bg-gray-400 rounded"></div>
                <span className="text-xs text-gray-300">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudcastingMap;
