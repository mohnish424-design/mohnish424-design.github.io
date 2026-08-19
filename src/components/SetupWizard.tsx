import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { DEFAULT_SYLLABUS, EXAM_PRESETS, SUBJECTS, type SubjectId } from "@/lib/syllabus";
import { DEFAULT_AVAILABILITY, useStore } from "@/lib/store";
import { fmtMinutes } from "@/lib/scheduler";
import { cn } from "@/lib/utils";
import { ChapterPicker, type PickedChapter } from "./ChapterPicker";

interface Workload {
  lectures: number;
  lectureMinutes: number;
  extraMinutes: number;
}

const STEPS = ["Exam", "Subjects", "Chapters", "Workload", "Time"];

export function SetupWizard({ onDone }: { onDone?: () => void }) {
  const { state, setName, createExam } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setLocalName] = useState(state.studentName);
  const [examName, setExamName] = useState("Half-Yearly");
  const [date, setDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [subjects, setSubjects] = useState<SubjectId[]>(["math", "science", "sst"]);
  const [picked, setPicked] = useState<PickedChapter[]>([]);
  const [workloads, setWorkloads] = useState<Record<string, Workload>>({});
  const [avail, setAvail] = useState({ ...DEFAULT_AVAILABILITY });
  const [dailyMaxOn, setDailyMaxOn] = useState(false);

  const wl = (key: string): Workload =>
    workloads[key] ?? { lectures: 8, lectureMinutes: 45, extraMinutes: 90 };

  const setWl = (key: string, patch: Partial<Workload>) =>
    setWorkloads((w) => ({ ...w, [key]: { ...wl(key), ...patch } }));

  const chapterName = (key: string) => {
    for (const s of SUBJECTS) {
      const c = DEFAULT_SYLLABUS[s.id].find((x) => x.key === key);
      if (c) return c.name;
    }
    return key;
  };

  const totals = useMemo(() => {
    let lect = 0;
    let extra = 0;
    picked.forEach((p) => {
      const w = wl(p.key);
      lect += w.lectures * w.lectureMinutes;
      extra += w.extraMinutes;
    });
    const revision = Math.round((lect + extra) * 0.15);
    return { lect, extra, revision, total: lect + extra + revision };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, workloads]);

  const canNext =
    (step === 0 && examName.trim() && date) ||
    (step === 1 && subjects.length > 0) ||
    (step === 2 && picked.length > 0) ||
    step === 3 ||
    step === 4;

  const finish = () => {
    setName(name);
    createExam({
      name: examName.trim() || "Exam",
      date,
      subjects,
      availability: { ...avail, dailyMax: dailyMaxOn ? avail.dailyMax : null },
      chapterKeys: picked.map((p) => ({ subject: p.subject, key: p.key, ...wl(p.key) })),
    });
    if (onDone) onDone();
    else navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="hero-gradient px-5 pt-10 pb-8 text-white">
        <div className="mx-auto max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-80">
            <Sparkles className="h-4 w-4" /> Class 10 CBSE Planner
          </p>
          <h1 className="font-display mt-2 text-2xl font-bold">
            Let&apos;s build your study plan
          </h1>
          <p className="mt-1 text-sm opacity-85">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all",
                  i <= step ? "bg-white" : "bg-white/30",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 pb-32">
        {step === 0 && (
          <div className="space-y-4 animate-rise">
            <Field label="Your name (optional)">
              <input
                value={name}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="e.g. Aarav"
                className={inputCls}
              />
            </Field>
            <Field label="Exam name">
              <div className="mb-2 flex flex-wrap gap-2">
                {EXAM_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setExamName(p)}
                    className={cn(
                      "tap rounded-full border px-3 py-1.5 text-xs font-semibold",
                      examName === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Exam date">
              <input
                type="date"
                value={date}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3 animate-rise">
            {SUBJECTS.map((s) => {
              const on = subjects.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setSubjects((cur) =>
                      cur.includes(s.id) ? cur.filter((x) => x !== s.id) : [...cur, s.id],
                    )
                  }
                  className={cn(
                    "tap card-surface flex w-full items-center gap-3 p-4 text-left",
                    on && "ring-2 ring-primary",
                  )}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-semibold">{s.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {DEFAULT_SYLLABUS[s.id].length} chapters available
                    </span>
                  </span>
                  <span
                    className={cn(
                      "h-5 w-5 rounded-full border-2",
                      on ? "border-primary bg-primary" : "border-border",
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="animate-rise space-y-3">
            <p className="text-sm text-muted-foreground">
              Pick the chapters included in this exam. {picked.length} selected.
            </p>
            <ChapterPicker
              subjects={subjects}
              selected={picked}
              onToggle={(subject, key) =>
                setPicked((cur) =>
                  cur.some((c) => c.key === key)
                    ? cur.filter((c) => c.key !== key)
                    : [...cur, { subject, key }],
                )
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="animate-rise space-y-3">
            <p className="text-sm text-muted-foreground">
              How much work is each chapter? Totals are calculated for you.
            </p>
            {picked.map((p) => {
              const w = wl(p.key);
              return (
                <div key={p.key} className="card-surface space-y-3 p-4">
                  <p className="font-semibold">{chapterName(p.key)}</p>
                  <div className="space-y-3">
                    <NumField
                      label="Number of PW lectures"
                      value={w.lectures}
                      suffix="lectures"
                      onChange={(v) => setWl(p.key, { lectures: v })}
                    />
                    <NumField
                      label="Average length of one lecture"
                      value={w.lectureMinutes}
                      step={5}
                      suffix="min"
                      onChange={(v) => setWl(p.key, { lectureMinutes: v })}
                    />
                    <NumField
                      label="Extra questions practice"
                      value={w.extraMinutes}
                      step={15}
                      suffix="min"
                      onChange={(v) => setWl(p.key, { extraMinutes: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Lectures {fmtMinutes(w.lectures * w.lectureMinutes)} · Extra{" "}
                      {fmtMinutes(w.extraMinutes)}
                    </span>
                    <button
                      type="button"
                      className="font-semibold text-primary"
                      onClick={() => setWl(p.key, { extraMinutes: 90 })}
                    >
                      I don&apos;t know
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div className="animate-rise space-y-4">
            <NumField
              label="Weekday study time (minutes/day)"
              value={avail.weekday}
              step={15}
              wide
              onChange={(v) => setAvail((a) => ({ ...a, weekday: v }))}
            />
            <NumField
              label="Saturday study time (minutes)"
              value={avail.saturday}
              step={15}
              wide
              onChange={(v) => setAvail((a) => ({ ...a, saturday: v }))}
            />
            <NumField
              label="Sunday study time (minutes)"
              value={avail.sunday}
              step={15}
              wide
              onChange={(v) => setAvail((a) => ({ ...a, sunday: v }))}
            />
            <Field label="Preferred study start time">
              <input
                type="time"
                value={avail.startTime}
                onChange={(e) => setAvail((a) => ({ ...a, startTime: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="card-surface flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">Daily maximum</p>
                <p className="text-xs text-muted-foreground">Cap study time per day</p>
              </div>
              <button
                type="button"
                onClick={() => setDailyMaxOn((v) => !v)}
                className={cn(
                  "tap h-6 w-11 rounded-full p-0.5 transition-colors",
                  dailyMaxOn ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "block h-5 w-5 rounded-full bg-card shadow transition-transform",
                    dailyMaxOn && "translate-x-5",
                  )}
                />
              </button>
            </div>
            {dailyMaxOn ? (
              <NumField
                label="Max minutes per day"
                value={avail.dailyMax ?? 240}
                step={15}
                wide
                onChange={(v) => setAvail((a) => ({ ...a, dailyMax: v }))}
              />
            ) : null}

            <div className="card-surface space-y-1 p-4 text-sm">
              <p className="font-display font-semibold">Estimated workload</p>
              <Row label="PW lectures" value={fmtMinutes(totals.lect)} />
              <Row label="Extra questions" value={fmtMinutes(totals.extra)} />
              <Row label="Revision (auto)" value={fmtMinutes(totals.revision)} />
              <Row label="Total" value={fmtMinutes(totals.total)} strong />
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="tap flex items-center gap-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : null}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1))}
            className="tap flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {step === STEPS.length - 1 ? "Generate my plan" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function NumField({
  label,
  value,
  onChange,
  step = 1,
  wide,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  wide?: boolean;
  suffix?: string;
}) {
  return (
    <label className={cn("block space-y-1", wide && "card-surface p-4")}>
      <span className="block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - step))}
          className="tap h-10 w-10 shrink-0 rounded-lg border border-border text-lg leading-none"
        >
          −
        </button>
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="numeric"
            value={String(value)}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              const raw = e.target.value;
              onChange(raw === "" ? 0 : Math.max(0, Math.floor(Number(raw))));
            }}
            className={cn(
              "w-full rounded-lg border border-border bg-card py-2.5 text-center text-base font-semibold outline-none focus:border-primary",
              suffix ? "pr-12 pl-3" : "px-3",
            )}
          />
          {suffix ? (
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onChange(value + step)}
          className="tap h-10 w-10 shrink-0 rounded-lg border border-border text-lg leading-none"
        >
          +
        </button>
      </div>
    </label>
  );
}


function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={cn(
        "flex justify-between",
        strong ? "border-t border-border pt-1 font-semibold" : "text-muted-foreground",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
