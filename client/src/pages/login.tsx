import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import PhotoBackground from "@/components/PhotoBackground";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Please enter your password";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Clear any cached data from previous user session
      queryClient.clear();
      
      const user = await login(email, password);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.fullName}`,
      });
      
      // Redirect based on role and onboarding status
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "photographer") {
        if (user.hasPhotographerProfile) {
          // Photographer home will handle verification status redirect
          setLocation("/photographer-home");
        } else {
          setLocation("/photographer-onboarding");
        }
      } else {
        setLocation("/home");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col p-6 relative overflow-hidden">
      <PhotoBackground />
      
      <div className="relative z-10 flex items-center mb-8 mt-4">
        <button 
          onTouchEnd={(e) => { e.preventDefault(); setLocation("/"); }}
          onClick={() => setLocation("/")}
          className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95" 
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="glass-dark rounded-3xl p-6 border border-white/10 backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email address</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`pl-10 bg-card text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20 ${
                    errors.email ? "border-red-500" : "border-white/10"
                  }`}
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 text-red-400 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`pl-10 pr-10 bg-card text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20 ${
                    errors.password ? "border-red-500" : "border-white/10"
                  }`}
                  data-testid="input-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-red-400 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/25"
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button 
                onClick={() => setLocation("/signup")} 
                className="text-white font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
        
        {/* Test accounts info */}
        <div className="mt-4 p-4 glass-dark rounded-xl border border-white/10">
          <p className="text-xs text-muted-foreground text-center mb-2">Test accounts:</p>
          <div className="text-xs text-center space-y-1">
            <p className="text-white">Customer: <span className="text-primary">customer@test.com</span> (password)</p>
            <p className="text-white">Photographer: <span className="text-primary">anna@snapnow.com</span> (password)</p>
            <p className="text-white">Admin: <span className="text-primary">admin@snapnow.com</span> (admin123)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
