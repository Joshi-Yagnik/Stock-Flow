import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export function Loader({ size = "md", text, fullPage, className }: LoaderProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2
        className={cn("animate-spin text-primary", sizes[size])}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
