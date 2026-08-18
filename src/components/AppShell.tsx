import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  GraduationCap,
  Home,
  LayoutList,
  Library,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { SetupWizard } from "./SetupWizard";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/schedule", label: "Schedule", icon: LayoutList },
  { to: "/subjects", label: "Subjects", icon: Library },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/exams", label: "Exams", icon: GraduationCap },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, state } = useStore();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!state.setupDone && state.exams.length === 0) {
    return <SetupWizard />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "tap flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-primary/12",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.9} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {right}
          <Link
            to="/settings"
            aria-label="Settings"
            className="tap flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-4 animate-rise">{children}</main>
  );
}
