import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  change?: number;
  changeLabel?: string;
  iconBg?: string;
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  change,
  changeLabel,
  iconBg = "bg-primary/10",
  className,
  loading,
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-5">
          <div className="skeleton h-4 w-24 mb-3" />
          <div className="skeleton h-8 w-32 mb-2" />
          <div className="skeleton h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {value}
              </span>
            </div>
            {(change !== undefined || description) && (
              <div className="mt-2 flex items-center gap-1.5">
                {change !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium",
                      isPositive && "text-emerald-600 dark:text-emerald-400",
                      isNegative && "text-destructive",
                      isNeutral && "text-muted-foreground"
                    )}
                  >
                    {isPositive && <TrendingUp className="h-3 w-3" />}
                    {isNegative && <TrendingDown className="h-3 w-3" />}
                    {isNeutral && <Minus className="h-3 w-3" />}
                    {isPositive && "+"}
                    {change}%
                  </span>
                )}
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
                {description && !changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
              iconBg,
              "group-hover:scale-110 transition-transform duration-200"
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
