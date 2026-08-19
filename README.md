# Smart Study Buddy

Build a polished, mobile-first Class 10 CBSE Smart Study Tracker & Exam Planner.



This is a personal study-planning app for a Class 10 student. The main purpose is to help the student plan and track Mathematics, Science, and Social Science (SST) based on upcoming exams.



The app should not merely be a checklist. It should intelligently calculate how much work remains and automatically create a realistic timetable, syllabus-completion deadline, and revision schedule.



---



1. CORE SUBJECTS



The app should initially focus on:



1. Mathematics

2. Science

3. Social Science (SST)



The chapter database should be editable because CBSE syllabi can change.



---



2. FIRST-TIME SETUP



When the student opens the app for the first time, show a setup wizard.



Ask for:



- Student name (optional)

- Exam name

- Exam date

- Subjects included in the exam

- Available study time on weekdays

- Available study time on weekends

- Preferred study hours

- Optional daily maximum study time



Then allow the student to select which chapters are included in the upcoming exam.



Do NOT make the student manually type chapter names.



Use predefined Class 10 CBSE chapter lists.



---



3. CLASS 10 CHAPTER DATABASE



MATHEMATICS



Include:



- Real Numbers

- Polynomials

- Pair of Linear Equations in Two Variables

- Quadratic Equations

- Arithmetic Progressions

- Triangles

- Coordinate Geometry

- Introduction to Trigonometry

- Some Applications of Trigonometry

- Circles

- Areas Related to Circles

- Surface Areas and Volumes

- Statistics

- Probability



---



4. SCIENCE



Include:



- Chemical Reactions and Equations

- Acids, Bases and Salts

- Metals and Non-metals

- Carbon and Its Compounds

- Life Processes

- Control and Coordination

- How do Organisms Reproduce?

- Heredity

- Light – Reflection and Refraction

- The Human Eye and the Colourful World

- Electricity

- Magnetic Effects of Electric Current

- Our Environment



Structure the database so chapter names can be edited later.



---



5. SOCIAL SCIENCE



Organize SST into four sections.



HISTORY



- The Rise of Nationalism in Europe

- Nationalism in India

- The Making of a Global World

- The Age of Industrialisation

- Print Culture and the Modern World



GEOGRAPHY



- Resources and Development

- Forest and Wildlife Resources

- Water Resources

- Agriculture

- Minerals and Energy Resources

- Manufacturing Industries

- Lifelines of National Economy



POLITICAL SCIENCE



- Power Sharing

- Federalism

- Gender, Religion and Caste

- Political Parties

- Outcomes of Democracy

- Challenges to Democracy



ECONOMICS



- Development

- Sectors of the Indian Economy

- Money and Credit

- Globalisation and the Indian Economy

- Consumer Rights



---



6. EXAM MANAGEMENT



The app must support multiple exams.



Examples:



- Unit Test

- Periodic Test

- Half-Yearly

- Pre-Board

- Board Exam



Each exam should have its own:



- Exam date

- Subjects

- Selected chapters

- Study schedule

- Syllabus completion target

- Revision schedule

- Progress



Allow the student to switch between exams.



---



7. CHAPTER TRACKING



Every selected chapter has TWO major independent study components:



A. PW LECTURES



Track progress through Physics Wallah lectures.



Statuses:



- Not Started

- In Progress

- Completed



B. EXTRA QUESTIONS



Track whether the student completed extra questions/practice.



Statuses:



- Not Started

- In Progress

- Completed



Do NOT combine these into one checkbox.



For example:



Mathematics — Quadratic Equations



PW Lectures:

"7 / 12 completed"



Extra Questions:

"Completed"



---



8. PW LECTURE WORKLOAD INPUT



This is extremely important.



For every chapter, allow the student to enter:



Number of PW lectures



Example:



"12 lectures"



Average lecture duration



Example:



"45 minutes"



The app should automatically calculate:



Total PW lecture time = number of lectures × average lecture duration



Example:



12 × 45 minutes = 540 minutes = 9 hours



The student should NOT need to manually calculate the total.



---



9. INDIVIDUAL PW LECTURE TRACKING



Allow the student to track individual lecture completion.



Example:



Quadratic Equations



Total lectures: 12



Completed: 7



Remaining: 5



Average duration: 45 minutes



Remaining lecture workload:



5 × 45 = 225 minutes



Remaining = 3 hours 45 minutes



The scheduling algorithm must use the remaining workload, not the original workload.



If the student completes lectures, the remaining workload must automatically decrease.



---



10. OPTIONAL EXTRA-QUESTION WORKLOAD



For every chapter, allow the student to optionally enter an estimated amount of time required for extra questions.



Example:



Extra Questions:



"Estimated time: 2 hours"



