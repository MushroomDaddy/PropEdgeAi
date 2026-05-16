import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="size-7 text-muted-foreground/40" />
      </div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground/60 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
