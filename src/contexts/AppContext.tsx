import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product, Sale, SaleItem } from '@/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  isLoading: boolean;
  firebaseConnected: boolean;
  updateStock: (productId: string, quantity: number) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updateSale: (saleId: string, updates: Partial<Sale>) => void;
  deleteSale: (saleId: string) => void;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveProductsToFirebase: () => Promise<void>;
  hasStockAvailable: () => boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Função para salvar produtos no Firebase
  const saveProductsToFirebase = useCallback(async () => {
    try {
      const productsRef = collection(db, 'products');
      
      for (const product of products) {
        await setDoc(doc(productsRef, product.id), {
          name: product.name,
          price: product.price,
          stock: product.stock
        });
      }
      console.log('Produtos salvos no Firebase com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar produtos no Firebase:', error);
    }
  }, [products]);

  // Carregar produtos do Firebase na inicialização
  useEffect(() => {
    const loadProductsFromFirebase = async () => {
      try {
        console.log('Tentando conectar ao Firebase...');
        setIsLoading(true);
        
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(productsRef);
        
        setFirebaseConnected(true);
        console.log('Firebase conectado com sucesso!');
        
        if (!querySnapshot.empty) {
          const loadedProducts: Product[] = [];
          querySnapshot.forEach((doc) => {
            loadedProducts.push({ id: doc.id, ...doc.data() } as Product);
          });
          console.log('Produtos carregados do Firebase:', loadedProducts.length);
          setProducts(loadedProducts);
        } else {
          console.log('Nenhum produto no Firebase, usando produtos iniciais');
          setProducts(initialProducts);
        }
      } catch (error) {
        console.error('Erro ao conectar ao Firebase:', error);
        setFirebaseConnected(false);
        setProducts(initialProducts);
      } finally {
        setIsLoading(false);
      }
    };

    // Tentar conectar ao Firebase em background
    loadProductsFromFirebase();
  }, []);

  // Função para adicionar produto
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };

    // Adicionar localmente primeiro
    setProducts(prev => [...prev, newProduct]);

    // Tentar salvar no Firebase se conectado
    if (firebaseConnected) {
      try {
        const productsRef = collection(db, 'products');
        await setDoc(doc(productsRef, newProduct.id), {
          name: newProduct.name,
          price: newProduct.price,
          stock: newProduct.stock
        });
        console.log('Produto salvo no Firebase');
      } catch (error) {
        console.error('Erro ao salvar produto no Firebase:', error);
      }
    }
  };

  // Função para atualizar produto
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    // Atualizar localmente primeiro
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, ...updates }
          : product
      )
    );

    // Tentar atualizar no Firebase se conectado
    if (firebaseConnected) {
      try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, updates);
        console.log('Produto atualizado no Firebase');
      } catch (error) {
        console.error('Erro ao atualizar produto no Firebase:', error);
      }
    }
  };

  // Função para deletar produto
  const deleteProduct = async (productId: string) => {
    // Deletar localmente primeiro
    setProducts(prev => prev.filter(product => product.id !== productId));

    // Tentar deletar no Firebase se conectado
    if (firebaseConnected) {
      try {
        const productRef = doc(db, 'products', productId);
        await deleteDoc(productRef);
        console.log('Produto deletado no Firebase');
      } catch (error) {
        console.error('Erro ao deletar produto no Firebase:', error);
      }
    }
  };

  const updateStock = (productId: string, quantity: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, stock: quantity }
          : product
      )
    );
    
    // Atualizar no Firebase também
    updateProduct(productId, { stock: quantity });
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

  const hasStockAvailable = () => {
    return products.some(product => product.stock > 0);
  };

  return (
    <AppContext.Provider value={{
      products,
      sales,
      isLoading,
      firebaseConnected,
      updateStock,
      addSale,
      updateSale,
      deleteSale,
      getProductById,
      addProduct,
      updateProduct,
      deleteProduct,
      saveProductsToFirebase,
      hasStockAvailable,
    }}>
      {children}
    </AppContext.Provider>
  );
};