This should be used by the scheduling algorithm.



If the student doesn't know the time, allow:



"I don't know"



In that case, use a reasonable default estimate that can be changed later.



---



11. CHAPTER TOTAL WORKLOAD



For every chapter calculate:



PW Lecture Workload



Number of lectures × average lecture duration



Extra Question Workload



Student's estimated time



Revision Workload



Automatically estimated by the scheduling system



Then show:



Total Estimated Workload



Example:



PW Lectures:

9 hours



Extra Questions:

2 hours



Revision:

1.5 hours



Total:

12.5 hours



This should update dynamically.



---



12. SMART SCHEDULING ENGINE



The most important feature of the app is the automatic scheduling system.



When the student enters:



- Exam date

- Selected chapters

- Number of PW lectures

- Average lecture length

- Extra-question workload

- Available daily study time

- Existing progress



the app should automatically create a realistic study plan.



The scheduler must calculate:



1. Total remaining workload

2. Available study hours

3. Required number of study days

4. Syllabus completion deadline

5. Daily timetable

6. Revision schedule

7. Buffer days



---



13. SYLLABUS COMPLETION DEADLINE



The app should NOT make the syllabus completion date equal to the exam date.



It should finish new learning before the exam.



For example:



Exam:

20 September



The app might calculate:



Syllabus completion target: 12 September



Then:



13–15 September:

Revision



16–18 September:

Practice + weak chapters



19 September:

Final revision



20 September:

EXAM



The exact dates must be dynamically calculated.



---



14. REALISTIC WORKLOAD CALCULATION



The scheduler must NOT treat every chapter equally.



Example:



Chapter A:



10 lectures × 45 minutes

= 7.5 hours



Chapter B:



4 lectures × 45 minutes

= 3 hours



Chapter A should receive significantly more study time.



Similarly, a chapter with:



- 12 lectures

- 2 hours of extra questions



should receive more time than a chapter with:



- 4 lectures

- 30 minutes of extra questions



---



15. DAILY STUDY TIME



The student should enter something like:



Weekdays:

2 hours/day



Saturday:

4 hours



Sunday:

5 hours



The scheduler should use these limits.



It must NEVER assign:



3 hours of work to a day where the student only has 2 hours available.



If a day has 2 hours available, the system should distribute tasks within those 2 hours.



---



16. LECTURE DISTRIBUTION



The app should intelligently divide lectures across days.



Example:



Available study time:

2 hours/day



Chapter:

12 PW lectures



Average lecture:

45 minutes



Total:

9 hours



Possible schedule:



Monday



2 lectures

90 minutes



Tuesday



2 lectures

90 minutes



Wednesday



2 lectures

90 minutes



Thursday



2 lectures

90 minutes



Friday



2 lectures

90 minutes



Saturday



2 lectures

90 minutes



Do not necessarily follow this exact pattern. The actual distribution should depend on all other tasks scheduled for that day.



---



17. MIX MULTIPLE SUBJECTS



The app should intelligently balance:



- Mathematics

- Science

- SST



Do not schedule only one subject every day unless necessary.



For example:



Monday



Mathematics:

Quadratic Equations — 2 PW lectures



Science:

Electricity — 1 PW lecture



SST:

Nationalism in India — revision



The scheduler should avoid excessive subject switching while still maintaining balance.



---



18. PRIORITY SYSTEM



The scheduler should prioritize tasks using factors such as:



Highest priority



1. Exam date approaching

2. Syllabus completion deadline approaching

3. Chapters not started

4. Chapters with large remaining workloads

5. Incomplete PW lectures

6. Incomplete extra questions

7. Revision due

8. Weak/incomplete chapters



The algorithm should be able to dynamically change priorities.



---



19. REVISION SYSTEM



After a chapter's learning component is completed, automatically schedule revisions.



Use spaced revision.



For example:



Chapter completed:

1 September



Revision 1:

3 September



Revision 2:

7 September



Revision 3:

13 September



The exact spacing should depend on:



- Exam date

- Days remaining

- Number of other chapters

- Available study time



Do not schedule revisions so close together that they become unnecessary.



---



20. REVISION TYPES



Allow revision tasks to include:



- Read notes

- Review formulas

- Review concepts

- Practice questions

- Previous mistakes

- Quick recall



For Mathematics and Science, revision can include practice questions.



For SST, revision can include active recall and key-point review.



---



21. EXTRA QUESTION SCHEDULING



Once PW lectures for a chapter are completed or sufficiently progressed, schedule extra questions.



Example:



Mathematics — Quadratic Equations



PW Lectures:

✅ Completed



Extra Questions:

2 hours remaining



Schedule:



Monday:

1 hour



Wednesday:

1 hour



Then mark it completed.



---



