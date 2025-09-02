import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product, Sale, SaleItem } from '@/types';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  isLoading: boolean;
  updateStock: (productId: string, quantity: number) => void;
  updateAllStock: (stockUpdates: { productId: string; quantity: number }[]) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSale: (saleId: string, updates: Partial<Sale>) => void;
  deleteSale: (saleId: string) => void;
  getProductById: (id: string) => Product | undefined;
  loadProductsFromFirebase: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock');

  const updateStock = (productId: string, quantity: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, stock: quantity }
          : product
      )
    );
  };

  const updateAllStock = async (stockUpdates: { productId: string; quantity: number }[]) => {
    setProducts(prev => 
      prev.map(product => {
        const update = stockUpdates.find(u => u.productId === product.id);
        return update ? { ...product, stock: update.quantity } : product;
      })
    );
    await setDoc(doc(db, 'products', 'items'), { items: stockUpdates });
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

  const loadProductsFromFirebase = async () => {
    setIsLoading(true);
    try {
      console.log('Carregando produtos do Firebase...');
      const docRef = doc(db, 'products', 'items');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const items = data.items as Product[]
        if (items && Array.isArray(items)) {
          const products = initialProducts.map((product, index) => ({
            ...product,
            stock: data.items[index].quantity
          }))
          setProducts(products);
          setActiveTab('sales');
        } else {
          setProducts(initialProducts);
        }
      } else {
        setProducts(initialProducts);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do Firebase:', error);
      console.log('Usando produtos iniciais devido ao erro');
      setProducts(initialProducts);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar produtos do Firebase na inicialização
  useEffect(() => {
    loadProductsFromFirebase();
  }, []);

  return (
    <AppContext.Provider value={{
      products,
      sales,
      isLoading,
      updateStock,
      updateAllStock,
      addSale,
      updateSale,
      deleteSale,
      getProductById,
      loadProductsFromFirebase,
      activeTab,
      setActiveTab
    }}>
      {children}
    </AppContext.Provider>
  );
};