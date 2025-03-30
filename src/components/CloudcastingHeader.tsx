
import React from 'react';
import { Cloud } from 'lucide-react';

const CloudcastingHeader: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-sky-dark to-sky-deeper text-white p-4 shadow-md">
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="h-8 w-8 text-cloud-light animate-float" />
            <div>
              <h1 className="text-2xl font-bold">Cloudcasting</h1>
              <p className="text-sm text-sky-light/80">Cloud Movement Visualization Prototype</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-sky-light/70">
              Visualizing satellite-derived cloud movement
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CloudcastingHeader;
