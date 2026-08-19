import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Page, PageHeader } from "@/components/AppShell";
import { EmptyState, SectionTitle } from "@/components/bits";
import { useStore } from "@/lib/store";
import { fmtMinutes } from "@/lib/scheduler";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "Adjust daily study time, weekend hours, start time and reminders — the timetable recalculates instantly.",
      },
      { property: "og:title", content: "Settings · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "Control study capacity, daily limits and app data for your Class 10 planner.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, activeExam, plan, setName, updateExam, setNotifications, resetAll } = useStore();

  const setAvail = (patch: Partial<NonNullable<typeof activeExam>["availability"]>) => {
    if (!activeExam) return;
    updateExam(activeExam.id, {
      availability: { ...activeExam.availability, ...patch },
    });
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Study time & preferences" />
      <Page>
        <SectionTitle>Profile</SectionTitle>
        <div className="card-surface p-4">
          <label className="space-y-1">
            <span className="block text-[11px] font-semibold text-muted-foreground">
              Your name
            </span>
            <input
              value={state.studentName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
          </label>
        </div>

        <SectionTitle>Daily study time</SectionTitle>
        {!activeExam ? (
          <EmptyState title="No active exam" description="Create an exam to set study hours." />
        ) : (
          <div className="card-surface space-y-4 p-4">
            <Slider
              label="Weekdays (Mon–Fri)"
              value={activeExam.availability.weekday}
              onChange={(v) => setAvail({ weekday: v })}
            />
            <Slider
              label="Saturday"
              value={activeExam.availability.saturday}
              onChange={(v) => setAvail({ saturday: v })}
            />
            <Slider
              label="Sunday"
              value={activeExam.availability.sunday}
              onChange={(v) => setAvail({ sunday: v })}
            />

            <label className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm">
                <span className="block font-medium">Daily maximum</span>
                <span className="block text-[11px] text-muted-foreground">
                  Never schedule more than this in one day
                </span>
              </span>
              <input
                type="number"
                min={30}
                step={30}
                value={activeExam.availability.dailyMax ?? ""}
                placeholder="off"
                onChange={(e) =>
                  setAvail({
                    dailyMax: e.target.value ? Math.max(30, Number(e.target.value)) : null,
                  })
                }
                className="w-24 rounded-lg border border-border bg-card px-3 py-2 text-right text-sm"
              />
            </label>

            <label className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm font-medium">Study start time</span>
              <input
                type="time"
                value={activeExam.availability.startTime}
                onChange={(e) => setAvail({ startTime: e.target.value })}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              />
            </label>

            {plan ? (
              <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                Available before exam: <strong>{fmtMinutes(plan.capacity)}</strong> · required{" "}
                <strong>{fmtMinutes(plan.totalNeed)}</strong>
                {plan.shortage > 0
                  ? ` · short by ${fmtMinutes(plan.shortage)} — increase daily time or trim chapters.`
                  : " · your plan fits comfortably."}
              </p>
            ) : null}
          </div>
        )}

        <SectionTitle>Reminders</SectionTitle>
        <div className="card-surface p-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">
              <span className="block font-medium">Daily study reminder</span>
              <span className="block text-[11px] text-muted-foreground">
                Show today&apos;s tasks when you open the app
              </span>
            </span>
            <input
              type="checkbox"
              checked={state.notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-5 w-5 accent-current"
            />
          </label>
        </div>

        <SectionTitle>Data</SectionTitle>
        <div className="card-surface space-y-2 p-4">
          <p className="text-xs text-muted-foreground">
            Everything is stored privately on this device. Resetting removes all exams, chapters
            and progress.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all data? This cannot be undone.")) {
                resetAll();
                toast("All data cleared");
              }
            }}
            className="tap w-full rounded-xl border border-destructive/40 py-2.5 text-sm font-semibold text-destructive"
          >
            Reset all data
          </button>
        </div>
      </Page>
    </>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-primary">{fmtMinutes(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={600}
        step={15}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-current"
        aria-label={label}
      />
    </div>
  );
}
