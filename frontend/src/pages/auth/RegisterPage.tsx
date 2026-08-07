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
import { Sun, Moon } from "lucide-react";
import api from "@/lib/axios";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "owner"
      });
      
      toast.success("Account created! Please log in. 🎉");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen flex bg-background items-center justify-center p-6">
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-blue">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">StockFlow</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-1">
            Join StockFlow and streamline your wholesale business.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Full Name *</Label>
            <Input
              id="reg-name"
              placeholder="Mukti Patel"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email Address *</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Password *</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
                {...register("password")}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm">Confirm Password *</Label>
            <Input
              id="reg-confirm"
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            id="register-submit"
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
