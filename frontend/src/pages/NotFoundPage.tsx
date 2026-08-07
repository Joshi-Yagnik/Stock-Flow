import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-16">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-blue">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold">StockFlow</span>
      </div>

      {/* 404 */}
      <div className="relative mb-8">
        <h1 className="text-[160px] sm:text-[220px] font-black leading-none text-muted/30 select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-blue shadow-elevated mx-auto mb-4">
              <Zap className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-3">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        Oops! The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button asChild>
          <Link to="/dashboard">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
