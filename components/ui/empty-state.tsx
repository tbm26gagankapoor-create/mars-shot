import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="font-display text-sm font-medium mt-3">{title}</p>
      <p className="text-[13px] text-muted-foreground/70 mt-1 text-center max-w-[240px]">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
