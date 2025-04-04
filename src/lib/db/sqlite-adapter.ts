
// This is a simplified SQLite adapter that works without native compilation
// We'll simulate SQLite functionality using localStorage for browser compatibility

import { updateStorageStatus } from './storage-status';

let db: any = null;
const tables: Record<string, Array<any>> = {};

// Initialize SQLite database
export const initializeSqlite = async () => {
  try {
    console.log("DB: Initializing SQLite database (browser compatible version)");
    
    // Create tables
    tables.users = [];
    tables.domains = [];
    tables.files = [];
    tables.notes = [];
    tables.seo_analysis = [];
    
    // Try to load existing data from localStorage
    try {
      const storedTables = localStorage.getItem('sqlite_tables');
      if (storedTables) {
        Object.assign(tables, JSON.parse(storedTables));
        console.log("DB: Loaded tables from localStorage");
      }
    } catch (e) {
      console.warn("DB: Could not load stored tables", e);
    }
    
    console.log("DB: SQLite database initialized successfully");
    
    // Set our mock DB
    db = {
      exec: (sql: string) => console.log("DB: Executing SQL:", sql),
      prepare: () => ({
        all: () => [],
        get: () => null,
        run: () => ({ changes: 0, lastInsertRowid: 0 })
      }),
      close: () => console.log("DB: Closing database")
    };
    
    // Mark as initialized
    updateStorageStatus({
      initialized: true,
      error: null,
      usingExternalDb: false,
      installed: true
    });
    
    return true;
  } catch (error) {
    console.error("DB: Failed to initialize SQLite database:", error);
    updateStorageStatus({
      error: error instanceof Error ? error.message : "Unknown error",
      initialized: false
    });
    throw error;
  }
};

// Periodically save tables to localStorage
const saveTablesDebounced = (() => {
  let timeoutId: number | null = null;
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('sqlite_tables', JSON.stringify(tables));
        console.log("DB: Saved tables to localStorage");
      } catch (e) {
        console.warn("DB: Could not save tables to localStorage", e);
      }
    }, 500) as unknown as number;
  };
})();

// Get database instance
export const getSqliteDb = () => db;

// Collection-like interface for SQLite to maintain API compatibility
export const getCollection = (tableName: string) => {
  if (!db) {
    console.warn("DB: SQLite connection not initialized");
    return null;
  }
  
  // Create table if it doesn't exist
  if (!tables[tableName]) {
    tables[tableName] = [];
  }
  
  return {
    find: () => ({ 
      toArray: async () => {
        try {
          return [...tables[tableName]];
        } catch (error) {
          console.error(`DB: Error querying ${tableName}:`, error);
          return [];
        }
      }
    }),
    findOne: async (filter: any) => {
      try {
        const keys = Object.keys(filter);
        if (keys.length === 0) return null;
        
        return tables[tableName].find(item => {
          return keys.every(key => item[key] === filter[key]);
        }) || null;
      } catch (error) {
        console.error(`DB: Error finding in ${tableName}:`, error);
        return null;
      }
    },
    insertOne: async (doc: any) => {
      try {
        tables[tableName].push(doc);
        saveTablesDebounced();
        return { insertedId: doc.id };
      } catch (error) {
        console.error(`DB: Error inserting into ${tableName}:`, error);
        throw error;
      }
    },
    updateOne: async (filter: any, update: any) => {
      try {
        const filterKeys = Object.keys(filter);
        if (filterKeys.length === 0) throw new Error("Update filter cannot be empty");
        
        const updateData = update.$set || update;
        const index = tables[tableName].findIndex(item => 
          filterKeys.every(key => item[key] === filter[key])
        );
        
        if (index !== -1) {
          tables[tableName][index] = { 
            ...tables[tableName][index],
            ...updateData
          };
          saveTablesDebounced();
          return { matchedCount: 1, modifiedCount: 1 };
        }
        
        return { matchedCount: 0, modifiedCount: 0 };
      } catch (error) {
        console.error(`DB: Error updating in ${tableName}:`, error);
        throw error;
      }
    },
    deleteOne: async (filter: any) => {
      try {
        const keys = Object.keys(filter);
        if (keys.length === 0) throw new Error("Delete filter cannot be empty");
        
        const initialLength = tables[tableName].length;
        tables[tableName] = tables[tableName].filter(item => 
          !keys.every(key => item[key] === filter[key])
        );
        
        const deletedCount = initialLength - tables[tableName].length;
        if (deletedCount > 0) {
          saveTablesDebounced();
        }
        
        return { deletedCount };
      } catch (error) {
        console.error(`DB: Error deleting from ${tableName}:`, error);
        throw error;
      }
    }
  };
};

// Close the database connection
export const closeSqliteDb = () => {
  if (db) {
    // Save all tables before closing
    try {
      localStorage.setItem('sqlite_tables', JSON.stringify(tables));
      console.log("DB: Saved tables to localStorage before closing");
    } catch (e) {
      console.warn("DB: Could not save tables to localStorage", e);
    }
    
    db = null;
    console.log("DB: SQLite connection closed");
  }
};
