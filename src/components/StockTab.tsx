import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Package2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

export const StockTab: React.FC = () => {
  const { products, updateStock } = useApp();
  const [stockValues, setStockValues] = useState<Record<string, string>>(
    products.reduce((acc, product) => ({
      ...acc,
      [product.id]: product.stock.toString()
    }), {})
  );

  const handleStockChange = (productId: string, value: string) => {
    setStockValues(prev => ({ ...prev, [productId]: value }));
  };

  const handleSaveStock = () => {
    Object.entries(stockValues).forEach(([productId, value]) => {
      const quantity = parseInt(value) || 0;
      updateStock(productId, quantity);
    });
    
    toast({
      title: "Estoque atualizado!",
      description: "Todas as quantidades foram salvas com sucesso.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full shadow-warm">
          <Package2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Estoque dos Assados</h1>
        <p className="text-muted-foreground">Gerencie a quantidade de cada produto</p>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="bg-gradient-card shadow-soft border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                  {formatPrice(product.price)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={stockValues[product.id]}
                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                    className="bg-background/50 border-border focus:border-primary"
                    min="0"
                  />
                </div>
                <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                  Atual: <span className="font-semibold text-foreground">{product.stock}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        onClick={handleSaveStock}
        className="w-full bg-gradient-primary text-primary-foreground shadow-warm border-0 h-12 text-base font-semibold"
        size="lg"
      >
        <Save className="w-5 h-5 mr-2" />
        Salvar Estoque
      </Button>
    </div>
  );
};