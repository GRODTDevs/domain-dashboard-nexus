import { useState, useEffect } from "react";
import { initializeStorage, isStorageInitialized } from "@/lib/db";
import { getDatabaseConnectionString } from "@/lib/database-config";

export function useDatabaseInitialization() {
  const [databaseConfigured, setDatabaseConfigured] = useState(true); // Always true for SQLite
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [initializationStep, setInitializationStep] = useState("Checking SQLite configuration...");
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  // Effect to check if database is configured
  useEffect(() => {
    console.log("Index: Checking database configuration");
    // For SQLite this is always true, but we keep the API for compatibility
    setDatabaseConfigured(true);
  }, []);
  
  // Add a timeout to detect hanging initialization - now much shorter (4s)
  useEffect(() => {
    if (isInitializing) {
      const timeoutId = setTimeout(() => {
        console.log("Index: Initialization taking too long, setting timeout flag");
        setLoadTimeout(true);
      }, 4000); // Reduced to 4 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [isInitializing]);
  
  // Effect to initialize database
  useEffect(() => {
    const initDb = async () => {
      console.log("Index: Checking if storage is initialized:", isStorageInitialized());
      if (!isStorageInitialized()) {
        try {
          setInitializationStep("Establishing SQLite database connection...");
          console.log("Index: Attempting to initialize database connection");
          
          // Add timeout to prevent hanging - significantly reduced
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Database initialization timed out after 4s")), 4000);
          });
          
          const initPromise = initializeStorage();
          
          // Race between initialization and timeout
          const result = await Promise.race([initPromise, timeoutPromise]).catch(error => {
            console.error("Index: Database initialization race failed:", error);
            throw error;
          });
          
          console.log("Index: Database initialization result:", result);
          setInitializationStep("SQLite database connected successfully");
        } catch (error) {
          console.error("Index: Failed to initialize database:", error);
          setInitializationError(error instanceof Error ? error.message : "Unknown database error");
          setInitializationStep("Database connection failed");
        } finally {
          setIsInitializing(false);
        }
      } else {
        console.log("Index: Database already initialized");
        setIsInitializing(false);
      }
    };
    
    console.log("Index: Running database initialization effect");
    initDb();
  }, []);
  
  return {
    databaseConfigured,
    isInitializing,
    initializationError,
    initializationStep,
    loadTimeout,
    setIsInitializing
  };
}
