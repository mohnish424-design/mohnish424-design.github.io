import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { DEFAULT_SYLLABUS, SUBJECTS, type SubjectId } from "@/lib/syllabus";
import { cn } from "@/lib/utils";
import { subjectClasses } from "./bits";

export interface PickedChapter {
  subject: SubjectId;
  key: string;
}

export function ChapterPicker({
  subjects,
  selected,
  onToggle,
  disabledKeys = [],
}: {
  subjects: SubjectId[];
  selected: PickedChapter[];
  onToggle: (subject: SubjectId, key: string) => void;
  disabledKeys?: string[];
}) {
  const [tab, setTab] = useState<SubjectId>(subjects[0] ?? "math");
  const [q, setQ] = useState("");
  const activeTab = subjects.includes(tab) ? tab : (subjects[0] ?? "math");

  const list = useMemo(() => {
    const chapters = DEFAULT_SYLLABUS[activeTab].filter((c) =>
      c.name.toLowerCase().includes(q.toLowerCase()),
    );
    const groups: { section: string; items: typeof chapters }[] = [];
    chapters.forEach((c) => {
      const section = c.section ?? "Chapters";
      const g = groups.find((x) => x.section === section);
      if (g) g.items.push(c);
      else groups.push({ section, items: [c] });
    });
    return groups;
  }, [activeTab, q]);

  const isSelected = (key: string) => selected.some((s) => s.key === key);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {SUBJECTS.filter((s) => subjects.includes(s.id)).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            className={cn(
              "tap flex-1 rounded-xl border px-3 py-2 text-xs font-semibold",
              activeTab === s.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {s.emoji} {s.short}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search chapters"
          className="w-full rounded-xl border border-border bg-card py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-4">
        {list.map((group) => (
          <div key={group.section} className="space-y-2">
            {group.section !== "Chapters" ? (
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {group.section}
              </p>
            ) : null}
            <div className="space-y-1.5">
              {group.items.map((c) => {
                const on = isSelected(c.key);
                const disabled = disabledKeys.includes(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggle(activeTab, c.key)}
                    className={cn(
                      "tap flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm",
                      on
                        ? cn("border-transparent", subjectClasses[activeTab].bg)
                        : "border-border bg-card",
                      disabled && "opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                        on
                          ? cn("border-transparent", subjectClasses[activeTab].bar)
                          : "border-border",
                      )}
                    >
                      {on ? <Check className="h-3.5 w-3.5 text-background" /> : null}
                    </span>
                    <span className="font-medium">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
