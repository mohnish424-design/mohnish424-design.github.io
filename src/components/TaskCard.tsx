import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Check, ChevronRight, Clock, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/scheduler";
import { fmtMinutes } from "@/lib/scheduler";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SubjectChip, subjectClasses } from "./bits";

const kindLabel: Record<Task["kind"], string> = {
  lecture: "PW Lecture",
  extra: "Extra Questions",
  revision: "Revision",
  custom: "Personal",
};

export function TaskCard({ task, date }: { task: Task; date: string }) {
  const { state, markTask, pinTask, setTaskDuration, deleteCustomTask } = useStore();
  const [open, setOpen] = useState(false);
  const [moveDate, setMoveDate] = useState(date);
  const mark = state.marks[task.id];
  const done = mark === "done";
  const missed = mark === "missed";
  const accent = task.subject ? subjectClasses[task.subject] : null;

  return (
    <div
      className={cn(
        "card-surface overflow-hidden transition-all",
        done && "opacity-60",
        missed && "border-danger/40",
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          aria-label={done ? "Mark as not done" : "Mark complete"}
          onClick={() => {
            markTask(task.id, done ? null : "done", task.minutes);
            if (!done) toast.success("Task completed — schedule updated");
          }}
          className={cn(
            "tap mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
            done ? "border-success bg-success" : "border-border",
          )}
        >
          {done ? <Check className="h-3.5 w-3.5 text-background" /> : null}
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {task.subject ? <SubjectChip subject={task.subject} /> : null}
            <span className="text-[11px] font-semibold text-muted-foreground">
              {kindLabel[task.kind]}
            </span>
            {missed ? (
              <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger">
                MISSED · rescheduled
              </span>
            ) : null}
          </div>
          <p className={cn("mt-1 font-semibold", done && "line-through")}>{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.detail}</p>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              accent ? cn(accent.bg, accent.text) : "bg-muted text-muted-foreground",
            )}
          >
            {fmtMinutes(task.minutes)}
          </span>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
        </div>
      </div>

      {open ? (
        <div className="space-y-3 border-t border-border bg-muted/40 p-3">
          <div className="flex flex-wrap gap-2">
            {!done && (
              <button
                type="button"
                onClick={() => {
                  markTask(task.id, missed ? null : "missed");
                  toast(missed ? "Marked as pending" : "Missed — it will be rescheduled");
                }}
                className="tap flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold"
              >
                {missed ? <Undo2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                {missed ? "Undo missed" : "Mark missed"}
              </button>
            )}
            {done && (
              <button
                type="button"
                onClick={() => markTask(task.id, null)}
                className="tap flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold"
              >
                <Undo2 className="h-3.5 w-3.5" /> Undo complete
              </button>
            )}
            {task.chapterId ? (
              <Link
                to="/chapters/$chapterId"
                params={{ chapterId: task.chapterId }}
                className="tap rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold"
              >
                Open chapter
              </Link>
            ) : null}
            {task.kind === "custom" ? (
              <button
                type="button"
                onClick={() => deleteCustomTask(task.id.replace("custom|", ""))}
                className="tap rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-danger"
              >
                Delete task
              </button>
            ) : null}
          </div>

          {task.kind !== "custom" ? (
            <>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CalendarClock className="h-4 w-4" /> Move to
                <input
                  type="date"
                  value={moveDate}
                  onChange={(e) => {
                    setMoveDate(e.target.value);
                    pinTask(task.id, e.target.value);
                    toast.success("Task moved — rest of the plan adjusted");
                  }}
                  className="ml-auto rounded-lg border border-border bg-card px-2 py-1.5 text-xs"
                />
              </label>
              {state.pins[task.id] ? (
                <button
                  type="button"
                  onClick={() => pinTask(task.id, null)}
                  className="text-xs font-semibold text-primary"
                >
                  Let the scheduler decide again
                </button>
              ) : null}
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Clock className="h-4 w-4" /> Duration (min)
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={task.minutes}
                  onChange={(e) => setTaskDuration(task.id, Number(e.target.value))}
                  className="ml-auto w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-right text-xs"
                />
              </label>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
