import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="adminPageHeader">
      <div>
        <p className="eyebrow dark">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function AdminMetricGrid({
  metrics,
  label,
  className,
}: {
  metrics: Array<{ label: string; value: ReactNode; icon: ReactNode }>;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("adminMetricGrid", className)} aria-label={label}>
      {metrics.map((metric) => (
        <div key={metric.label}>
          {metric.icon}
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}
