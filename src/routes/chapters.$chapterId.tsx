import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Page, PageHeader } from "@/components/AppShell";
import { EmptyState, ProgressBar, SectionTitle, SubjectChip, subjectClasses } from "@/components/bits";
import { useStore } from "@/lib/store";
import {
  REVISION_COUNT,
  chapterRevisionUnit,
  doneRevisionCount,
  extraRemaining,
  fmtMinutes,
  lectureRemaining,
} from "@/lib/scheduler";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chapters/$chapterId")({
  head: () => ({
    meta: [
      { title: "Chapter tracker · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "Track PW lectures one by one, log extra-question practice and see the revision dates planned for this chapter.",
      },
      { property: "og:title", content: "Chapter tracker · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "Per-chapter lecture, practice and revision tracking for Class 10 CBSE.",
      },
    ],
  }),
  component: ChapterPage,
});

function ChapterPage() {
  const { chapterId } = useParams({ from: "/chapters/$chapterId" });
  const { state, activeExam, plan, updateChapter, markTask } = useStore();

  const chapter = activeExam?.chapters.find((c) => c.id === chapterId);

  if (!activeExam || !plan || !chapter) {
    return (
      <>
        <PageHeader title="Chapter" />
        <Page>
          <EmptyState
            title="Chapter not found"
            description="It may have been removed from this exam."
          />
        </Page>
      </>
    );
  }

  const c = subjectClasses[chapter.subject];
  const lectureTotalMin = chapter.lectures * chapter.lectureMinutes;
  const revUnit = chapterRevisionUnit(chapter);
  const revDone = doneRevisionCount(state, chapter.id);
  const totalWorkload = lectureTotalMin + chapter.extraMinutes + revUnit * REVISION_COUNT;
  const revisions = plan.chapterRevisions[chapter.id] ?? [];
  const nextTask = plan.days
    .flatMap((d) => d.tasks.map((t) => ({ ...t, date: d.date })))
    .find((t) => t.chapterId === chapter.id && state.marks[t.id] !== "done");

  const setLecturesDone = (n: number) => {
    const clamped = Math.max(0, Math.min(chapter.lectures, n));
    updateChapter(activeExam.id, chapter.id, { lecturesDone: clamped });
    // keep task marks in sync
    for (let i = 1; i <= chapter.lectures; i++) {
      markTask(`${chapter.id}|lec|${i}`, i <= clamped ? "done" : null);
    }
  };

  const addExtraMinutes = (delta: number) =>
    updateChapter(activeExam.id, chapter.id, {
      extraDoneMinutes: Math.max(
        0,
        Math.min(chapter.extraMinutes, chapter.extraDoneMinutes + delta),
      ),
    });

  return (
    <>
      <PageHeader title={chapter.name} subtitle={activeExam.name} />
      <Page>
        <div className="card-surface space-y-2 p-4">
          <div className="flex items-center justify-between">
            <SubjectChip subject={chapter.subject} />
            {chapter.section ? (
              <span className="text-xs text-muted-foreground">{chapter.section}</span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">Total estimated workload</p>
          <p className="font-display text-2xl font-bold">{fmtMinutes(totalWorkload)}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-muted-foreground">Lectures</p>
              <p className="font-semibold">{fmtMinutes(lectureTotalMin)}</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-muted-foreground">Extra Qs</p>
              <p className="font-semibold">{fmtMinutes(chapter.extraMinutes)}</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <p className="text-muted-foreground">Revision</p>
              <p className="font-semibold">{fmtMinutes(revUnit * REVISION_COUNT)}</p>
            </div>
          </div>
        </div>

        <SectionTitle>PW Lectures</SectionTitle>
        <div className="card-surface space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-[11px] font-semibold text-muted-foreground">
                Number of lectures
              </span>
              <input
                type="number"
                min={0}
                value={chapter.lectures}
                onChange={(e) =>
                  updateChapter(activeExam.id, chapter.id, {
                    lectures: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-semibold text-muted-foreground">
                Average duration (min)
              </span>
              <input
                type="number"
                min={5}
                step={5}
                value={chapter.lectureMinutes}
                onChange={(e) =>
                  updateChapter(activeExam.id, chapter.id, {
                    lectureMinutes: Math.max(5, Number(e.target.value)),
                  })
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              />
            </label>
          </div>

          <ProgressBar
            value={chapter.lectures ? (chapter.lecturesDone / chapter.lectures) * 100 : 0}
            barClass={c.bar}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">
              {chapter.lecturesDone} / {chapter.lectures} completed
            </span>
            <span className="text-muted-foreground">
              Remaining {fmtMinutes(lectureRemaining(chapter))}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: chapter.lectures }, (_, i) => i + 1).map((n) => {
              const done = n <= chapter.lecturesDone;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLecturesDone(done ? n - 1 : n)}
                  className={cn(
                    "tap h-9 w-9 rounded-lg border text-xs font-bold",
                    done
                      ? cn("border-transparent text-background", c.bar)
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="mx-auto h-4 w-4" /> : n}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setLecturesDone(chapter.lecturesDone + 1)}
            disabled={chapter.lecturesDone >= chapter.lectures}
            className="tap w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Mark next lecture complete
          </button>
        </div>

        <SectionTitle>Extra Questions</SectionTitle>
        <div className="card-surface space-y-3 p-4">
          <label className="space-y-1">
            <span className="block text-[11px] font-semibold text-muted-foreground">
              Estimated time (minutes)
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step={15}
                value={chapter.extraMinutes}
                onChange={(e) =>
                  updateChapter(activeExam.id, chapter.id, {
                    extraMinutes: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  updateChapter(activeExam.id, chapter.id, {
                    extraMinutes: 90,
                    extraUnknown: true,
                  });
                  toast("Using the default 1h 30m estimate");
                }}
                className="tap shrink-0 rounded-lg border border-border px-3 text-xs font-semibold"
              >
                I don&apos;t know
              </button>
            </div>
          </label>
          <ProgressBar
            value={
              chapter.extraMinutes
                ? (Math.min(chapter.extraMinutes, chapter.extraDoneMinutes) /
                    chapter.extraMinutes) *
                  100
                : 100
            }
            barClass={c.bar}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">
              {fmtMinutes(chapter.extraDoneMinutes)} done
            </span>
            <span className="text-muted-foreground">
              Remaining {fmtMinutes(extraRemaining(chapter))}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addExtraMinutes(-15)}
              className="tap flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-2 text-xs font-semibold"
            >
              <Minus className="h-3.5 w-3.5" /> 15m
            </button>
            <button
              type="button"
              onClick={() => addExtraMinutes(15)}
              className="tap flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-2 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> 15m
            </button>
            <button
              type="button"
              onClick={() =>
                updateChapter(activeExam.id, chapter.id, {
                  extraDoneMinutes: chapter.extraMinutes,
                })
              }
              className="tap flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground"
            >
              Mark completed
            </button>
          </div>
        </div>

        <SectionTitle>Schedule</SectionTitle>
        <div className="card-surface divide-y divide-border text-sm">
          <Row
            label="Next study session"
            value={
              nextTask
                ? `${format(parseISO(nextTask.date), "d MMM")} · ${nextTask.detail}`
                : "Nothing pending"
            }
          />
          {Array.from({ length: REVISION_COUNT }, (_, i) => i).map((i) => {
            const r = revisions[i];
            const marked = state.marks[`${chapter.id}|rev|${i + 1}`] === "done";
            return (
              <Row
                key={i}
                label={`Revision ${i + 1}`}
                value={marked ? "Completed" : r ? format(parseISO(r.date), "d MMM") : "—"}
                hint={r?.type}
              />
            );
          })}
          <Row label="Revisions completed" value={`${revDone} / ${REVISION_COUNT}`} />
        </div>

        <Link
          to="/subjects/$subjectId"
          params={{ subjectId: chapter.subject }}
          className="tap card-surface block p-3 text-center text-sm font-semibold text-primary"
        >
          Back to subject
        </Link>
      </Page>
    </>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">
        <span className="block font-semibold">{value}</span>
        {hint ? <span className="block text-[11px] text-muted-foreground">{hint}</span> : null}
      </span>
    </div>
  );
}
