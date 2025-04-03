
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Background with overlay */}
      <div className="fixed inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative flex w-full items-center justify-center">
        <div className="w-full max-w-md space-y-8 rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-md shadow-xl animate-fade-in">
          <div className="text-center">
            {/* Company logo placeholder - replace with your actual logo */}
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              {/* Replace with your company logo */}
              <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground">
              Domain Dashboard
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to manage your company domains
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="Email address"
                    className="pl-10"
                    {...register("email", { 
                      required: "Email is required", 
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="pl-10 pr-10"
                    {...register("password", { required: "Password is required" })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Demo credentials:</p>
              <p>Email: admin@example.com</p>
              <p>Password: admin123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
