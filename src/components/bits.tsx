import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { subjectMeta, type SubjectId } from "@/lib/syllabus";
import type { Plan } from "@/lib/scheduler";

export const subjectClasses: Record<SubjectId, { text: string; bg: string; bar: string }> = {
  math: { text: "text-math", bg: "bg-math-soft", bar: "bg-math" },
  science: { text: "text-science", bg: "bg-science-soft", bar: "bg-science" },
  sst: { text: "text-sst", bg: "bg-sst-soft", bar: "bg-sst" },
};

export function ProgressBar({
  value,
  className,
  barClass,
}: {
  value: number;
  className?: string;
  barClass?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full bg-primary transition-all duration-500", barClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function SubjectChip({ subject }: { subject: SubjectId }) {
  const meta = subjectMeta(subject);
  const c = subjectClasses[subject];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        c.bg,
        c.text,
      )}
    >
      {meta.emoji} {meta.short}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("card-surface p-3", className)}>
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-display mt-1 text-lg font-semibold">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Plan["confidence"] }) {
  const map = {
    comfortable: { label: "🟢 Comfortable", cls: "bg-success-soft text-success" },
    tight: { label: "🟡 Tight", cls: "bg-warning-soft text-warning" },
    overloaded: { label: "🔴 Overloaded", cls: "bg-danger-soft text-danger" },
  } as const;
  const m = map[confidence];
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", m.cls)}>
      {m.label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-2 p-8 text-center">
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {children}
      </h2>
      {right}
    </div>
  );
}
