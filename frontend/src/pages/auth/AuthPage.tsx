import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Sun, Moon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
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

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (location.state?.isRegister) {
      setIsFlipped(true);
    }
  }, [location]);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting, isValid: isLoginValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting, isValid: isRegisterValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      if (data.rememberMe) {
        window.localStorage.setItem('remember_me', 'true');
      } else {
        window.localStorage.removeItem('remember_me');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          toast.error("Please verify your email before signing in. Check your inbox for the verification email.");
          return;
        }
        toast.error(error.message);
        return;
      }

      toast.success("Login successful! 👋");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password");
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.fullName
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (authData.session) {
        toast.success("Account created successfully! 🎉");
        navigate("/dashboard");
      } else {
        navigate("/auth/verify-email", { state: { email: data.email } });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize Google signup");
    }
  };

  const inputClassName = "h-10 md:h-11 rounded-[12px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] placeholder:text-[rgba(255,255,255,0.45)] text-white text-[14px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0 transition-all";
  const labelClassName = "text-white/80 font-medium mb-1 block text-[12px] md:text-[13px]";
  const cardClassName = "backface-hidden w-full flex flex-col justify-center p-5 md:p-7 lg:p-8 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(20,24,40,0.45)] backdrop-blur-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_40px_rgba(59,130,246,0.15)] transition-all max-h-[85vh]";

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

        {/* Flip Container */}
        <div className="relative w-full perspective-1000 flex items-center justify-center">
          <div 
            className={`w-full transform-style-3d transition-transform duration-[600ms] ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`} 
            style={{ display: "grid" }}
          >
            {/* FRONT SIDE (Login) */}
            <div 
              className={cardClassName}
              style={{ gridArea: "1 / 1 / 2 / 2" }}
            >
              <div className="mb-5 md:mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Sign in</h1>
                <p className="text-[13px] md:text-[14px] text-[rgba(255,255,255,0.60)] mt-1">
                  Welcome back! Enter your credentials.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-3 md:space-y-4" noValidate>
                <div>
                  <Label htmlFor="login-email" className={labelClassName}>Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    {...registerLogin("email")}
                    className={`${inputClassName} ${loginErrors.email ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {loginErrors.email && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-1">{loginErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="login-password" className="text-white/80 font-medium text-[12px] md:text-[13px]">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-[12px] md:text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...registerLogin("password")}
                      className={`${inputClassName} pr-12 ${loginErrors.password ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-1">{loginErrors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="rememberMe"
                    className="h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 transition-colors cursor-pointer"
                    {...registerLogin("rememberMe")}
                  />
                  <Label htmlFor="rememberMe" className="text-[13px] md:text-[14px] text-[rgba(255,255,255,0.8)] cursor-pointer select-none">
                    Remember me
                  </Label>
                </div>

                <Button
                  id="login-submit"
                  type="submit"
                  className="w-full h-10 md:h-11 mt-3 rounded-[12px] bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-[15px] font-medium border-0 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                  loading={isLoginSubmitting}
                  disabled={!isLoginValid || isLoginSubmitting}
                >
                  {isLoginSubmitting ? "Signing in…" : "Sign In"}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(255,255,255,0.1)]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[rgba(20,24,40,0.45)] px-2 text-[rgba(255,255,255,0.5)]">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 md:h-11 rounded-[12px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.08)] transition-all font-medium flex items-center justify-center space-x-2 border"
                onClick={handleGoogleSignup}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign in with Google</span>
              </Button>

              <p className="mt-5 md:mt-6 text-center text-[13px] md:text-[14px] text-[rgba(255,255,255,0.6)]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="font-medium text-white hover:text-blue-300 transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>

            {/* BACK SIDE (Register) */}
            <div 
              className={`${cardClassName} rotate-y-180 transition-all overflow-hidden`}
              style={{ gridArea: "1 / 1 / 2 / 2" }}
            >
              <div className="mb-4 md:mb-5 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Create account</h1>
                <p className="text-[13px] md:text-[14px] text-[rgba(255,255,255,0.60)] mt-1">
                  Streamline your wholesale business.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-2 md:space-y-3" noValidate>
                <div>
                  <Label htmlFor="reg-name" className={labelClassName}>Full Name *</Label>
                  <Input
                    id="reg-name"
                    placeholder="Enter your full name"
                    {...registerSignup("fullName")}
                    className={`${inputClassName} ${registerErrors.fullName ? "border-red-500" : ""}`}
                  />
                  {registerErrors.fullName && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-0.5">{registerErrors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-email" className={labelClassName}>Email *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    {...registerSignup("email")}
                    className={`${inputClassName} ${registerErrors.email ? "border-red-500" : ""}`}
                  />
                  {registerErrors.email && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-0.5">{registerErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-password" className={labelClassName}>Password *</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Create your password"
                      autoComplete="new-password"
                      {...registerSignup("password")}
                      className={`${inputClassName} pr-12 ${registerErrors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-0.5">{registerErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-confirm" className={labelClassName}>Confirm Password *</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    {...registerSignup("confirmPassword")}
                    className={`${inputClassName} ${registerErrors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-0.5">{registerErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  id="register-submit"
                  type="submit"
                  className="w-full h-10 md:h-11 mt-4 rounded-[12px] bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-[15px] font-medium border-0 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                  loading={isRegisterSubmitting}
                  disabled={!isRegisterValid || isRegisterSubmitting}
                >
                  {isRegisterSubmitting ? "Creating account…" : "Create Account"}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(255,255,255,0.1)]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[rgba(20,24,40,0.45)] px-2 text-[rgba(255,255,255,0.5)]">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 md:h-11 rounded-[12px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.08)] transition-all font-medium flex items-center justify-center space-x-2 border"
                onClick={handleGoogleSignup}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign up with Google</span>
              </Button>

              <p className="mt-4 md:mt-5 text-center text-[13px] md:text-[14px] text-[rgba(255,255,255,0.6)]">
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="font-medium text-white hover:text-blue-300 transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
