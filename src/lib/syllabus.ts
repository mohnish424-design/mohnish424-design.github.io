export type SubjectId = "math" | "science" | "sst";

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  short: string;
  emoji: string;
  tone: string; // css var token suffix
}

export const SUBJECTS: SubjectMeta[] = [
  { id: "math", name: "Mathematics", short: "Math", emoji: "📘", tone: "subject-math" },
  { id: "science", name: "Science", short: "Science", emoji: "🔬", tone: "subject-science" },
  { id: "sst", name: "Social Science", short: "SST", emoji: "🌍", tone: "subject-sst" },
];

export const subjectMeta = (id: SubjectId): SubjectMeta =>
  SUBJECTS.find((s) => s.id === id) as SubjectMeta;

export interface SyllabusChapter {
  key: string;
  name: string;
  section?: string;
}

export const DEFAULT_SYLLABUS: Record<SubjectId, SyllabusChapter[]> = {
  math: [
    "Real Numbers",
    "Polynomials",
    "Pair of Linear Equations in Two Variables",
    "Quadratic Equations",
    "Arithmetic Progressions",
    "Triangles",
    "Coordinate Geometry",
    "Introduction to Trigonometry",
    "Some Applications of Trigonometry",
    "Circles",
    "Areas Related to Circles",
    "Surface Areas and Volumes",
    "Statistics",
    "Probability",
  ].map((name, i) => ({ key: `math-${i + 1}`, name })),
  science: [
    "Chemical Reactions and Equations",
    "Acids, Bases and Salts",
    "Metals and Non-metals",
    "Carbon and Its Compounds",
    "Life Processes",
    "Control and Coordination",
    "How do Organisms Reproduce?",
    "Heredity",
    "Light – Reflection and Refraction",
    "The Human Eye and the Colourful World",
    "Electricity",
    "Magnetic Effects of Electric Current",
    "Our Environment",
  ].map((name, i) => ({ key: `sci-${i + 1}`, name })),
  sst: [
    ...[
      "The Rise of Nationalism in Europe",
      "Nationalism in India",
      "The Making of a Global World",
      "The Age of Industrialisation",
      "Print Culture and the Modern World",
    ].map((name, i) => ({ key: `hist-${i + 1}`, name, section: "History" })),
    ...[
      "Resources and Development",
      "Forest and Wildlife Resources",
      "Water Resources",
      "Agriculture",
      "Minerals and Energy Resources",
      "Manufacturing Industries",
      "Lifelines of National Economy",
    ].map((name, i) => ({ key: `geo-${i + 1}`, name, section: "Geography" })),
    ...[
      "Power Sharing",
      "Federalism",
      "Gender, Religion and Caste",
      "Political Parties",
      "Outcomes of Democracy",
      "Challenges to Democracy",
    ].map((name, i) => ({ key: `pol-${i + 1}`, name, section: "Political Science" })),
    ...[
      "Development",
      "Sectors of the Indian Economy",
      "Money and Credit",
      "Globalisation and the Indian Economy",
      "Consumer Rights",
    ].map((name, i) => ({ key: `eco-${i + 1}`, name, section: "Economics" })),
  ],
};

export const EXAM_PRESETS = [
  "Unit Test",
  "Periodic Test",
  "Half-Yearly",
  "Pre-Board",
  "Board Exam",
];
