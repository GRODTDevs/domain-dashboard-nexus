
import { Button } from "@/components/ui/button";
import { EnvDebugDisplay } from "@/components/env-debug-display";
import { LoadingIndicator } from "@/components/loading-indicator";
import { useToast } from "@/hooks/use-toast";

interface LoadingStateProps {
  step: string;
  onForceLogin: () => void;
}

export function LoadingState({ step, onForceLogin }: LoadingStateProps) {
  const { toast } = useToast();
  
  return (
    <div className="h-screen flex flex-col items-center justify-center font-raleway">
      <LoadingIndicator step={step} />
      
      {/* Add the environment debug display */}
      <div className="mt-8">
        <EnvDebugDisplay />
      </div>
      
      {/* Add prominent skip button during loading to prevent getting stuck */}
      <div className="mt-6">
        <Button
          onClick={() => {
            toast({
              title: "Proceeding to Login",
              description: "Bypassing database checks and proceeding to login."
            });
            onForceLogin();
          }}
          variant="default"
          size="lg"
          className="px-8 py-6 text-lg font-medium animate-pulse"
        >
          Skip DB Check & Login Now
        </Button>
      </div>
    </div>
  );
}
