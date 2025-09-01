import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ShoppingCart, User, Percent } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { SaleItem } from '@/types';


export const NewSaleTab: React.FC = () => {
  const { products, addSale } = useApp();
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [isReservation, setIsReservation] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isPromotion, setIsPromotion] = useState(false);
  const [promotionPrice, setPromotionPrice] = useState('');

  const handleQuantityChange = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQuantity = selectedItems[productId] || 0;
    const newQuantity = Math.max(0, Math.min(product.stock, currentQuantity + change));
    
    if (newQuantity === 0) {
      const newItems = { ...selectedItems };
      delete newItems[productId];
      setSelectedItems(newItems);
    } else {
      setSelectedItems(prev => ({ ...prev, [productId]: newQuantity }));
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleCreateSale = () => {
    if (Object.keys(selectedItems).length === 0) {
      return;
    }

    if (isReservation && !customerName.trim()) {
      return;
    }

    const items: SaleItem[] = Object.entries(selectedItems).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId)!;
      return {
        productId,
        quantity,
        price: product.price,
      };
    });

    const total = calculateTotal();
    const finalPromotionPrice = isPromotion && promotionPrice ? parseFloat(promotionPrice) : undefined;

    addSale({
      customerName: isReservation ? customerName : undefined,
      items,
      total,
      isReservation,
      isPaid,
      isCollected: false,
      isPromotion,
      promotionPrice: finalPromotionPrice,
    });

    // Reset form
    setSelectedItems({});
    setCustomerName('');
    setIsReservation(false);
    setIsPaid(false);
    setIsPromotion(false);
    setPromotionPrice('');
  };

  const selectedProductIds = Object.keys(selectedItems);
  const finalTotal = isPromotion && promotionPrice ? parseFloat(promotionPrice) || calculateTotal() : calculateTotal();

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full shadow-warm">
          <Plus className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Nova Venda</h1>
        <p className="text-muted-foreground">Registre uma nova venda ou reserva</p>
      </div>

      {/* Product Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Selecionar Produtos</h2>
        <div className="grid gap-3">
          {products.map((product) => {
            const selectedQuantity = selectedItems[product.id] || 0;
            const isOutOfStock = product.stock === 0;
            
            return (
              <Card key={product.id} className={`bg-gradient-card shadow-soft border-border/50 ${isOutOfStock ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-xs">
                          {formatPrice(product.price)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {product.stock} unidades
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={selectedQuantity === 0 || isOutOfStock}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="min-w-[40px] text-center font-semibold text-foreground">
                        {selectedQuantity}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={selectedQuantity >= product.stock || isOutOfStock}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sale Configuration */}
      <Card className="bg-gradient-card shadow-soft border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Configurações da Venda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reservation-toggle" className="text-foreground">É uma reserva?</Label>
            <Switch
              id="reservation-toggle"
              checked={isReservation}
              onCheckedChange={setIsReservation}
            />
          </div>

          {isReservation && (
            <div className="space-y-2">
              <Label htmlFor="customer-name" className="text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome do Cliente
              </Label>
              <Input
                id="customer-name"
                placeholder="Digite o nome do cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-background/50 border-border focus:border-primary"
              />
            </div>
          )}

          {isReservation && (
            <div className="flex items-center justify-between">
              <Label htmlFor="paid-toggle" className="text-foreground">Já está pago?</Label>
              <Switch
                id="paid-toggle"
                checked={isPaid}
                onCheckedChange={setIsPaid}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="promotion-toggle" className="text-foreground flex items-center gap-2">
              <Percent className="w-4 h-4" />
              É uma promoção?
            </Label>
            <Switch
              id="promotion-toggle"
              checked={isPromotion}
              onCheckedChange={setIsPromotion}
            />
          </div>

          {isPromotion && (
            <div className="space-y-2">
              <Label htmlFor="promotion-price" className="text-foreground">Preço promocional</Label>
              <Input
                id="promotion-price"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={promotionPrice}
                onChange={(e) => setPromotionPrice(e.target.value)}
                className="bg-background/50 border-border focus:border-primary"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      {selectedProductIds.length > 0 && (
        <Card className="bg-gradient-card shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedProductIds.map(productId => {
              const product = products.find(p => p.id === productId)!;
              const quantity = selectedItems[productId];
              const itemTotal = product.price * quantity;
              
              return (
                <div key={productId} className="flex justify-between items-center">
                  <span className="text-foreground">{product.name} x{quantity}</span>
                  <span className="text-muted-foreground">{formatPrice(itemTotal)}</span>
                </div>
              );
            })}
            
            <Separator />
            <div className="flex justify-between items-center font-semibold text-lg">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">{formatPrice(finalTotal)}</span>
            </div>
            
            {isPromotion && promotionPrice && (
              <div className="text-sm text-muted-foreground">
                Valor original: {formatPrice(calculateTotal())}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button 
        onClick={handleCreateSale}
        disabled={selectedProductIds.length === 0}
        className="w-full bg-gradient-primary text-primary-foreground shadow-warm border-0 h-12 text-base font-semibold"
        size="lg"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        {isReservation ? 'Criar Reserva' : 'Finalizar Venda'}
      </Button>
    </div>
  );
};