import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { Exam, ExamChapter, AppState } from "./types";
import type { SubjectId } from "./syllabus";

export type TaskKind = "lecture" | "extra" | "revision" | "custom";

export interface Task {
  id: string;
  kind: TaskKind;
  chapterId?: string;
  chapterName?: string;
  subject?: SubjectId;
  title: string;
  detail: string;
  minutes: number;
  revisionIndex?: number;
  revisionType?: string;
}

export interface DayPlan {
  date: string; // yyyy-MM-dd
  capacity: number;
  used: number;
  tasks: Task[];
  phase: "learning" | "revision" | "exam";
}

export interface Plan {
  days: DayPlan[];
  byDate: Record<string, DayPlan>;
  deadline: string | null;
  examDate: string;
  daysToExam: number;
  daysToDeadline: number;
  learningNeed: number;
  revisionNeed: number;
  totalNeed: number;
  capacity: number;
  shortage: number;
  confidence: "comfortable" | "tight" | "overloaded";
  unscheduled: Task[];
  chapterFinish: Record<string, string>;
  chapterRevisions: Record<string, { date: string; type: string }[]>;
  chaptersRemaining: number;
}

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

export const fmtMinutes = (m: number) => {
  const mins = Math.max(0, Math.round(m));
  const h = Math.floor(mins / 60);
  const r = mins % 60;
  if (h && r) return `${h}h ${r}m`;
  if (h) return `${h}h`;
  return `${r}m`;
};

export const chapterLearningTotal = (c: ExamChapter) =>
  c.lectures * c.lectureMinutes + c.extraMinutes;

export const chapterRevisionUnit = (c: ExamChapter) =>
  Math.min(45, Math.max(20, Math.round((chapterLearningTotal(c) * 0.15) / 3 / 5) * 5));

export const REVISION_COUNT = 3;

export const chapterRevisionTotal = (c: ExamChapter) =>
  chapterRevisionUnit(c) * REVISION_COUNT;

export const lectureRemaining = (c: ExamChapter) =>
  Math.max(0, c.lectures - c.lecturesDone) * c.lectureMinutes;

export const extraRemaining = (c: ExamChapter) =>
  Math.max(0, c.extraMinutes - c.extraDoneMinutes);

export const chapterTotalWorkload = (c: ExamChapter) =>
  chapterLearningTotal(c) + chapterRevisionTotal(c);

export const chapterRemainingWorkload = (c: ExamChapter, doneRevisions: number) =>
  lectureRemaining(c) +
  extraRemaining(c) +
  Math.max(0, REVISION_COUNT - doneRevisions) * chapterRevisionUnit(c);

export const isChapterLearned = (c: ExamChapter) =>
  c.lecturesDone >= c.lectures && c.extraDoneMinutes >= c.extraMinutes;

const REVISION_TYPES_SCI = [
  "Review formulas & key concepts",
  "Practice questions on tricky parts",
  "Quick recall + previous mistakes",
];
const REVISION_TYPES_SST = [
  "Read notes & highlight key points",
  "Active recall of dates, causes & effects",
  "Quick recall + previous mistakes",
];

export const revisionType = (subject: SubjectId, i: number) =>
  (subject === "sst" ? REVISION_TYPES_SST : REVISION_TYPES_SCI)[i] ?? "Quick recall";

export const dayCapacity = (exam: Exam, date: Date) => {
  const d = date.getDay();
  const a = exam.availability;
  let cap = d === 0 ? a.sunday : d === 6 ? a.saturday : a.weekday;
  if (a.dailyMax && a.dailyMax > 0) cap = Math.min(cap, a.dailyMax);
  return Math.max(0, cap);
};

export const doneRevisionCount = (state: AppState, chapterId: string) => {
  let n = 0;
  for (let i = 1; i <= REVISION_COUNT; i++) {
    if (state.marks[`${chapterId}|rev|${i}`] === "done") n++;
  }
  return n;
};

