import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { supabase } from "@/lib/supabase";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error("Supabase resetPasswordForEmail Error:", error);
        
        // Handle rate limit specifically
        if (error.status === 429 || error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("security purposes")) {
          toast.error("You've requested too many password resets. Please wait a minute before trying again.");
        } else {
          toast.error(error.message || "Failed to send reset email. Please try again.");
        }
        return;
      }

      setIsSubmitted(true);
      toast.success("Password reset link sent. Please check your email.");
    } catch (err: any) {
      console.error("Unexpected error during password reset:", err);
      toast.error(err.message || "An unexpected error occurred.");
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
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground mt-1">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">
                Check your email (and spam folder) for a reset link!
              </p>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@company.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
            
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Return to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
