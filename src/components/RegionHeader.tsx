
import React from 'react';

const RegionHeader: React.FC = () => {
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(currentDate);

  return (
    <div className="bg-slate-800 text-white p-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-2xl font-bold mb-2 md:mb-0">National</div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="text-xl font-semibold">
                <span className="text-yellow-400">5.4</span>/
                <span className="text-blue-400">5.3</span>
                <span className="text-xs text-gray-400 ml-1">21:30</span>
              </div>
              
              <div className="text-xl font-semibold">
                <span className="text-yellow-400">4.1</span>
                <span className="text-xs text-gray-400 ml-1">21:30</span>
              </div>
              
              <div className="bg-yellow-500 rounded-full h-10 w-10 flex items-center justify-center">
                <Sun className="h-6 w-6 text-black" />
              </div>
            </div>
            
            <div className="text-right text-lg">{formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionHeader;

// We need to import the Sun icon
import { Sun } from 'lucide-react';