const EXTRA_CHUNK = 45;

function buildChapterTasks(state: AppState, c: ExamChapter) {
  const lectures: Task[] = [];
  for (let n = c.lecturesDone + 1; n <= c.lectures; n++) {
    lectures.push({
      id: `${c.id}|lec|${n}`,
      kind: "lecture",
      chapterId: c.id,
      chapterName: c.name,
      subject: c.subject,
      title: `${c.name}`,
      detail: `PW Lecture ${n} of ${c.lectures}`,
      minutes: c.lectureMinutes,
    });
  }
  const extras: Task[] = [];
  let rem = extraRemaining(c);
  let idx = Math.floor(c.extraDoneMinutes / EXTRA_CHUNK);
  while (rem > 0) {
    const m = Math.min(EXTRA_CHUNK, rem);
    idx++;
    extras.push({
      id: `${c.id}|extra|${idx}`,
      kind: "extra",
      chapterId: c.id,
      chapterName: c.name,
      subject: c.subject,
      title: `${c.name}`,
      detail: `Extra questions · session ${idx}`,
      minutes: m,
    });
    rem -= m;
  }
  const revisions: Task[] = [];
  const unit = chapterRevisionUnit(c);
  for (let i = 1; i <= REVISION_COUNT; i++) {
    if (state.marks[`${c.id}|rev|${i}`] === "done") continue;
    revisions.push({
      id: `${c.id}|rev|${i}`,
      kind: "revision",
      chapterId: c.id,
      chapterName: c.name,
      subject: c.subject,
      title: `${c.name}`,
      detail: `Revision ${i} · ${revisionType(c.subject, i - 1)}`,
      minutes: unit,
      revisionIndex: i,
      revisionType: revisionType(c.subject, i - 1),
    });
  }
  return { lectures, extras, revisions };
}

