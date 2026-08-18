import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/AppShell";
import { EmptyState, ProgressBar, SectionTitle, Stat, subjectClasses } from "@/components/bits";
import { useStore } from "@/lib/store";
import { subjectProgress } from "@/lib/progress";
import { SUBJECTS } from "@/lib/syllabus";
import { fmtMinutes, isChapterLearned } from "@/lib/scheduler";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/subjects/")({
  head: () => ({
    meta: [
      { title: "Progress · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "Track Mathematics, Science and Social Science progress: PW lectures, extra questions and remaining study hours.",
      },
      { property: "og:title", content: "Progress · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "Subject-wise Class 10 CBSE progress dashboard with remaining workload.",
      },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { state, activeExam, plan } = useStore();

  if (!activeExam || !plan) {
    return (
      <>
        <PageHeader title="Subjects" />
        <Page>
          <EmptyState title="No exam yet" description="Create an exam to see progress." />
        </Page>
      </>
    );
  }

  const progresses = SUBJECTS.map((s) => subjectProgress(state, activeExam, s.id)).filter(
    (p) => p.chapters.length > 0,
  );
  const completed = activeExam.chapters.filter(isChapterLearned).length;

  return (
    <>
      <PageHeader title="Subjects & Progress" subtitle={activeExam.name} />
      <Page>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Chapters" value={activeExam.chapters.length} />
          <Stat label="Done" value={completed} />
          <Stat label="Remaining" value={activeExam.chapters.length - completed} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Lectures left" value={fmtMinutes(
            progresses.reduce((s, p) => s + p.lectureRemainingMinutes, 0),
          )} />
          <Stat label="Extra Qs left" value={fmtMinutes(
            progresses.reduce((s, p) => s + p.extraRemainingMinutes, 0),
          )} />
          <Stat label="Revision left" value={fmtMinutes(
            progresses.reduce((s, p) => s + p.revisionRemaining, 0),
          )} />
        </div>

        <SectionTitle>By subject</SectionTitle>
        {progresses.map((p) => {
          const meta = SUBJECTS.find((s) => s.id === p.subject)!;
          const c = subjectClasses[p.subject];
          return (
            <Link
              key={p.subject}
              to="/subjects/$subjectId"
              params={{ subjectId: p.subject }}
              className="card-surface tap block space-y-3 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="text-xl">{meta.emoji}</span> {meta.name}
                </span>
                <span className={cn("font-display text-lg font-bold", c.text)}>
                  {p.overallPct}%
                </span>
              </div>
              <div className="space-y-1.5">
                <Line label="PW Lectures" value={p.lecturePct} barClass={c.bar} />
                <Line label="Extra Questions" value={p.extraPct} barClass={c.bar} />
              </div>
              <p className="text-xs text-muted-foreground">
                {p.chapters.length} chapters · {p.completedChapters} completed ·{" "}
                {fmtMinutes(p.lectureRemainingMinutes + p.extraRemainingMinutes)} left
              </p>
            </Link>
          );
        })}
      </Page>
    </>
  );
}

function Line({
  label,
  value,
  barClass,
}: {
  label: string;
  value: number;
  barClass: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <ProgressBar value={value} barClass={barClass} />
    </div>
  );
}
