
import React from 'react';
import CloudcastingHeader from '@/components/CloudcastingHeader';
import CloudcastingMap from '@/components/CloudcastingMap';

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-cloud-light">
      <CloudcastingHeader />
      <main className="flex-grow">
        <CloudcastingMap />
      </main>
      <footer className="bg-white py-2 text-center text-xs text-muted-foreground border-t border-cloud-border">
        <p>Cloudcasting UI Prototype • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
