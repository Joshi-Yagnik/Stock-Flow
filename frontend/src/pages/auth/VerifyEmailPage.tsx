import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("No email address found. Please try registering again.");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred while resending the email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] via-[#020617] to-black relative overflow-x-hidden">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered Content Wrapper */}
      <div className="relative w-[95%] md:w-[90%] max-w-[480px] z-10 flex flex-col items-center justify-center mx-auto">
        
        {/* Fixed Branding */}
        <div className="flex items-center space-x-2.5 mb-6 md:mb-8 pointer-events-none">
          <Zap className="h-6 w-6 md:h-7 md:w-7 text-blue-500 fill-blue-500/20" />
          <span className="text-2xl md:text-[28px] font-bold text-white tracking-tight">StockFlow</span>
        </div>

        <div className="w-full flex flex-col items-center text-center p-8 md:p-10 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(20,24,40,0.45)] backdrop-blur-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_40px_rgba(59,130,246,0.15)]">
          
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
            Verify your email
          </h1>
          
          <p className="text-[14px] text-[rgba(255,255,255,0.7)] mb-6">
            Your account has been created. We've sent a verification link to {email ? <span className="font-semibold text-white">{email}</span> : "your email address"}.
          </p>

          <div className="w-full space-y-4">
            <Button
              onClick={handleResend}
              disabled={isResending || !email}
              className="w-full h-11 rounded-[12px] bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-[15px] font-medium border-0 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>

            <Link to="/auth" className="block w-full">
              <Button
                variant="outline"
                className="w-full h-11 rounded-[12px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.08)] transition-all font-medium flex items-center justify-center space-x-2"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
