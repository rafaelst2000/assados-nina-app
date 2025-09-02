import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { StockTab } from '@/components/StockTab';
import { SalesTab } from '@/components/SalesTab';
import { NewSaleTab } from '@/components/NewSaleTab';
import { useApp } from '@/contexts/AppContext';

const Index = () => {
  const { isLoading, activeTab, setActiveTab } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'stock':
        return <StockTab onUpdateStock={() => setActiveTab('sales')} />;
      case 'sales':
        return <SalesTab />;
      case 'new-sale':
        return <NewSaleTab />;
      default:
        return <StockTab />;
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <main className="h-[calc(100dvh-85px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100dvh-85px)]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        ) : (
          renderActiveTab()
        )}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
