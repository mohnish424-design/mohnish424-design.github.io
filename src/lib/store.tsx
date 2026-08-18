import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addDays, format } from "date-fns";
import type { AppState, Exam, ExamChapter, CustomTask, Availability } from "./types";
import { DEFAULT_SYLLABUS, type SubjectId } from "./syllabus";
import { buildPlan, type Plan } from "./scheduler";

const KEY = "c10-study-planner-v1";

const uid = () => Math.random().toString(36).slice(2, 10);

export const DEFAULT_AVAILABILITY: Availability = {
  weekday: 120,
  saturday: 240,
  sunday: 300,
  dailyMax: null,
  startTime: "16:00",
};

function chapterFromKey(
  subject: SubjectId,
  key: string,
  patch: Partial<ExamChapter> = {},
): ExamChapter | null {
  const src = DEFAULT_SYLLABUS[subject].find((c) => c.key === key);
  if (!src) return null;
  return {
    id: uid(),
    key,
    subject,
    section: src.section,
    name: src.name,
    lectures: 8,
    lectureMinutes: 45,
    lecturesDone: 0,
    extraMinutes: 90,
    extraDoneMinutes: 0,
    ...patch,
  };
}

function sampleState(): AppState {
  const examDate = format(addDays(new Date(), 33), "yyyy-MM-dd");
  const chapters = [
    chapterFromKey("math", "math-4", {
      lectures: 12,
      lectureMinutes: 45,
      lecturesDone: 7,
      extraMinutes: 120,
      extraDoneMinutes: 60,
    }),
    chapterFromKey("math", "math-5", { lectures: 9, lectureMinutes: 45, extraMinutes: 90 }),
    chapterFromKey("science", "sci-11", {
      lectures: 10,
      lectureMinutes: 50,
      lecturesDone: 2,
      extraMinutes: 120,
    }),
    chapterFromKey("science", "sci-1", { lectures: 7, lectureMinutes: 45, extraMinutes: 60 }),
    chapterFromKey("sst", "hist-2", {
      lectures: 8,
      lectureMinutes: 40,
      extraMinutes: 90,
    }),
    chapterFromKey("sst", "geo-1", { lectures: 6, lectureMinutes: 40, extraMinutes: 60 }),
  ].filter(Boolean) as ExamChapter[];

  const exam: Exam = {
    id: uid(),
    name: "Half-Yearly",
    date: examDate,
    subjects: ["math", "science", "sst"],
    chapters,
    availability: { ...DEFAULT_AVAILABILITY },
    createdAt: new Date().toISOString(),
  };

  return {
    version: 1,
    studentName: "",
    exams: [exam],
    activeExamId: exam.id,
    marks: {},
    pins: {},
    durations: {},
    customTasks: [],
    theme: "light",
    notifications: false,
    isSample: true,
    setupDone: false,
  };
}

export function emptyState(): AppState {
  return {
    version: 1,
    studentName: "",
    exams: [],
    activeExamId: null,
    marks: {},
    pins: {},
    durations: {},
    customTasks: [],
    theme: "light",
    notifications: false,
    isSample: false,
    setupDone: true,
  };
}