export function buildPlan(state: AppState, exam: Exam, fromISO = todayISO()): Plan {
  const start = parseISO(fromISO);
  const examDate = parseISO(exam.date);
  const daysToExam = differenceInCalendarDays(examDate, start);
  const span = Math.max(0, daysToExam);

  const days: DayPlan[] = [];
  for (let i = 0; i <= Math.max(span, 0); i++) {
    const d = addDays(start, i);
    const iso = format(d, "yyyy-MM-dd");
    const isExam = iso === exam.date;
    days.push({
      date: iso,
      capacity: isExam ? 0 : dayCapacity(exam, d),
      used: 0,
      tasks: [],
      phase: isExam ? "exam" : "learning",
    });
  }

  const chapters = exam.chapters;
  const perChapter = chapters.map((c) => ({ c, ...buildChapterTasks(state, c) }));

  const pinnedIds = new Set(Object.keys(state.pins));
  const durationOf = (t: Task) => state.durations[t.id] ?? t.minutes;

  const learningNeed = perChapter.reduce(
    (s, p) =>
      s +
      p.lectures.reduce((a, t) => a + durationOf(t), 0) +
      p.extras.reduce((a, t) => a + durationOf(t), 0),
    0,
  );
  const revisionNeed = perChapter.reduce(
    (s, p) => s + p.revisions.reduce((a, t) => a + durationOf(t), 0),
    0,
  );
  const totalNeed = learningNeed + revisionNeed;
  const schedulable = days.filter((d) => d.phase !== "exam");
  const capacity = schedulable.reduce((s, d) => s + d.capacity, 0);

  // Place fixed items first: custom tasks and pinned tasks.
  const byDate: Record<string, DayPlan> = {};
  days.forEach((d) => (byDate[d.date] = d));

  for (const ct of state.customTasks.filter((t) => t.examId === exam.id)) {
    const day = byDate[ct.date];
    if (!day) continue;
    day.tasks.push({
      id: `custom|${ct.id}`,
      kind: "custom",
      title: ct.title,
      detail: "Personal task",
      minutes: ct.minutes,
    });
    day.used += ct.minutes;
  }

  const allTasks: Task[] = [];
  perChapter.forEach((p) => allTasks.push(...p.lectures, ...p.extras, ...p.revisions));
  const pinnedPlaced = new Set<string>();
  for (const t of allTasks) {
    if (!pinnedIds.has(t.id)) continue;
    const day = byDate[state.pins[t.id]];
    if (!day || day.phase === "exam") continue;
    day.tasks.push({ ...t, minutes: durationOf(t) });
    day.used += durationOf(t);
    pinnedPlaced.add(t.id);
  }

  // Decide syllabus deadline (split index)
  let reserve = revisionNeed + capacity * 0.12;
  if (learningNeed > capacity - reserve) {
    reserve = Math.max(revisionNeed, capacity - learningNeed);
  }
  let acc = 0;
  let splitIndex = schedulable.length;
  for (let i = schedulable.length - 1; i >= 0; i--) {
    if (acc >= reserve) break;
    acc += schedulable[i].capacity;
    splitIndex = i;
  }
  splitIndex = Math.max(1, Math.min(splitIndex, schedulable.length));
  const learningDays = schedulable.slice(0, splitIndex);
  const revisionDays = schedulable.slice(splitIndex);
  learningDays.forEach((d) => (d.phase = "learning"));
  revisionDays.forEach((d) => (d.phase = "revision"));
  const deadline = learningDays.length
    ? learningDays[learningDays.length - 1].date
    : null;

  // Learning queue: per-subject queues, chapter order preserved.
  const subjects: SubjectId[] = ["math", "science", "sst"];
  const queues: Record<string, Task[]> = { math: [], science: [], sst: [] };
  for (const p of perChapter) {
    const pending = [...p.lectures, ...p.extras].filter((t) => !pinnedPlaced.has(t.id));
    queues[p.c.subject].push(...pending);
  }

  const unscheduled: Task[] = [];
  const chapterFinish: Record<string, string> = {};

  const fillDays = (target: DayPlan[]) => {
    for (const day of target) {
      if (day.capacity - day.used < 15) continue;
      let guard = 0;
      // round-robin subjects, but keep 2 consecutive tasks of the same chapter
      // to avoid excessive switching
      let subjPtr = 0;
      while (day.capacity - day.used >= 15 && guard++ < 60) {
        const order = subjects
          .slice(subjPtr)
          .concat(subjects.slice(0, subjPtr))
          .filter((s) => queues[s].length);
        if (!order.length) return;
        let placed = false;
        for (const s of order) {
          const q = queues[s];
          const next = q[0];
          if (!next) continue;
          const mins = durationOf(next);
          if (day.used + mins > day.capacity) continue;
          q.shift();
          day.tasks.push({ ...next, minutes: mins });
          day.used += mins;
          if (next.chapterId) chapterFinish[next.chapterId] = day.date;
          // try one more from same chapter
          const follow = q[0];
          if (
            follow &&
            follow.chapterId === next.chapterId &&
            day.used + durationOf(follow) <= day.capacity
          ) {
            q.shift();
            day.tasks.push({ ...follow, minutes: durationOf(follow) });
            day.used += durationOf(follow);
            if (follow.chapterId) chapterFinish[follow.chapterId] = day.date;
          }
          subjPtr = (subjects.indexOf(s) + 1) % subjects.length;
          placed = true;
          break;
        }
        if (!placed) break;
      }
    }
  };

  fillDays(learningDays);
  // overflow into revision window if needed
  fillDays(revisionDays);
  subjects.forEach((s) => unscheduled.push(...queues[s]));

  // Revision scheduling: spaced after each chapter finishes learning
  const chapterRevisions: Record<string, { date: string; type: string }[]> = {};
  const revTasks: { task: Task; earliest: number }[] = [];
  const dateIndex = (iso: string) => schedulable.findIndex((d) => d.date === iso);

  for (const p of perChapter) {
    const finishISO = chapterFinish[p.c.id];
    let baseIdx = 0;
    if (finishISO) baseIdx = Math.max(0, dateIndex(finishISO));
    const remainingDays = Math.max(1, schedulable.length - baseIdx);
    const gaps = [2, 5, 10].map((g) =>
      Math.max(1, Math.min(g, Math.round((g / 10) * remainingDays))),
    );
    p.revisions.forEach((t) => {
      if (pinnedPlaced.has(t.id)) return;
      const i = (t.revisionIndex ?? 1) - 1;
      const offset = gaps.slice(0, i + 1).reduce((a, b) => a + b, 0);
      revTasks.push({ task: t, earliest: Math.min(baseIdx + offset, schedulable.length - 1) });
    });
  }
  revTasks.sort((a, b) => a.earliest - b.earliest);
  for (const { task, earliest } of revTasks) {
    let placedDay: DayPlan | null = null;
    for (let i = Math.max(0, earliest); i < schedulable.length; i++) {
      const d = schedulable[i];
      if (d.capacity - d.used >= durationOf(task)) {
        placedDay = d;
        break;
      }
    }
    if (!placedDay) {
      for (let i = Math.max(0, earliest) - 1; i >= 0; i--) {
        const d = schedulable[i];
        if (d.capacity - d.used >= durationOf(task)) {
          placedDay = d;
          break;
        }
      }
    }
    if (!placedDay) {
      unscheduled.push(task);
      continue;
    }
    placedDay.tasks.push({ ...task, minutes: durationOf(task) });
    placedDay.used += durationOf(task);
    if (task.chapterId) {
      chapterRevisions[task.chapterId] = chapterRevisions[task.chapterId] ?? [];
      chapterRevisions[task.chapterId].push({
        date: placedDay.date,
        type: task.revisionType ?? "Revision",
      });
    }
  }
  Object.values(chapterRevisions).forEach((list) =>
    list.sort((a, b) => a.date.localeCompare(b.date)),
  );

  // Order tasks inside a day: lectures → extra → revision → custom
  const kindOrder: Record<TaskKind, number> = {
    lecture: 0,
    extra: 1,
    revision: 2,
    custom: 3,
  };
  days.forEach((d) => d.tasks.sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]));

  const shortage = Math.max(0, totalNeed - capacity);
  const ratio = capacity > 0 ? totalNeed / capacity : totalNeed > 0 ? 99 : 0;
  const confidence: Plan["confidence"] =
    unscheduled.length > 0 || ratio > 0.95
      ? "overloaded"
      : ratio > 0.75
        ? "tight"
        : "comfortable";

  const chaptersRemaining = chapters.filter((c) => !isChapterLearned(c)).length;

  return {
    days,
    byDate,
    deadline,
    examDate: exam.date,
    daysToExam,
    daysToDeadline: deadline ? differenceInCalendarDays(parseISO(deadline), start) : 0,
    learningNeed,
    revisionNeed,
    totalNeed,
    capacity,
    shortage,
    confidence,
    unscheduled,
    chapterFinish,
    chapterRevisions,
    chaptersRemaining,
  };
}

export function timetable(day: DayPlan, startTime: string) {
  const [h, m] = startTime.split(":").map(Number);
  let cursor = (h || 16) * 60 + (m || 0);
  const rows: { start: string; end: string; task: Task | null; label: string }[] = [];
  const toStr = (mins: number) =>
    `${String(Math.floor(mins / 60) % 24).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  day.tasks.forEach((t, i) => {
    const s = cursor;
    cursor += t.minutes;
    rows.push({ start: toStr(s), end: toStr(cursor), task: t, label: t.title });
    if (i < day.tasks.length - 1) {
      const bs = cursor;
      cursor += 10;
      rows.push({ start: toStr(bs), end: toStr(cursor), task: null, label: "Break" });
    }
  });
  return rows;
}
