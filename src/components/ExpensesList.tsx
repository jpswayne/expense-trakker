import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Receipt, Trash2 } from 'lucide-react';
import { databaseService, Expense, Category } from '@/services/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExpensesListProps {
  refreshTrigger: number;
}

export function ExpensesList({ refreshTrigger }: ExpensesListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        databaseService.getExpenses(20), // Load last 20 expenses
        databaseService.getCategories()
      ]);
      
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los gastos',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryById = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            Gastos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Receipt className="h-5 w-5 text-primary" />
          Gastos Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay gastos registrados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Agrega tu primer gasto usando el formulario
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {expenses.map((expense) => {
                const category = getCategoryById(expense.category_id);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          {category?.icon || '📦'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {expense.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${category?.color}15`,
                              color: category?.color
                            }}
                          >
                            {category?.name}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {formatDate(expense.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-expense">
                        -{formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}