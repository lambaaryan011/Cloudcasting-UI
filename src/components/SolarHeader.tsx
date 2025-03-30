
import React from 'react';
import { Sun } from 'lucide-react';

const SolarHeader: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white p-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sun className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide">Quartz Solar</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                <li className="text-yellow-400 font-medium">PV Forecast</li>
                <li className="text-gray-400 hover:text-white transition-colors">Solar Sites</li>
                <li className="text-gray-400 hover:text-white transition-colors">Delts</li>
              </ul>
            </nav>
            <div className="bg-gray-700 rounded-full h-8 w-8"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SolarHeader;
