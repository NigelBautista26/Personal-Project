import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"customer" | "photographer">("customer");
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = await register(email, password, fullName, role);
      
      toast({
        title: "Account created!",
        description: `Welcome to SnapNow, ${user.fullName}!`,
      });
      
      // Redirect based on role
      if (user.role === "photographer") {
        // New photographers go to onboarding to set up their profile
        setLocation("/photographer-onboarding");
      } else {
        setLocation("/home");
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[30%] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex items-center mb-8 mt-4">
        <Link href="/">
          <button className="w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-muted-foreground">Join SnapNow and get started.</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <Label className="text-white mb-3 block">I want to:</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === "customer"
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-card hover:border-white/20"
              }`}
              data-testid="button-role-customer"
            >
              <Users className={`w-6 h-6 ${role === "customer" ? "text-primary" : "text-white"}`} />
              <span className={`text-sm font-medium ${role === "customer" ? "text-primary" : "text-white"}`}>
                Book Photos
              </span>
              <span className="text-xs text-muted-foreground">I'm a traveler</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("photographer")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === "photographer"
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-card hover:border-white/20"
              }`}
              data-testid="button-role-photographer"
            >
              <Camera className={`w-6 h-6 ${role === "photographer" ? "text-primary" : "text-white"}`} />
              <span className={`text-sm font-medium ${role === "photographer" ? "text-primary" : "text-white"}`}>
                Take Photos
              </span>
              <span className="text-xs text-muted-foreground">I'm a photographer</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Full name</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-5 h-5" />
              </div>
              <Input 
                id="name" 
                type="text" 
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 bg-card border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20"
                required
                data-testid="input-name"
              />
            </div>
          </div>

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
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-card border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20"
                required
                data-testid="input-email"
              />
            </div>
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-card border-white/10 text-white h-12 rounded-xl focus:border-primary focus:ring-primary/20"
                required
                minLength={6}
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
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/25"
            data-testid="button-signup"
          >
            {isLoading ? "Creating account..." : `Sign up as ${role === "customer" ? "Customer" : "Photographer"}`}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
