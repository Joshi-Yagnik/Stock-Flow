import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Moon } from "lucide-react";
import api from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "owner@stockflow.com", password: "owner123", rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      
      const { access_token } = response.data;
      await login(access_token, data.rememberMe);
      
      toast.success("Login successful! 👋");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-blue items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
        <div className="relative z-10 max-w-sm text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold">StockFlow</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Smart Inventory & Billing
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Manage your wholesale business with ease. Track stock, create
            invoices, and gain insights — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Products", value: "1,248" },
              { label: "Customers", value: "342" },
              { label: "Revenue", value: "₹68L" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/15 backdrop-blur p-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-blue-200 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-full max-w-sm">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-blue">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">StockFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="rememberMe"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...register("rememberMe")}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button
              id="login-submit"
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
