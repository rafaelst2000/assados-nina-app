import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { StockTab } from '@/components/StockTab';
import { SalesTab } from '@/components/SalesTab';
import { NewSaleTab } from '@/components/NewSaleTab';
import { useApp } from '@/contexts/AppContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const { hasStockAvailable, isLoading } = useApp();

  // Verificar se há estoque disponível e redirecionar para vendas
  useEffect(() => {
    if (!isLoading && hasStockAvailable()) {
      setActiveTab('sales');
    }
  }, [hasStockAvailable, isLoading]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'stock':
        return <StockTab />;
      case 'sales':
        return <SalesTab />;
      case 'new-sale':
        return hasStockAvailable() ? <NewSaleTab /> : <StockTab />;
      default:
        return <StockTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
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
