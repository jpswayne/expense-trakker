import { Card } from '@/components/ui/card';
import { Wallet, TrendingDown } from 'lucide-react';

export function MobileHeader() {
  return (
    <Card className="bg-gradient-primary shadow-primary border-none">
      <div className="p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Wallet className="h-8 w-8 text-primary-foreground" />
          <h1 className="text-2xl font-bold text-primary-foreground">
            Control de Gastos
          </h1>
        </div>
        <p className="text-primary-foreground/90 text-sm">
          Gestiona tus finanzas de manera inteligente
        </p>
      </div>
    </Card>
  );
}