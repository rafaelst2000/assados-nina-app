import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { StockTab } from '@/components/StockTab';
import { SalesTab } from '@/components/SalesTab';
import { NewSaleTab } from '@/components/NewSaleTab';

const Index = () => {
  const [activeTab, setActiveTab] = useState('stock');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'stock':
        return <StockTab />;
      case 'sales':
        return <SalesTab />;
      case 'new-sale':
        return <NewSaleTab />;
      default:
        return <StockTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen">
        {renderActiveTab()}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
