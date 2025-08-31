import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Clock, CheckCircle2, Trash2, User, Package } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

export const SalesTab: React.FC = () => {
  const { sales, products, updateSale, deleteSale } = useApp();

  const handleMarkAsCollected = (saleId: string) => {
    updateSale(saleId, { isCollected: true });
    toast({
      title: "Pedido coletado!",
      description: "O status foi atualizado com sucesso.",
    });
  };

  const handleDeleteSale = (saleId: string) => {
    deleteSale(saleId);
    toast({
      title: "Venda deletada!",
      description: "A venda foi removida e o estoque foi restaurado.",
      variant: "destructive",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produto não encontrado';
  };

  const reservations = sales.filter(sale => sale.isReservation);
  const regularSales = sales.filter(sale => !sale.isReservation);

  const getTotalStock = () => {
    return products.reduce((total, product) => total + product.stock, 0);
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full shadow-warm">
          <ShoppingCart className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Vendas</h1>
        <p className="text-muted-foreground">Acompanhe vendas, reservas e estoque</p>
      </div>

      {/* Stock Overview */}
      <Card className="bg-gradient-card shadow-soft border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="w-5 h-5" />
            Estoque Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-2 bg-background/30 rounded-lg">
                <span className="text-sm font-medium text-foreground">{product.name}</span>
                <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-xs">
                  {product.stock}
                </Badge>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Total em Estoque:</span>
            <Badge variant="outline" className="bg-accent/20 text-accent-foreground">
              {getTotalStock()} unidades
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reservations */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Reservas ({reservations.length})
        </h2>
        
        {reservations.length === 0 ? (
          <Card className="bg-gradient-card shadow-soft border-border/50">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
            </CardContent>
          </Card>
        ) : (
          reservations.map((sale) => (
            <Card key={sale.id} className="bg-gradient-card shadow-soft border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base text-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {sale.customerName || 'Cliente sem nome'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(sale.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={sale.isPaid ? "default" : "secondary"}>
                      {sale.isPaid ? 'Pago' : 'Não Pago'}
                    </Badge>
                    {sale.isCollected && (
                      <Badge variant="outline" className="bg-success/20 text-success-foreground">
                        Coletado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-1">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-foreground">{getProductName(item.productId)} x{item.quantity}</span>
                      <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary">
                      {sale.isPromotion && sale.promotionPrice 
                        ? formatPrice(sale.promotionPrice)
                        : formatPrice(sale.total)
                      }
                    </span>
                  </div>
                  {sale.isPromotion && (
                    <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
                      Promoção
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!sale.isCollected && (
                    <Button
                      onClick={() => handleMarkAsCollected(sale.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Marcar como Coletado
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteSale(sale.id)}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Regular Sales */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          Vendas Diretas ({regularSales.length})
        </h2>
        
        {regularSales.length === 0 ? (
          <Card className="bg-gradient-card shadow-soft border-border/50">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma venda direta encontrada</p>
            </CardContent>
          </Card>
        ) : (
          regularSales.map((sale) => (
            <Card key={sale.id} className="bg-gradient-card shadow-soft border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base text-foreground">Venda Direta</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatDate(sale.createdAt)}</p>
                  </div>
                  <Badge variant="default">Concluída</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-1">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-foreground">{getProductName(item.productId)} x{item.quantity}</span>
                      <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary">
                      {sale.isPromotion && sale.promotionPrice 
                        ? formatPrice(sale.promotionPrice)
                        : formatPrice(sale.total)
                      }
                    </span>
                  </div>
                  {sale.isPromotion && (
                    <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
                      Promoção
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={() => handleDeleteSale(sale.id)}
                  size="sm"
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Deletar Venda
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};