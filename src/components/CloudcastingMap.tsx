
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, Info, ZoomIn, ZoomOut } from 'lucide-react';

// Replace with your Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZXRva2VuIiwiYSI6ImNsdDBhdWNoZzA2cmMyanA3NnUzajZmNnMifQ.OQsI21JrQfewDBBdnM-bUQ';

// Dummy cloud data (GeoJSON polygon)
const dummyCloudData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'cloud1', density: 0.7 },
      geometry: {
        type: 'Polygon',
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
      type: 'Feature',
      properties: { id: 'cloud2', density: 0.5 },
      geometry: {
        type: 'Polygon',
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
  const [timeValue, setTimeValue] = useState([50]);
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
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98, 39], // Center on US
        zoom: 3.5,
        projection: 'mercator'
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add cloud data source
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
              'fill-color': 'white',
              'fill-opacity': ['get', 'density']
            }
          });
          
          map.current.addLayer({
            id: 'clouds-outline',
            type: 'line',
            source: 'clouds',
            paint: {
              'line-color': '#c9e0f7',
              'line-width': 2
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
  
  // Update cloud appearance based on time slider
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Simulate cloud movement/density changes over time
    const timePercent = timeValue[0] / 100;
    const opacity = 0.3 + (timePercent * 0.7); // Varies between 0.3 and 1.0
    
    // Update the features in the GeoJSON to simulate movement
    const updatedClouds = {
      ...dummyCloudData,
      features: dummyCloudData.features.map(feature => {
        // For each cloud, shift its position slightly based on the time
        const coords = feature.geometry.coordinates[0].map(coord => [
          coord[0] + (timePercent - 0.5) * 3, // Shift east/west
          coord[1] + Math.sin(timePercent * Math.PI) * 1 // Shift with a sine wave pattern
        ]);
        
        return {
          ...feature,
          properties: {
            ...feature.properties,
            density: feature.properties.density * (0.7 + timePercent * 0.3) // Adjust density
          },
          geometry: {
            ...feature.geometry,
            coordinates: [coords]
          }
        };
      })
    };
    
    // Update the source data
    const source = map.current.getSource('clouds') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(updatedClouds);
    }
    
  }, [timeValue, mapLoaded]);

  const zoomIn = () => {
    map.current?.zoomIn();
  };

  const zoomOut = () => {
    map.current?.zoomOut();
  };

  const refreshData = () => {
    // In a real app, this would fetch fresh cloud data
    const source = map.current?.getSource('clouds') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(dummyCloudData);
    }
    setTimeValue([50]); // Reset time slider
  };

  const handleCustomTokenChange = () => {
    setUseCustomToken(true);
  };

  return (
    <div className="flex flex-col h-full">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-sky-dark rounded-full border-t-transparent mx-auto"></div>
            <p className="text-lg font-medium">Loading Map...</p>
            
            {/* Token input option if default fails */}
            <div className="max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-2">
                If the map doesn't load, you might need to provide a Mapbox token:
              </p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={mapboxTokenInput}
                  onChange={(e) => setMapboxTokenInput(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                  placeholder="Enter Mapbox token"
                />
                <Button onClick={handleCustomTokenChange}>
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Get a token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main UI Layout */}
      <div className="relative flex flex-col h-full">
        {/* Map Container */}
        <div className="relative flex-grow">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10 space-y-2">
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Info Panel */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md border border-border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Info className="h-4 w-4" />
                <span>Cloud Density</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-white/30"></div>
                <span className="text-xs">Low</span>
                <div className="h-3 w-3 rounded-full bg-white/60"></div>
                <span className="text-xs">Medium</span>
                <div className="h-3 w-3 rounded-full bg-white/90"></div>
                <span className="text-xs">High</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Control Panel */}
        <div className="bg-sky-light p-4 border-t border-cloud-border">
          <div className="container max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0">
                <h2 className="text-lg font-semibold text-sky-deeper">Cloud Simulation</h2>
                <p className="text-sm text-muted-foreground">Adjust time to visualize cloud movement</p>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Past</span>
                  <Slider 
                    value={timeValue} 
                    onValueChange={setTimeValue}
                    className="flex-grow"
                    max={100}
                    step={1}
                  />
                  <span className="text-sm font-medium">Future</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="sm:flex-shrink-0 bg-background"
                onClick={refreshData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudcastingMap;
