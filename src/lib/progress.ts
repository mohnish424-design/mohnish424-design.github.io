import type { Exam, ExamChapter } from "./types";
import type { SubjectId } from "./syllabus";
import {
  REVISION_COUNT,
  chapterRevisionUnit,
  extraRemaining,
  isChapterLearned,
  lectureRemaining,
} from "./scheduler";
import type { AppState } from "./types";

export interface SubjectProgress {
  subject: SubjectId;
  chapters: ExamChapter[];
  lecturePct: number;
  extraPct: number;
  overallPct: number;
  lectureRemainingMinutes: number;
  extraRemainingMinutes: number;
  revisionRemaining: number;
  completedChapters: number;
}

export function subjectProgress(
  state: AppState,
  exam: Exam,
  subject: SubjectId,
): SubjectProgress {
  const chapters = exam.chapters.filter((c) => c.subject === subject);
  const lectureTotal = chapters.reduce((s, c) => s + c.lectures * c.lectureMinutes, 0);
  const lectureDone = chapters.reduce((s, c) => s + c.lecturesDone * c.lectureMinutes, 0);
  const extraTotal = chapters.reduce((s, c) => s + c.extraMinutes, 0);
  const extraDone = chapters.reduce((s, c) => s + Math.min(c.extraMinutes, c.extraDoneMinutes), 0);
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  let revisionRemaining = 0;
  chapters.forEach((c) => {
    let done = 0;
    for (let i = 1; i <= REVISION_COUNT; i++) {
      if (state.marks[`${c.id}|rev|${i}`] === "done") done++;
    }
    revisionRemaining += (REVISION_COUNT - done) * chapterRevisionUnit(c);
  });

  return {
    subject,
    chapters,
    lecturePct: pct(lectureDone, lectureTotal),
    extraPct: pct(extraDone, extraTotal),
    overallPct: pct(lectureDone + extraDone, lectureTotal + extraTotal),
    lectureRemainingMinutes: chapters.reduce((s, c) => s + lectureRemaining(c), 0),
    extraRemainingMinutes: chapters.reduce((s, c) => s + extraRemaining(c), 0),
    revisionRemaining,
    completedChapters: chapters.filter(isChapterLearned).length,
  };
}
