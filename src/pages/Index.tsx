import { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/MobileHeader';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpensesList } from '@/components/ExpensesList';
import { ExpenseSummary } from '@/components/ExpenseSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { databaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, BarChart3, List } from 'lucide-react';

const Index = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('summary');
  const { toast } = useToast();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await databaseService.initializeDatabase();
      setIsDbInitialized(true);
      toast({
        title: 'Aplicación lista',
        description: 'La base de datos se ha inicializado correctamente',
      });
    } catch (error) {
      console.error('Error initializing app:', error);
      toast({
        title: 'Error de inicialización',
        description: 'No se pudo inicializar la aplicación. Por favor recarga la página.',
        variant: 'destructive'
      });
    }
  };

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list'); // Switch to list tab after adding expense
  };

  if (!isDbInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Inicializando aplicación
            </h2>
            <p className="text-muted-foreground">
              Configurando tu aplicación de control de gastos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-md p-4 space-y-6">
        <header>
          <MobileHeader />
        </header>

        <section>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <ExpenseSummary refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="add" className="space-y-6">
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              <ExpensesList refreshTrigger={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </section>

        <footer className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Control de Gastos - Gestiona tus finanzas de manera inteligente
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Index;