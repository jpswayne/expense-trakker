import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, PieChart, Calendar, DollarSign } from 'lucide-react';
import { databaseService, Category } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

interface ExpenseSummaryProps {
  refreshTrigger: number;
}

interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
}

export function ExpenseSummary({ refreshTrigger }: ExpenseSummaryProps) {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSummaryData();
  }, [refreshTrigger]);

  const loadSummaryData = async () => {
    try {
      setIsLoading(true);
      const [total, monthly, categoryData] = await Promise.all([
        databaseService.getTotalExpenses(),
        databaseService.getExpensesByCurrentMonth(),
        databaseService.getCategoryExpenseSummary()
      ]);

      setTotalExpenses(total);
      
      const monthlyTotal = monthly.reduce((sum, expense) => sum + expense.amount, 0);
      setMonthlyExpenses(monthlyTotal);

      // Calculate percentages for categories
      const totalCategoryExpenses = categoryData.reduce((sum, item) => sum + item.total, 0);
      const summaryWithPercentages = categoryData
        .filter(item => item.total > 0)
        .map(item => ({
          ...item,
          percentage: totalCategoryExpenses > 0 ? (item.total / totalCategoryExpenses) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);

      setCategorySummary(summaryWithPercentages);
    } catch (error) {
      console.error('Error loading summary data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del resumen',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Gastos</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-expense">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Este Mes</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-expense">
                {formatCurrency(monthlyExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <PieChart className="h-5 w-5 text-primary" />
            Gastos por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categorySummary.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay datos de gastos por categoría</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorySummary.slice(0, 6).map((item) => (
                <div key={item.category.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${item.category.color}20` }}
                    >
                      {item.category.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {item.category.name}
                      </span>
                      <span className="text-sm font-semibold text-expense">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor: item.category.color
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}