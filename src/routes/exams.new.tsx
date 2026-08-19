import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/AppShell";
import { SetupWizard } from "@/components/SetupWizard";

export const Route = createFileRoute("/exams/new")({
  head: () => ({
    meta: [
      { title: "Add an exam · Class 10 Study Planner" },
      {
        name: "description",
        content:
          "Add a new Class 10 exam: pick the date, subjects, chapters, PW lecture counts and daily study time.",
      },
      { property: "og:title", content: "Add an exam · Class 10 Study Planner" },
      {
        property: "og:description",
        content: "Set up a new exam and get an automatic study timetable and revision plan.",
      },
    ],
  }),
  component: NewExamPage,
});

function NewExamPage() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="New exam" subtitle="We'll build the timetable for you" />
      <Page>
        <SetupWizard onDone={() => navigate({ to: "/" })} />
      </Page>
    </>
  );
}
