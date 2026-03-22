import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  visibility?: string;
}

export default function Container({
  children,
  className,
  title,
  description,
  visibility,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {(title || description) && (
        <div className="py-4">
          <div className="flex items-center gap-2">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            )}
            {visibility === "private" && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
