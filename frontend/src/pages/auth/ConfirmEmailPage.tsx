import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Supabase client automatically handles the hash token in the URL on mount.
    // It verifies the token and establishes a session if valid.
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus("error");
          return;
        }

        if (data.session) {
          // A valid session was established, meaning the link worked.
          // Since the requirements say not to automatically log the user in bypassing the normal flow
          // unless explicitly provided, we'll sign them out immediately so they have to sign in properly,
          // OR we can just let them sign in. The user requirement specifically says:
          // "If verification succeeds: Show: "Email verified successfully!" Then provide: "Continue to Sign In" Navigate to: /auth"
          // We should sign them out so that when they go to /auth, they see the login screen.
          await supabase.auth.signOut();
          setStatus("success");
        } else {
          // Hash might not be present or already consumed
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    checkSession();
  }, []);

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
          
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                Verifying...
              </h1>
              <p className="text-[14px] text-[rgba(255,255,255,0.7)]">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                Email verified successfully!
              </h1>
              <p className="text-[14px] text-[rgba(255,255,255,0.7)] mb-6">
                Your email has been verified. You can now access your account.
              </p>
              <Link to="/auth" className="block w-full">
                <Button
                  className="w-full h-11 rounded-[12px] bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[15px] font-medium border-0 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
                >
                  Continue to Sign In
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                Verification failed
              </h1>
              <p className="text-[14px] text-[rgba(255,255,255,0.7)] mb-6">
                Email verification failed or the link has expired.
              </p>
              <Link to="/auth" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-[12px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.08)] transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <span>Back to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
