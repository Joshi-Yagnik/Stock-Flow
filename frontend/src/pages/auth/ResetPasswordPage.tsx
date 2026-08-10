import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";

const resetPasswordSchema = z
  .object({
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

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  useEffect(() => {
    // When the user lands here from a reset link, Supabase implicitly
    // extracts the hash token in the URL and establishes a session.
    // We listen to the auth state to verify they are good to go,
    // though the update query itself handles standard session errors.
    const checkHash = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error("Invalid or expired reset link. Please try again.");
      }
    };
    checkHash();
  }, []);

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully.");
      // Force user to log in again with new credentials for security
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    }
  };

  const inputClassName = "h-10 md:h-11 rounded-[12px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] placeholder:text-[rgba(255,255,255,0.45)] text-white text-[14px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0 transition-all";
  const labelClassName = "text-white/80 font-medium mb-1 block text-[12px] md:text-[13px]";

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] via-[#020617] to-black relative overflow-x-hidden">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors z-20 text-white"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Centered Content Wrapper */}
      <div className="relative w-[95%] md:w-[90%] max-w-[480px] z-10 flex flex-col items-center justify-center mx-auto">
        
        {/* Fixed Branding */}
        <div className="flex items-center space-x-2.5 mb-6 md:mb-8 pointer-events-none">
          <Zap className="h-6 w-6 md:h-7 md:w-7 text-blue-500 fill-blue-500/20" />
          <span className="text-2xl md:text-[28px] font-bold text-white tracking-tight">StockFlow</span>
        </div>

        <div className="w-full flex flex-col justify-center p-5 md:p-7 lg:p-8 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(20,24,40,0.45)] backdrop-blur-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_40px_rgba(59,130,246,0.15)]">
          <div className="mb-5 md:mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Reset password</h1>
            <p className="text-[13px] md:text-[14px] text-[rgba(255,255,255,0.60)] mt-1">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4" noValidate>
            
            <div>
              <Label htmlFor="reset-password" className={labelClassName}>New Password</Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  {...register("password")}
                  className={`${inputClassName} pr-12 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] md:text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reset-confirm" className={labelClassName}>Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="reset-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={`${inputClassName} pr-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] md:text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 md:h-11 mt-4 rounded-[12px] bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-[15px] font-medium border-0 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm font-medium text-white hover:text-blue-300 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
