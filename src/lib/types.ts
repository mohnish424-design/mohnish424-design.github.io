import type { SubjectId } from "./syllabus";

export type Status = "not_started" | "in_progress" | "completed";

export interface ExamChapter {
  id: string; // unique within exam
  key: string; // syllabus key
  subject: SubjectId;
  section?: string | undefined;
  name: string;
  lectures: number;
  lectureMinutes: number;
  lecturesDone: number;
  extraMinutes: number; // estimated total
  extraDoneMinutes: number;
  extraUnknown?: boolean | undefined;
}

export interface Availability {
  weekday: number; // minutes
  saturday: number;
  sunday: number;
  dailyMax?: number | null | undefined;
  startTime: string; // "16:00"
}

export interface CustomTask {
  id: string;
  examId: string;
  date: string; // yyyy-MM-dd
  title: string;
  minutes: number;
}

export interface Exam {
  id: string;
  name: string;
  date: string; // yyyy-MM-dd
  subjects: SubjectId[];
  chapters: ExamChapter[];
  availability: Availability;
  createdAt: string;
}

export type TaskMark = "done" | "missed";

export interface AppState {
  version: number;
  studentName: string;
  exams: Exam[];
  activeExamId: string | null;
  marks: Record<string, TaskMark>; // taskId -> mark
  pins: Record<string, string>; // taskId -> yyyy-MM-dd
  durations: Record<string, number>; // taskId -> custom minutes
  customTasks: CustomTask[];
  theme: "light" | "dark";
  notifications: boolean;
  isSample: boolean;
  setupDone: boolean;
}
