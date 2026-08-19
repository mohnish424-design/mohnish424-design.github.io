import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Page, PageHeader } from "@/components/AppShell";
import { EmptyState, SectionTitle, SubjectChip } from "@/components/bits";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exams/")({
  head: () => ({
    meta: [
      { title: "My exams · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "Manage upcoming Class 10 exams, switch the active exam and see days remaining for each one.",
      },
      { property: "og:title", content: "My exams · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "All your upcoming Class 10 CBSE exams with countdowns and chapter counts.",
      },
    ],
  }),
  component: ExamsPage,
});

function ExamsPage() {
  const { state, setActiveExam, deleteExam } = useStore();
  const exams = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <PageHeader title="My exams" subtitle="Switch or add an exam" />
      <Page>
        <Link
          to="/exams/new"
          className="tap flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add new exam
        </Link>

        <SectionTitle>Upcoming</SectionTitle>
        {exams.length === 0 ? (
          <EmptyState title="No exams" description="Add your first exam to build a plan." />
        ) : (
          <div className="space-y-2">
            {exams.map((e) => {
              const days = differenceInCalendarDays(parseISO(e.date), new Date());
              const active = e.id === state.activeExamId;
              return (
                <div
                  key={e.id}
                  className={cn(
                    "card-surface p-4",
                    active && "ring-2 ring-primary",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveExam(e.id);
                        toast.success(`Now planning for ${e.name}`);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="flex items-center gap-2 font-semibold">
                        {e.name}
                        {active ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(e.date), "EEEE, d MMM yyyy")} ·{" "}
                        {days >= 0 ? `${days} days left` : "past"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {e.subjects.map((s) => (
                          <SubjectChip key={s} subject={s} />
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {e.chapters.length} chapters · {e.availability.weekday}m weekdays ·{" "}
                        {e.availability.sunday}m Sundays
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label="Delete exam"
                      onClick={() => {
                        deleteExam(e.id);
                        toast("Exam deleted");
                      }}
                      className="tap text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Page>
    </>
  );
}
