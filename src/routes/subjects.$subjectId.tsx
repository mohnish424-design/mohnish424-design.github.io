import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { Page, PageHeader } from "@/components/AppShell";
import { EmptyState, ProgressBar, SectionTitle, subjectClasses } from "@/components/bits";
import { ChapterPicker } from "@/components/ChapterPicker";
import { useStore } from "@/lib/store";
import { subjectProgress } from "@/lib/progress";
import { SUBJECTS, subjectMeta, type SubjectId } from "@/lib/syllabus";
import {
  chapterRemainingWorkload,
  doneRevisionCount,
  extraRemaining,
  fmtMinutes,
  isChapterLearned,
  lectureRemaining,
} from "@/lib/scheduler";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/subjects/$subjectId")({
  head: () => ({
    meta: [
      { title: "Subject chapters · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "All chapters for this subject with PW lecture progress, extra-question progress and remaining workload.",
      },
      { property: "og:title", content: "Subject chapters · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "Chapter-level Class 10 CBSE tracking for lectures, practice and revision.",
      },
    ],
  }),
  component: SubjectPage,
});

function SubjectPage() {
  const { subjectId } = useParams({ from: "/subjects/$subjectId" });
  const subject = (SUBJECTS.find((s) => s.id === subjectId)?.id ?? "math") as SubjectId;
  const { state, activeExam, plan, addChapter, removeChapter } = useStore();
  const [adding, setAdding] = useState(false);

  if (!activeExam || !plan) {
    return (
      <>
        <PageHeader title="Subject" />
        <Page>
          <EmptyState title="No exam yet" description="Create an exam first." />
        </Page>
      </>
    );
  }

  const meta = subjectMeta(subject);
  const prog = subjectProgress(state, activeExam, subject);
  const c = subjectClasses[subject];

  const upcoming = plan.days
    .flatMap((d) => d.tasks.map((t) => ({ ...t, date: d.date })))
    .filter((t) => t.subject === subject && state.marks[t.id] !== "done")
    .slice(0, 5);

  return (
    <>
      <PageHeader title={meta.name} subtitle={`${activeExam.name} · ${prog.overallPct}% done`} />
      <Page>
        <div className="card-surface space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Overall progress</span>
            <span className={cn("font-display text-xl font-bold", c.text)}>
              {prog.overallPct}%
            </span>
          </div>
          <ProgressBar value={prog.overallPct} barClass={c.bar} />
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-muted-foreground">Lectures</p>
              <p className="font-semibold">{fmtMinutes(prog.lectureRemainingMinutes)} left</p>
            </div>
            <div>
              <p className="text-muted-foreground">Extra Qs</p>
              <p className="font-semibold">{fmtMinutes(prog.extraRemainingMinutes)} left</p>
            </div>
            <div>
              <p className="text-muted-foreground">Revision</p>
              <p className="font-semibold">{fmtMinutes(prog.revisionRemaining)} left</p>
            </div>
          </div>
        </div>

        <SectionTitle
          right={
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <Plus className="h-3.5 w-3.5" /> Add chapters
            </button>
          }
        >
          Chapters in exam ({prog.chapters.length})
        </SectionTitle>

        {adding ? (
          <div className="card-surface p-3">
            <ChapterPicker
              subjects={[subject]}
              selected={prog.chapters.map((ch) => ({ subject, key: ch.key }))}
              onToggle={(s, key) => {
                const existing = prog.chapters.find((ch) => ch.key === key);
                if (existing) removeChapter(activeExam.id, existing.id);
                else {
                  addChapter(activeExam.id, s, key);
                  toast.success("Chapter added — schedule recalculated");
                }
              }}
            />
          </div>
        ) : null}

        {prog.chapters.length === 0 ? (
          <EmptyState
            title="No chapters selected"
            description="Add chapters from the CBSE syllabus to start tracking."
          />
        ) : (
          <div className="space-y-2">
            {prog.chapters.map((ch) => {
              const lecPct = ch.lectures ? (ch.lecturesDone / ch.lectures) * 100 : 0;
              const extraPct = ch.extraMinutes
                ? (Math.min(ch.extraMinutes, ch.extraDoneMinutes) / ch.extraMinutes) * 100
                : 100;
              const remaining = chapterRemainingWorkload(ch, doneRevisionCount(state, ch.id));
              return (
                <div key={ch.id} className="card-surface p-3">
                  <div className="flex items-start gap-2">
                    <Link
                      to="/chapters/$chapterId"
                      params={{ chapterId: ch.id }}
                      className="min-w-0 flex-1"
                    >
                      <p className="font-semibold">{ch.name}</p>
                      {ch.section ? (
                        <p className="text-[11px] text-muted-foreground">{ch.section}</p>
                      ) : null}
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="w-20 shrink-0 text-muted-foreground">Lectures</span>
                          <ProgressBar value={lecPct} barClass={c.bar} className="h-1.5" />
                          <span className="w-14 shrink-0 text-right font-semibold">
                            {ch.lecturesDone}/{ch.lectures}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="w-20 shrink-0 text-muted-foreground">Extra Qs</span>
                          <ProgressBar value={extraPct} barClass={c.bar} className="h-1.5" />
                          <span className="w-14 shrink-0 text-right font-semibold">
                            {Math.round(extraPct)}%
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {isChapterLearned(ch)
                          ? "Learning complete · revision scheduled"
                          : `${fmtMinutes(remaining)} remaining · lectures ${fmtMinutes(
                              lectureRemaining(ch),
                            )}, extra ${fmtMinutes(extraRemaining(ch))}`}
                      </p>
                    </Link>
                    <div className="flex flex-col items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <button
                        type="button"
                        aria-label="Remove chapter"
                        onClick={() => {
                          removeChapter(activeExam.id, ch.id);
                          toast("Chapter removed from this exam");
                        }}
                        className="tap text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <SectionTitle>Upcoming tasks</SectionTitle>
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing pending" description="This subject is fully planned." />
        ) : (
          <div className="card-surface divide-y divide-border">
            {upcoming.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 text-sm">
                <span className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">
                  {format(parseISO(t.date), "d MMM")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{t.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t.detail}
                  </span>
                </span>
                <span className="text-xs font-semibold">{fmtMinutes(t.minutes)}</span>
              </div>
            ))}
          </div>
        )}
      </Page>
    </>
  );
}
