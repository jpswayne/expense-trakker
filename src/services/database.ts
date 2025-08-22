import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface Expense {
  id?: number;
  amount: number;
  description: string;
  category_id: number;
  date: string;
  created_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon: string;
  created_at?: string;
}

class DatabaseService {
  private sqliteConnection: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly dbName = 'expense_tracker.db';

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDatabase(): Promise<void> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        await this.sqliteConnection.initWebStore();
      }

      this.db = await this.sqliteConnection.createConnection(
        this.dbName,
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();
      await this.createTables();
      await this.insertDefaultCategories();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createExpensesTable = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `;

    await this.db.execute(createCategoriesTable);
    await this.db.execute(createExpensesTable);
  }

  private async insertDefaultCategories(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const checkCategories = await this.db.query('SELECT COUNT(*) as count FROM categories');
    if (checkCategories.values && checkCategories.values[0].count === 0) {
      const defaultCategories = [
        { name: 'Alimentación', color: '#ff6b6b', icon: '🍕' },
        { name: 'Transporte', color: '#4ecdc4', icon: '🚗' },
        { name: 'Entretenimiento', color: '#45b7d1', icon: '🎬' },
        { name: 'Salud', color: '#96ceb4', icon: '🏥' },
        { name: 'Compras', color: '#feca57', icon: '🛒' },
        { name: 'Hogar', color: '#ff9ff3', icon: '🏠' },
        { name: 'Educación', color: '#54a0ff', icon: '📚' },
        { name: 'Otros', color: '#ddd', icon: '📦' }
      ];

      for (const category of defaultCategories) {
        await this.db.run(
          'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
          [category.name, category.color, category.icon]
        );
      }
    }
  }

  async getCategories(): Promise<Category[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT * FROM categories ORDER BY name');
    return result.values || [];
  }

  async addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
      [category.name, category.color, category.icon]
    );
    
    return result.changes?.lastId || 0;
  }

  async getExpenses(limit?: number): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = limit 
      ? 'SELECT * FROM expenses ORDER BY date DESC, created_at DESC LIMIT ?'
      : 'SELECT * FROM expenses ORDER BY date DESC, created_at DESC';
    
    const params = limit ? [limit] : undefined;
    const result = await this.db.query(query, params);
    return result.values || [];
  }

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO expenses (amount, description, category_id, date) VALUES (?, ?, ?, ?)',
      [expense.amount, expense.description, expense.category_id, expense.date]
    );
    
    return result.changes?.lastId || 0;
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query(
      'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );
    return result.values || [];
  }

  async getExpensesByCategory(categoryId: number): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query(
      'SELECT * FROM expenses WHERE category_id = ? ORDER BY date DESC',
      [categoryId]
    );
    return result.values || [];
  }

  async getTotalExpenses(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query('SELECT SUM(amount) as total FROM expenses');
    return result.values?.[0]?.total || 0;
  }

  async getExpensesByCurrentMonth(): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const startDate = firstDayOfMonth.toISOString().split('T')[0];
    const endDate = lastDayOfMonth.toISOString().split('T')[0];
    
    return this.getExpensesByDateRange(startDate, endDate);
  }

  async getCategoryExpenseSummary(): Promise<Array<{category: Category; total: number}>> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.query(`
      SELECT 
        c.id, c.name, c.color, c.icon,
        COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY total DESC
    `);
    
    return (result.values || []).map((row: any) => ({
      category: {
        id: row.id,
        name: row.name,
        color: row.color,
        icon: row.icon
      },
      total: row.total || 0
    }));
  }
}

export const databaseService = new DatabaseService();