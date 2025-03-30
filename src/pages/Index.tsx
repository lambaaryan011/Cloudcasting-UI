
import React from 'react';
import SolarHeader from '@/components/SolarHeader';
import RegionHeader from '@/components/RegionHeader';
import CloudcastingMap from '@/components/CloudcastingMap';
import SolarForecastChart from '@/components/SolarForecastChart';

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <SolarHeader />
      <RegionHeader />
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-132px)]">
        <div className="h-full overflow-hidden border-r border-slate-800">
          <SolarForecastChart />
        </div>
        <div className="h-full">
          <CloudcastingMap />
        </div>
      </main>
      <footer className="bg-slate-900 py-1 text-center text-xs text-gray-500 border-t border-slate-800">
        <p>Cloudcasting UI Dashboard • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
