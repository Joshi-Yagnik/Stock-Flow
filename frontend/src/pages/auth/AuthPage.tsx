import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Sun, Moon, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    shopName: z.string().max(100).optional(),
    email: z.string().email("Please enter a valid email address."),
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

type EmailStatus = "idle" | "sending" | "sent" | "verified";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { login } = useAuth();
  
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
    watch: watchSignup,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting, isValid: isRegisterValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { name: "", shopName: "", email: "", password: "", confirmPassword: "" },
  });

  const signupEmail = watchSignup("email");

  // OTP State
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset OTP state when email changes (unless verified)
  useEffect(() => {
    if (emailStatus !== "verified" && emailStatus !== "idle") {
      setEmailStatus("idle");
      setOtp(Array(6).fill(""));
      setResendTimer(0);
    }
  }, [signupEmail]);

  // Resend Timer
  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!signupEmail || registerErrors.email) return;
    try {
      setEmailStatus("sending");
      await api.post("/auth/send-otp", { email: signupEmail });
      setEmailStatus("sent");
      setResendTimer(30);
      toast.success("OTP sent successfully");
      
      // Focus first OTP input after a short delay
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      setEmailStatus("idle");
      toast.error(error.response?.data?.detail || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) return;
    
    try {
      setIsVerifying(true);
      await api.post("/auth/verify-otp", {
        email: signupEmail,
        otp: otpString
      });
      setEmailStatus("verified");
      toast.success("Email Verified Successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Incorrect OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    // Take only the last character if multiple are typed somehow
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pastedData) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const onLoginSubmit = async (data: LoginForm) => {
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

  const onRegisterSubmit = async (data: RegisterForm) => {
    if (emailStatus !== "verified") {
      toast.error("Please verify your email first.");
      return;
    }
    try {
      await api.post("/auth/register", {
        name: data.name,
        shop_name: data.shopName || null,
        email: data.email,
        password: data.password,
        role: "owner"
      });
      toast.success("Account created! Please log in. 🎉");
      setIsFlipped(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create account");
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
                  <Label htmlFor="login-email" className={labelClassName}>Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
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
              className={`${cardClassName} rotate-y-180 transition-all overflow-hidden ${emailStatus === 'sent' ? 'pb-8' : ''}`}
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
                    {...registerSignup("name")}
                    className={`${inputClassName} ${registerErrors.name ? "border-red-500" : ""}`}
                  />
                  {registerErrors.name && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-0.5">{registerErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-shop" className={labelClassName}>Shop Name (Optional)</Label>
                  <Input
                    id="reg-shop"
                    placeholder="Enter your shop name"
                    {...registerSignup("shopName")}
                    className={`${inputClassName} ${registerErrors.shopName ? "border-red-500" : ""}`}
                  />
                  {registerErrors.shopName && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-0.5">{registerErrors.shopName.message}</p>
                  )}
                </div>

                {/* Email Verification Flow */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reg-email" className={labelClassName}>Email Address *</Label>
                    {emailStatus === "verified" && (
                      <span className="flex items-center text-[12px] md:text-[13px] text-green-400 font-medium mb-1 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      disabled={emailStatus === "verified"}
                      {...registerSignup("email")}
                      className={`${inputClassName} flex-1 ${registerErrors.email ? "border-red-500" : ""} ${emailStatus === "verified" ? "opacity-60 bg-green-500/5 border-green-500/20 text-green-100" : ""}`}
                    />
                    
                    {/* Show Verify Button if valid email and not sent/verified */}
                    {signupEmail && !registerErrors.email && emailStatus === "idle" && (
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={emailStatus === "sending"}
                        className="h-10 md:h-11 px-4 rounded-[12px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all"
                      >
                        {emailStatus === "sending" ? "Sending..." : "Verify"}
                      </Button>
                    )}
                  </div>
                  
                  {registerErrors.email && (
                    <p className="text-[11px] md:text-xs text-red-400 mt-0.5">{registerErrors.email.message}</p>
                  )}
                </div>

                {/* OTP Input Section */}
                {emailStatus === "sent" && (
                  <div className="pt-2 pb-1 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-[rgba(0,0,0,0.2)] p-4 rounded-[16px] border border-[rgba(255,255,255,0.05)]">
                      <Label className="text-white/80 font-medium mb-2 block text-center text-[12px] md:text-[13px]">
                        Enter the 6-digit OTP sent to your email
                      </Label>
                      
                      <div className="flex justify-center space-x-2 md:space-x-3 mb-4">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                        ))}
                      </div>
                      
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otp.join("").length !== 6 || isVerifying}
                        className="w-full h-10 rounded-[10px] bg-white text-black hover:bg-gray-200 font-medium transition-all mb-3 disabled:opacity-50"
                      >
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                      </Button>
                      
                      <div className="text-center text-[12px] md:text-[13px]">
                        {resendTimer > 0 ? (
                          <span className="text-white/50">Resend OTP in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                  disabled={!isRegisterValid || isRegisterSubmitting || emailStatus !== "verified"}
                >
                  {isRegisterSubmitting ? "Creating account…" : "Create Account"}
                </Button>
              </form>

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
