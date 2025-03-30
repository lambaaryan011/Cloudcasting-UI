
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Info, ZoomIn, ZoomOut } from 'lucide-react';
import { chartEvents } from './SolarForecastChart';

// Replace with your Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZmxvd2lydHoiLCJhIjoiY2tlcGhtMnFnMWRzajJ2bzhmdGs5ZXVveSJ9.Dq5iSpi54SaajfdMyM_8fQ';

// Define correct GeoJSON types
interface CloudFeature {
  type: "Feature";
  properties: {
    id: string;
    density: number;
    name?: string;
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

// Enhanced cloud data with names for locations
const dummyCloudData: CloudCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: 'cloud1', density: 0.7, name: "Midwest Region" },
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
      properties: { id: 'cloud2', density: 0.5, name: "Western Region" },
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
    },
    {
      type: "Feature",
      properties: { id: 'cloud3', density: 0.3, name: "Eastern Region" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-80, 38],
          [-75, 36],
          [-70, 39],
          [-72, 43],
          [-78, 44],
          [-80, 38]
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
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Use the provided token or the default one
    const token = useCustomToken && mapboxTokenInput ? mapboxTokenInput : MAPBOX_TOKEN;
    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-95, 40], // Centered on USA
        zoom: 3,
        projection: 'mercator'
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        
        if (!map.current) return;
        
        // Add cloud data source
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
        
        // Add clickable regions to make the map interactive
        map.current.addLayer({
          id: 'clouds-click',
          type: 'fill',
          source: 'clouds',
          paint: {
            'fill-color': '#ffffff',
            'fill-opacity': 0  // Transparent but clickable
          }
        });
        
        // Add city markers to make more click targets
        const cities = [
          { lngLat: [-74.0060, 40.7128], id: 'nyc', name: 'New York City' },
          { lngLat: [-87.6298, 41.8781], id: 'chicago', name: 'Chicago' },
          { lngLat: [-122.4194, 37.7749], id: 'sf', name: 'San Francisco' },
          { lngLat: [-104.9903, 39.7392], id: 'denver', name: 'Denver' },
          { lngLat: [-95.3698, 29.7604], id: 'houston', name: 'Houston' },
          { lngLat: [-84.3880, 33.7490], id: 'atlanta', name: 'Atlanta' },
        ];
        
        // Add markers for the cities
        cities.forEach(city => {
          const el = document.createElement('div');
          el.className = 'city-marker';
          el.style.width = '10px';
          el.style.height = '10px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#FFCA28';
          
          const marker = new mapboxgl.Marker(el)
            .setLngLat(city.lngLat)
            .addTo(map.current!);
            
          // Add click handler to the marker element
          el.addEventListener('click', () => {
            setSelectedFeature(city.id);
            chartEvents.publish({
              id: city.id,
              name: city.name,
              coordinates: city.lngLat
            });
          });
        });
        
        // Handle clicks on the clouds
        map.current.on('click', 'clouds-click', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const featureId = feature.properties.id;
            const featureName = feature.properties.name;
            
            setSelectedFeature(featureId);
            
            // Publish the event to update the chart
            chartEvents.publish({
              id: featureId,
              name: featureName,
              coordinates: e.lngLat
            });
          }
        });
        
        // Change cursor when hovering over clickable areas
        map.current.on('mouseenter', 'clouds-click', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        });
        
        map.current.on('mouseleave', 'clouds-click', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });
        
        // Click anywhere on map to update chart
        map.current.on('click', (e) => {
          // Get the features at the clicked point
          const features = map.current?.queryRenderedFeatures(e.point, { 
            layers: ['clouds-click'] 
          });
          
          // If we didn't click on a cloud feature, still update the chart with a random ID
          if (!features || features.length === 0) {
            const randomId = `pos-${e.lngLat.lng.toFixed(2)}-${e.lngLat.lat.toFixed(2)}`;
            setSelectedFeature(randomId);
            
            chartEvents.publish({
              id: randomId,
              name: `Location (${e.lngLat.lng.toFixed(1)}, ${e.lngLat.lat.toFixed(1)})`,
              coordinates: e.lngLat
            });
          }
        });
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
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
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
                  className="flex h-9 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 flex-1 text-white"
                  placeholder="Enter Mapbox token"
                />
                <Button onClick={handleCustomTokenChange} variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10">
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
        
        {/* Instructions Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur-sm p-2 rounded-md border border-slate-700 text-xs text-white">
          Click on the map to update the forecast chart
        </div>
        
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
