import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CalendarCheck, Flame, Target } from "lucide-react";
import { Page, PageHeader } from "@/components/AppShell";
import { ConfidenceBadge, EmptyState, ProgressBar, SectionTitle, Stat } from "@/components/bits";
import { TaskCard } from "@/components/TaskCard";
import { useStore } from "@/lib/store";
import { fmtMinutes, todayISO } from "@/lib/scheduler";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · Class 10 Smart Study Tracker" },
      {
        name: "description",
        content:
          "Your daily Class 10 CBSE study plan: PW lectures, extra questions and revision, auto-scheduled around your exam date.",
      },
      { property: "og:title", content: "Today · Class 10 Smart Study Tracker" },
      {
        property: "og:description",
        content:
          "An auto-generated Class 10 CBSE timetable that adapts to your progress, available hours and exam date.",
      },
    ],
  }),
  component: Today,
});

function Today() {
  const { state, activeExam, plan } = useStore();
  const today = todayISO();

  if (!activeExam || !plan) {
    return (
      <>
        <PageHeader title="Today" />
        <Page>
          <EmptyState
            title="No exam yet"
            description="Create an exam to generate your study plan."
            action={
              <Link
                to="/exams/new"
                className="tap mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Create exam
              </Link>
            }
          />
        </Page>
      </>
    );
  }

  const day = plan.byDate[today];
  const tasks = day?.tasks ?? [];
  const doneTasks = tasks.filter((t) => state.marks[t.id] === "done");
  const planned = tasks.reduce((s, t) => s + t.minutes, 0);
  const completed = doneTasks.reduce((s, t) => s + t.minutes, 0);
  const capacity = day?.capacity ?? 0;

  return (
    <>
      <PageHeader
        title={state.studentName ? `Hi, ${state.studentName}` : "Today"}
        subtitle={format(parseISO(today), "EEEE, d MMMM")}
      />
      <Page>
        {state.isSample ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-accent/15 px-3 py-2 text-xs">
            <span className="font-medium">You&apos;re viewing sample data.</span>
            <Link to="/settings" className="font-bold text-primary">
              Start my own plan
            </Link>
          </div>
        ) : null}

        <div className="hero-gradient card-surface border-0 p-5 text-white">
          <p className="text-xs font-semibold tracking-wide uppercase opacity-80">
            {activeExam.name} · {format(parseISO(activeExam.date), "d MMM")}
          </p>
          <p className="font-display mt-1 text-4xl font-bold">
            {Math.max(0, plan.daysToExam)}{" "}
            <span className="text-lg font-semibold">days until exam</span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 px-3 py-2">
              <p className="opacity-80">Syllabus deadline</p>
              <p className="text-sm font-bold">
                {plan.deadline ? format(parseISO(plan.deadline), "d MMM") : "—"} ·{" "}
                {plan.daysToDeadline}d
              </p>
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-2">
              <p className="opacity-80">Chapters remaining</p>
              <p className="text-sm font-bold">
                {plan.chaptersRemaining} / {activeExam.chapters.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface flex items-center justify-between p-3">
          <div>
            <p className="text-xs text-muted-foreground">Schedule confidence</p>
            <p className="text-sm font-semibold">
              {fmtMinutes(plan.totalNeed)} work · {fmtMinutes(plan.capacity)} available
            </p>
          </div>
          <ConfidenceBadge confidence={plan.confidence} />
        </div>

        {plan.shortage > 0 || plan.unscheduled.length > 0 ? (
          <div className="rounded-xl border border-danger/40 bg-danger-soft p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-danger">
              <AlertTriangle className="h-4 w-4" /> Your plan doesn&apos;t fit comfortably
            </p>
            <div className="mt-2 space-y-0.5 text-xs">
              <p>Required: {fmtMinutes(plan.totalNeed)}</p>
              <p>Available before exam: {fmtMinutes(plan.capacity)}</p>
              <p className="font-semibold">
                Shortage: {fmtMinutes(Math.max(plan.shortage, 0))}
                {plan.unscheduled.length
                  ? ` · ${plan.unscheduled.length} tasks couldn't be placed`
                  : ""}
              </p>
            </div>
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
              <li>Increase daily study time in Settings</li>
              <li>Reduce extra-question estimates for easy chapters</li>
              <li>Remove low-priority chapters from this exam</li>
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Planned" value={fmtMinutes(planned)} />
          <Stat label="Completed" value={fmtMinutes(completed)} />
          <Stat label="Left today" value={fmtMinutes(Math.max(0, planned - completed))} />
        </div>

        <div className="card-surface space-y-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <Flame className="h-4 w-4 text-accent" /> Today&apos;s progress
            </span>
            <span className="text-muted-foreground">
              {doneTasks.length} / {tasks.length} tasks
            </span>
          </div>
          <ProgressBar value={tasks.length ? (doneTasks.length / tasks.length) * 100 : 0} />
          <p className="text-xs text-muted-foreground">
            Available today {fmtMinutes(capacity)} · Remaining capacity{" "}
            {fmtMinutes(Math.max(0, capacity - planned))}
          </p>
        </div>

        <SectionTitle
          right={
            <Link to="/schedule" className="text-xs font-semibold text-primary">
              Full timetable
            </Link>
          }
        >
          Today&apos;s tasks
        </SectionTitle>

        {tasks.length === 0 ? (
          <EmptyState
            title="Nothing scheduled today"
            description={
              capacity === 0
                ? "You have no study time available today."
                : "All caught up — enjoy the break!"
            }
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} date={today} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link to="/subjects" className="card-surface tap flex items-center gap-2 p-4">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Progress</span>
          </Link>
          <Link to="/calendar" className="card-surface tap flex items-center gap-2 p-4">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Calendar</span>
          </Link>
        </div>
      </Page>
    </>
  );
}
