import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  iconClassName,
}: StatsCardProps) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-yellow-500",
  };

  const trendSymbol = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {trend && trendValue && (
                <span className={cn("text-sm font-medium", trendColors[trend])}>
                  {trendSymbol[trend]} {trendValue}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Icon className={cn("h-5 w-5 text-primary", iconClassName)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
