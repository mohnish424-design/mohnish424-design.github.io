import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { Page, PageHeader } from "@/components/AppShell";
import { EmptyState, SectionTitle } from "@/components/bits";
import { TaskCard } from "@/components/TaskCard";
import { useStore } from "@/lib/store";
import { fmtMinutes, timetable, todayISO } from "@/lib/scheduler";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Timetable · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "Day-by-day Class 10 CBSE timetable with lecture slots, extra-question sessions, breaks and revision blocks.",
      },
      { property: "og:title", content: "Timetable · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "Auto-generated daily study timetable built from your real workload.",
      },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { activeExam, plan, addCustomTask } = useStore();
  const [selected, setSelected] = useState<string>(todayISO());
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(30);

  if (!activeExam || !plan) {
    return (
      <>
        <PageHeader title="Schedule" />
        <Page>
          <EmptyState title="No plan yet" description="Create an exam first." />
        </Page>
      </>
    );
  }

  const days = plan.days;
  const day = plan.byDate[selected] ?? days[0];
  const rows = day ? timetable(day, activeExam.availability.startTime) : [];

  return (
    <>
      <PageHeader
        title="Timetable"
        subtitle={`${activeExam.name} · ${format(parseISO(activeExam.date), "d MMM")}`}
      />
      <Page>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {days.slice(0, 21).map((d) => {
            const active = d.date === selected;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelected(d.date)}
                className={cn(
                  "tap flex w-14 shrink-0 flex-col items-center rounded-2xl border px-2 py-2",
                  active
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card",
                  d.phase === "exam" && !active && "border-danger/50",
                )}
              >
                <span className="text-[10px] font-semibold uppercase opacity-70">
                  {format(parseISO(d.date), "EEE")}
                </span>
                <span className="font-display text-lg font-bold">
                  {format(parseISO(d.date), "d")}
                </span>
                <span className="text-[9px] opacity-70">
                  {d.phase === "exam" ? "EXAM" : `${d.tasks.length}t`}
                </span>
              </button>
            );
          })}
        </div>

        {day ? (
          <>
            <div className="card-surface flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-semibold">{format(parseISO(day.date), "EEEE, d MMM")}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {day.phase} day · {fmtMinutes(day.used)} of {fmtMinutes(day.capacity)} used
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                className="tap flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Task
              </button>
            </div>

            {showAdd ? (
              <div className="card-surface space-y-2 p-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Personal task (e.g. School homework)"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-24 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim()) return;
                      addCustomTask({
                        examId: activeExam.id,
                        date: day.date,
                        title: title.trim(),
                        minutes,
                      });
                      setTitle("");
                      setShowAdd(false);
                      toast.success("Personal task added");
                    }}
                    className="tap flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Add to {format(parseISO(day.date), "d MMM")}
                  </button>
                </div>
              </div>
            ) : null}

            <SectionTitle>Time blocks</SectionTitle>
            {rows.length === 0 ? (
              <EmptyState
                title="Free day"
                description={
                  day.phase === "exam" ? "Exam day — good luck!" : "No tasks scheduled."
                }
              />
            ) : (
              <div className="card-surface divide-y divide-border">
                {rows.map((r, i) => (
                  <div key={i} className="flex gap-3 p-3 text-sm">
                    <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                      {r.start}–{r.end}
                    </span>
                    {r.task ? (
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{r.task.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.task.detail}
                        </span>
                      </span>
                    ) : (
                      <span className="flex-1 text-xs text-muted-foreground italic">Break</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <SectionTitle>Tasks</SectionTitle>
            <div className="space-y-2">
              {day.tasks.map((t) => (
                <TaskCard key={t.id} task={t} date={day.date} />
              ))}
            </div>
          </>
        ) : null}
      </Page>
    </>
  );
}
