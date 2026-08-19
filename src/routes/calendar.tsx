import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Page, PageHeader } from "@/components/AppShell";
import { EmptyState, SectionTitle, subjectClasses } from "@/components/bits";
import { TaskCard } from "@/components/TaskCard";
import { useStore } from "@/lib/store";
import { fmtMinutes, todayISO } from "@/lib/scheduler";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Study calendar · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "Month view of your Class 10 study plan: daily workload, revision days, syllabus deadline and exam day.",
      },
      { property: "og:title", content: "Study calendar · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "See every planned study day, revision block and exam date at a glance.",
      },
    ],
  }),
  component: CalendarPage,
});

export default function CalendarPage() {
  const { activeExam, plan } = useStore();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string>(todayISO());

  if (!activeExam || !plan) {
    return (
      <>
        <PageHeader title="Calendar" />
        <Page>
          <EmptyState title="No exam yet" description="Create an exam to build a calendar." />
        </Page>
      </>
    );
  }

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });

  const selectedDay = plan.byDate[selected];

  return (
    <>
      <PageHeader title="Calendar" subtitle={activeExam.name} />
      <Page>
        <div className="card-surface p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              className="tap rounded-lg p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-display font-bold">{format(cursor, "MMMM yyyy")}</span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              className="tap rounded-lg p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-muted-foreground">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const iso = format(d, "yyyy-MM-dd");
              const day = plan.byDate[iso];
              const isExam = iso === plan.examDate;
              const isDeadline = iso === plan.deadline;
              const inMonth = isSameMonth(d, cursor);
              const load = day ? day.used / Math.max(1, day.capacity) : 0;
              const subjects = Array.from(
                new Set((day?.tasks ?? []).map((t) => t.subject).filter(Boolean)),
              );
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelected(iso)}
                  className={cn(
                    "tap flex aspect-square flex-col items-center justify-center rounded-lg border text-xs",
                    inMonth ? "border-border" : "border-transparent opacity-35",
                    selected === iso && "ring-2 ring-primary",
                    isExam && "bg-destructive/15 font-bold",
                    isDeadline && !isExam && "bg-accent",
                    !isExam && !isDeadline && load > 0.9 && "bg-muted",
                  )}
                >
                  <span className={cn(iso === todayISO() && "font-bold text-primary")}>
                    {format(d, "d")}
                  </span>
                  <span className="mt-0.5 flex h-1.5 gap-0.5">
                    {subjects.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className={cn("h-1.5 w-1.5 rounded-full", subjectClasses[s!].bar)}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded bg-destructive/40" /> Exam day
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded bg-accent" /> Syllabus deadline
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded bg-muted" /> Heavy day
            </span>
          </div>
        </div>

        <SectionTitle
          right={
            selectedDay ? (
              <span className="text-xs text-muted-foreground">
                {fmtMinutes(selectedDay.used)} / {fmtMinutes(selectedDay.capacity)}
              </span>
            ) : null
          }
        >
          {format(parseISO(selected), "EEEE, d MMMM")}
        </SectionTitle>

        {!selectedDay || selectedDay.tasks.length === 0 ? (
          <EmptyState
            title="No tasks planned"
            description={
              selected > plan.examDate
                ? "This day is after your exam."
                : "Enjoy the break — or add a custom task from the timetable."
            }
          />
        ) : (
          <div className="space-y-2">
            {selectedDay.tasks.map((t) => (
              <TaskCard key={t.id} task={t} date={selected} />
            ))}
          </div>
        )}
      </Page>
    </>
  );
}