22. TODAY'S DASHBOARD



The home page should focus on:



TODAY



Show today's tasks.



Example:



📘 Mathematics



Quadratic Equations



- PW Lectures 5–6

- Estimated: 90 minutes



🔬 Science



Electricity



- PW Lecture 2

- Estimated: 45 minutes



🌍 SST



Nationalism in India



- Revision

- Estimated: 30 minutes



Show:



Today's planned study: 2h 45m



Available today: 3h



Remaining capacity: 15m



---



23. DAILY PROGRESS



Show:



Today's Progress:



"3 / 4 tasks completed"



Also show:



Planned:

2h 45m



Completed:

2h 15m



Remaining:

30m



---



24. MISSED TASKS



If the student misses a task, they can mark it:



Missed



The scheduler should automatically reschedule it.



Example:



Monday:

Quadratic Equations — 2 lectures ❌



The app should find an appropriate future time slot.



It should NOT simply move everything to the next day and create an impossible workload.



Recalculate the schedule intelligently.



---



25. EARLY COMPLETION



If the student finishes tasks early, the app should update the remaining workload.



Example:



Originally:



Remaining:

10 lectures



Student completes:

3 lectures



New remaining:



7 lectures



The scheduler should recalculate future tasks accordingly.



---



26. EXAM COUNTDOWN



Show a prominent countdown:



23 DAYS UNTIL EXAM



Also show:



12 DAYS UNTIL SYLLABUS COMPLETION



And:



15 CHAPTERS REMAINING



These should update automatically.



---



27. OVERALL PROGRESS



Create a progress dashboard.



For each subject show:



Mathematics



PW Lectures:

65%



Extra Questions:

40%



Overall:

55%



Science



PW Lectures:

80%



Extra Questions:

55%



Overall:

67%



SST



PW Lectures:

45%



Extra Questions:

30%



Overall:

38%



Also show:



- Total chapters

- Completed chapters

- Remaining chapters

- Total lecture hours remaining

- Extra-question hours remaining

- Revision tasks remaining



---



28. SUBJECT DASHBOARD



Create separate pages for:



Mathematics



Science



SST



Each page should show:



- All chapters

- Selected-for-exam chapters

- Chapter progress

- PW lecture progress

- Extra-question progress

- Remaining workload

- Upcoming tasks



---



29. CHAPTER DETAIL PAGE



When the student opens a chapter:



Quadratic Equations



Subject:

Mathematics



Exam:

Half-Yearly



PW Lectures



Total:

12



Completed:

7



Remaining:

5



Average duration:

45 minutes



Remaining time:

3h 45m



[Mark Lecture Complete]



Extra Questions



Estimated:

2 hours



Completed:

1 hour



Remaining:

1 hour



[Update Progress]



Schedule



Next Study:

5 September



Revision 1:

8 September



Revision 2:

13 September



Revision 3:

18 September



---



30. CALENDAR



Add a calendar view.



Display:



- Study tasks

- PW lectures

- Extra questions

- Revision

- Syllabus deadline

- Exams



Tapping a date should show that day's complete schedule.



---



31. TIMETABLE VIEW



Create a dedicated schedule page.



Example:



Monday — 8 September



08:00–08:45

Mathematics — Quadratic Equations Lecture 5



08:45–09:00

Break



09:00–09:45

Science — Electricity Lecture 3



09:45–10:15

SST — Nationalism in India Revision



If the student does not specify exact times, simply show the tasks in order with estimated durations.



---



32. FLEXIBLE TIME SLOTS



The student should be able to change:



- Available daily hours

- Preferred study times

- Weekend availability



The scheduler must immediately adapt.



Example:



Before:



Weekday:

2 hours



After:



Weekday:

3 hours



The app should recalculate the syllabus completion date and timetable.



---



33. BUFFER DAYS



Always try to keep some buffer before the exam.



Do not plan the entire syllabus until the night before the exam.



If enough time exists:



Reserve several days for revision.



If there is very little time:



Clearly warn the student.



Example:



«⚠️ Your current available study time is not enough to complete the selected syllabus comfortably before the exam.»



Then show:



Required:

32 hours



Available:

24 hours



Shortage:

8 hours



Suggested options:



- Increase daily study time

- Reduce optional tasks

- Start with highest-priority chapters



---



34. SCHEDULE CONFIDENCE



Show a simple status:



🟢 Comfortable



🟡 Tight



🔴 Overloaded



Based on:



- Remaining workload

- Available hours

- Days remaining

- Buffer available



This should help the student immediately understand whether the plan is realistic.



---



35. MANUAL OVERRIDE



The automatic scheduler should be the default.



However, allow the student to:



- Move a task

- Change a task's duration

- Change a study date

- Mark a task complete

- Skip a task

