import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product, Sale, SaleItem } from '@/types';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  updateStock: (productId: string, quantity: number) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSale: (saleId: string, updates: Partial<Sale>) => void;
  deleteSale: (saleId: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const initialProducts: Product[] = [
  { id: '1', name: 'Frango', price: 50, stock: 0 },
  { id: '2', name: 'Sobrecoxa', price: 5, stock: 0 },
  { id: '3', name: 'Linguiça', price: 4, stock: 0 },
  { id: '4', name: 'Carne', price: 60, stock: 0 },
  { id: '5', name: 'Costela', price: 55, stock: 0 },
  { id: '6', name: 'Maionese', price: 7, stock: 0 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>([]);

  const updateStock = (productId: string, quantity: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, stock: quantity }
          : product
      )
    );
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    // Update stock for sold items
    saleData.items.forEach(item => {
      setProducts(prev => 
        prev.map(product => 
          product.id === item.productId 
            ? { ...product, stock: Math.max(0, product.stock - item.quantity) }
            : product
        )
      );
    });

    setSales(prev => [newSale, ...prev]);
  };

  const updateSale = (saleId: string, updates: Partial<Sale>) => {
    setSales(prev => 
      prev.map(sale => 
        sale.id === saleId 
          ? { ...sale, ...updates }
          : sale
      )
    );
  };

  const deleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      // Restore stock
      sale.items.forEach(item => {
        setProducts(prev => 
          prev.map(product => 
            product.id === item.productId 
              ? { ...product, stock: product.stock + item.quantity }
              : product
          )
        );
      });
      setSales(prev => prev.filter(s => s.id !== saleId));
    }
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  return (
    <AppContext.Provider value={{
      products,
      sales,
      updateStock,
      addSale,
      updateSale,
      deleteSale,
      getProductById
    }}>
      {children}
    </AppContext.Provider>
  );
};