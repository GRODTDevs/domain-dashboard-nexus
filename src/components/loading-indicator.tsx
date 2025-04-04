
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LoadingIndicatorProps {
  step: string;
  className?: string;
}

export function LoadingIndicator({ step, className }: LoadingIndicatorProps) {
  const [dots, setDots] = useState('.');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Show additional help text if loading takes too long
  const showHelp = elapsedTime > 15;
  
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
      <p className="text-lg font-medium">{step}{dots}</p>
      <p className="text-sm text-muted-foreground">
        This may take a moment...
      </p>
      
      {showHelp && (
        <div className="mt-8 max-w-md p-4 bg-muted rounded-md text-sm">
          <p className="font-medium mb-2">Taking longer than expected?</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>SQLite database is stored locally in your browser</li>
            <li>Try refreshing the page if the connection is taking too long</li>
            <li>Check browser console for any error messages</li>
          </ul>
        </div>
      )}
      
      {elapsedTime > 30 && (
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}