interface Ctx {
  ready: boolean;
  state: AppState;
  activeExam: Exam | null;
  plan: Plan | null;
  update: (fn: (s: AppState) => AppState) => void;
  setName: (n: string) => void;
  createExam: (data: {
    name: string;
    date: string;
    subjects: SubjectId[];
    availability: Availability;
    chapterKeys: { subject: SubjectId; key: string }[];
  }) => string;
  updateExam: (id: string, patch: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  setActiveExam: (id: string) => void;
  addChapter: (examId: string, subject: SubjectId, key: string) => void;
  removeChapter: (examId: string, chapterId: string) => void;
  updateChapter: (examId: string, chapterId: string, patch: Partial<ExamChapter>) => void;
  markTask: (taskId: string, mark: "done" | "missed" | null, minutes?: number) => void;
  pinTask: (taskId: string, date: string | null) => void;
  setTaskDuration: (taskId: string, minutes: number | null) => void;
  addCustomTask: (t: Omit<CustomTask, "id">) => void;
  deleteCustomTask: (id: string) => void;
  clearSample: () => void;
  resetAll: () => void;
  setTheme: (t: "light" | "dark") => void;
  setNotifications: (v: boolean) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        setState({ ...emptyState(), ...parsed });
      } else {
        setState(sampleState());
      }
    } catch {
      setState(sampleState());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable */
    }
  }, [state, ready]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const patchExam = useCallback(
    (id: string, fn: (e: Exam) => Exam) =>
      setState((s) => ({
        ...s,
        exams: s.exams.map((e) => (e.id === id ? fn(e) : e)),
      })),
    [],
  );

  const value = useMemo<Ctx>(() => {
    const activeExam = state.exams.find((e) => e.id === state.activeExamId) ?? null;
    const plan = activeExam ? buildPlan(state, activeExam) : null;

    return {
      ready,
      state,
      activeExam,
      plan,
      update,
      setName: (n) => setState((s) => ({ ...s, studentName: n })),
      createExam: (data) => {
        const id = uid();
        const chapters = data.chapterKeys
          .map((c) => chapterFromKey(c.subject, c.key))
          .filter(Boolean) as ExamChapter[];
        const exam: Exam = {
          id,
          name: data.name,
          date: data.date,
          subjects: data.subjects,
          chapters,
          availability: data.availability,
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({
          ...s,
          exams: [...s.exams, exam],
          activeExamId: id,
          setupDone: true,
        }));
        return id;
      },
      updateExam: (id, patch) => patchExam(id, (e) => ({ ...e, ...patch })),
      deleteExam: (id) =>
        setState((s) => {
          const exams = s.exams.filter((e) => e.id !== id);
          return {
            ...s,
            exams,
            activeExamId:
              s.activeExamId === id ? (exams[0]?.id ?? null) : s.activeExamId,
          };
        }),
      setActiveExam: (id) => setState((s) => ({ ...s, activeExamId: id })),
      addChapter: (examId, subject, key) =>
        patchExam(examId, (e) => {
          if (e.chapters.some((c) => c.key === key)) return e;
          const ch = chapterFromKey(subject, key);
          if (!ch) return e;
          return {
            ...e,
            subjects: e.subjects.includes(subject) ? e.subjects : [...e.subjects, subject],
            chapters: [...e.chapters, ch],
          };
        }),
      removeChapter: (examId, chapterId) =>
        patchExam(examId, (e) => ({
          ...e,
          chapters: e.chapters.filter((c) => c.id !== chapterId),
        })),
      updateChapter: (examId, chapterId, patch) =>
        patchExam(examId, (e) => ({
          ...e,
          chapters: e.chapters.map((c) => (c.id === chapterId ? { ...c, ...patch } : c)),
        })),
      markTask: (taskId, mark, minutes) =>
        setState((s) => {
          const marks = { ...s.marks };
          if (mark === null) delete marks[taskId];
          else marks[taskId] = mark;

          const parts = taskId.split("|");
          const chapterId = parts[0];
          const kind = parts[1];
          const n = Number(parts[2] ?? 0);
          let exams = s.exams;

          if (mark === "done" && (kind === "lec" || kind === "extra")) {
            exams = s.exams.map((e) => ({
              ...e,
              chapters: e.chapters.map((c) => {
                if (c.id !== chapterId) return c;
                if (kind === "lec") {
                  return { ...c, lecturesDone: Math.max(c.lecturesDone, n) };
                }
                return {
                  ...c,
                  extraDoneMinutes: Math.min(
                    c.extraMinutes,
                    c.extraDoneMinutes + (minutes ?? 45),
                  ),
                };
              }),
            }));
          }
          // completing work removes the pin for that task
          const pins = { ...s.pins };
          if (mark) delete pins[taskId];
          return { ...s, marks, pins, exams };
        }),
      pinTask: (taskId, date) =>
        setState((s) => {
          const pins = { ...s.pins };
          if (date) pins[taskId] = date;
          else delete pins[taskId];
          return { ...s, pins };
        }),
      setTaskDuration: (taskId, minutes) =>
        setState((s) => {
          const durations = { ...s.durations };
          if (minutes && minutes > 0) durations[taskId] = minutes;
          else delete durations[taskId];
          return { ...s, durations };
        }),
      addCustomTask: (t) =>
        setState((s) => ({ ...s, customTasks: [...s.customTasks, { ...t, id: uid() }] })),
      deleteCustomTask: (id) =>
        setState((s) => ({ ...s, customTasks: s.customTasks.filter((t) => t.id !== id) })),
      clearSample: () =>
        setState((s) => ({ ...emptyState(), theme: s.theme, studentName: s.studentName, setupDone: false })),
      resetAll: () => setState({ ...emptyState(), setupDone: false }),
      setTheme: (t) => setState((s) => ({ ...s, theme: t })),
      setNotifications: (v) => setState((s) => ({ ...s, notifications: v })),
    };
  }, [state, ready, update, patchExam]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