- Add a personal task



When manually changing something, intelligently adjust the rest of the schedule if possible.



---



36. NOTIFICATIONS / REMINDERS



If supported by the platform, add reminders for:



- Today's study tasks

- Upcoming revision

- Syllabus completion deadline

- Exam countdown

- Missed tasks



Make notifications optional.



---



37. DESIGN



Make the app look like a polished modern student productivity app.



Design requirements:



- Mobile-first

- Responsive

- Clean

- Modern

- Minimal

- Easy to understand

- Smooth animations

- Good typography

- Attractive cards

- Progress bars

- Clear icons

- Light mode

- Dark mode



Do NOT overcrowd the interface.



The most important information should be accessible quickly.



---



38. MOBILE NAVIGATION



Use bottom navigation:



Home

Schedule

Subjects

Calendar

Exams



Add settings/profile through a top-right icon.



---



39. DATA PERSISTENCE



Persist all user data.



Store:



- Exams

- Exam dates

- Selected chapters

- PW lecture counts

- Average lecture duration

- Completed lectures

- Extra-question estimates

- Extra-question progress

- Study availability

- Timetable

- Revision schedule

- Completed tasks

- Missed tasks

- User preferences



Refreshing/reopening the app must NOT delete data.



---



40. SCHEDULER ARCHITECTURE



Do not hardcode the schedule.



Create a real scheduling engine.



Inputs:



- Current date

- Exam date

- Selected chapters

- Subject

- Number of PW lectures

- Average lecture duration

- Completed lectures

- Extra-question estimated duration

- Extra-question progress

- Available study hours

- Weekday/weekend availability

- Existing completed tasks

- Missed tasks

- Revision requirements



Calculate:



Workload



PW remaining time:



"remaining lectures × average lecture duration"



Plus:



"remaining extra-question time"



Plus:



"estimated revision time"



Then compare total remaining workload against available study capacity.



Generate:



- Syllabus completion target

- Daily timetable

- Lecture distribution

- Extra-question schedule

- Revision schedule

- Buffer

- Workload status



---



41. DYNAMIC RECALCULATION



The schedule must recalculate when any important input changes.



For example:



If the student changes:



Exam date:

20 September → 15 September



The schedule should automatically become more intensive.



If the student changes:



Average lecture:

45 minutes → 60 minutes



The scheduler should increase the required study time.



If the student completes 5 lectures:



Remaining workload decreases.



If the student misses a day:



Future tasks should be redistributed.



If the student adds another chapter:



The scheduler should incorporate it.



---



42. DO NOT CREATE UNREALISTIC PLANS



This is extremely important.



Never create a schedule just to make the UI look complete.



If the student has:



20 hours of work remaining



but only:



12 hours available



the app must clearly say that the workload cannot currently fit.



The app should explain the shortage and provide possible adjustments.



---



43. SAMPLE DATA



Initially provide sample data so the application looks populated during development.



For example:



Exam:

Half-Yearly



Exam date:

20 September



Mathematics:

Quadratic Equations



12 PW lectures



45-minute average



2 hours extra questions



Science:

Electricity



10 PW lectures



50-minute average



2 hours extra questions



SST:

Nationalism in India



8 PW lectures



40-minute average



1.5 hours extra questions



Make it easy for the student to delete sample data and start their own plan.



---



44. IMPORTANT: NO FAKE FUNCTIONALITY



Do not create buttons that don't work.



All major functionality must actually work.



The following must be functional:



- Add exam

- Select chapters

- Enter lecture count

- Enter lecture duration

- Track individual lectures

- Track extra questions

- Generate schedule

- Recalculate schedule

- Mark tasks complete

- Mark tasks missed

- Reschedule missed tasks

- Add/edit study availability

- Calendar

- Progress tracking

- Multiple exams

- Dark mode

- Data persistence



---



45. FINAL PRODUCT GOAL



The final app should feel like a personal AI-powered Class 10 study planner.



The main workflow should be:



1. Enter exam date



↓



2. Select chapters



↓



3. Enter PW lecture count + average lecture length



↓



4. Enter extra-question workload



↓



5. Enter available study time



↓



6. App calculates total workload



↓



7. App determines when the syllabus should be completed



↓



8. App creates a realistic daily timetable



↓



9. App schedules revisions



↓



10. Student tracks lectures + extra questions



↓



11. App continuously recalculates the remaining workload



↓



12. Missed/finished tasks automatically adjust the future schedule



The end result should be a genuinely useful Class 10 exam planning and study tracking application, not simply a to-do list.



Prioritize:

accurate scheduling + workload calculation + progress tracking + excellent mobile UI + reliability.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smart-study-buddy-770.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aed8db54-4b8b-4573-9053-9446c6557f83).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
