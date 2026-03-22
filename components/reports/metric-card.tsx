import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

const trendIcon = {
  up: <ArrowUp className="h-4 w-4 text-green-500" />,
  down: <ArrowDown className="h-4 w-4 text-red-500" />,
  neutral: <ArrowRight className="h-4 w-4 text-muted-foreground" />,
};

const trendColor = {
  up: "text-green-500",
  down: "text-red-500",
  neutral: "text-muted-foreground",
};

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 text-sm">
          {trend && trendIcon[trend]}
          {trendValue && (
            <span className={trend ? trendColor[trend] : ""}>{trendValue}</span>
          )}
          {description && (
            <span className="text-muted-foreground">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
