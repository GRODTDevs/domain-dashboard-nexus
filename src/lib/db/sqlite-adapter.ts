
import fs from 'fs';
import path from 'path';
import BetterSqlite3 from 'better-sqlite3';
import { updateStorageStatus } from './storage-status';

let db: BetterSqlite3.Database | null = null;

// Initialize SQLite database
export const initializeSqlite = async () => {
  try {
    console.log("DB: Initializing SQLite database");
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      console.log("DB: Creating data directory");
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'database.sqlite');
    console.log(`DB: Using SQLite database at ${dbPath}`);
    
    // Open the database (creates it if it doesn't exist)
    db = new BetterSqlite3(dbPath, {
      verbose: console.log
    });
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        role TEXT,
        status TEXT,
        createdAt TEXT
      );
      
      CREATE TABLE IF NOT EXISTS domains (
        id TEXT PRIMARY KEY,
        name TEXT,
        url TEXT,
        status TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
      
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT,
        path TEXT,
        size INTEGER,
        type TEXT,
        createdAt TEXT
      );
      
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
      
      CREATE TABLE IF NOT EXISTS seo_analysis (
        id TEXT PRIMARY KEY,
        domainId TEXT,
        title TEXT,
        description TEXT,
        score INTEGER,
        createdAt TEXT,
        FOREIGN KEY (domainId) REFERENCES domains (id)
      );
    `);
    
    console.log("DB: SQLite database initialized successfully");
    
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

// Get database instance
export const getSqliteDb = () => db;

// Collection-like interface for SQLite to maintain API compatibility
export const getCollection = (tableName: string) => {
  if (!db) {
    console.warn("DB: SQLite connection not initialized");
    return null;
  }
  
  return {
    find: () => ({ 
      toArray: async () => {
        try {
          const stmt = db!.prepare(`SELECT * FROM ${tableName}`);
          return stmt.all();
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
        
        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        const values = keys.map(key => filter[key]);
        
        const stmt = db!.prepare(`SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT 1`);
        return stmt.get(...values) || null;
      } catch (error) {
        console.error(`DB: Error finding in ${tableName}:`, error);
        return null;
      }
    },
    insertOne: async (doc: any) => {
      try {
        const keys = Object.keys(doc);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(key => doc[key]);
        
        const stmt = db!.prepare(
          `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`
        );
        
        const result = stmt.run(...values);
        return { insertedId: doc.id || result.lastInsertRowid };
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
        const updateKeys = Object.keys(updateData);
        
        const setClause = updateKeys.map(key => `${key} = ?`).join(', ');
        const whereClause = filterKeys.map(key => `${key} = ?`).join(' AND ');
        
        const values = [
          ...updateKeys.map(key => updateData[key]),
          ...filterKeys.map(key => filter[key])
        ];
        
        const stmt = db!.prepare(
          `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`
        );
        
        const result = stmt.run(...values);
        return { matchedCount: result.changes, modifiedCount: result.changes };
      } catch (error) {
        console.error(`DB: Error updating in ${tableName}:`, error);
        throw error;
      }
    },
    deleteOne: async (filter: any) => {
      try {
        const keys = Object.keys(filter);
        if (keys.length === 0) throw new Error("Delete filter cannot be empty");
        
        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        const values = keys.map(key => filter[key]);
        
        const stmt = db!.prepare(`DELETE FROM ${tableName} WHERE ${whereClause} LIMIT 1`);
        const result = stmt.run(...values);
        
        return { deletedCount: result.changes };
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
    db.close();
    db = null;
    console.log("DB: SQLite connection closed");
  }
};
