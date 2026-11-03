export const academicYear = "2026–2027";
export const engineeringNotesPdf =
  "/materials/2026-2027/linear-algebra-engineering-notes.pdf";
export const engineeringNotesEnglishPdf =
  "/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf";
export const engineeringAppendixPages = { he: 263, en: 268 };
export function engineeringTutorialPdf(number: number, language: "he" | "en") {
  return `/materials/2026-2027/linear-algebra/tutorial-${String(number).padStart(2, "0")}-${language}.pdf`;
}
export const engineeringLogicAppendixPdf = {
  he: "/materials/2026-2027/linear-algebra/logic-appendix-he.pdf",
  en: "/materials/2026-2027/linear-algebra/logic-appendix-en.pdf",
};
export const engineeringTutorials = [
  { number: 1, title: "Complex numbers and induction", page: 6, englishPage: 6 },
  { number: 2, title: "Proof methods, sets, and fields", page: 22, englishPage: 23 },
  { number: 3, title: "Fields and Finite Fields", page: 33, englishPage: 34 },
  {
    number: 4,
    title: "Complex Polynomials and Matrix Operations",
    page: 44,
    englishPage: 45,
  },
  { number: 5, title: "Linear Systems, Row Reduction, and Invertible Matrices", page: 56, englishPage: 58 },
  {
    number: 6,
    title: "Vector Spaces, Subspaces, and Linear Combinations",
    page: 78,
    englishPage: 80,
  },
  {
    number: 7,
    title: "Linear Dependence, Bases, Dimension, and Row and Column Spaces",
    page: 99,
    englishPage: 101,
  },
  { number: 8, title: "Linear Maps and Coordinates", page: 123, englishPage: 125 },
  { number: 9, title: "Matrix Representations, Change of Basis, and Determinants", page: 141, englishPage: 143 },
  { number: 10, title: "Determinants, Adjugates, Similarity, and an Introduction to Diagonalization", page: 158, englishPage: 161 },
  { number: 11, title: "Diagonalization, Cayley-Hamilton, and an Introduction to Inner Products", page: 189, englishPage: 193 },
  {
    number: 12,
    title: "Inner Products, Norms, Orthogonality, Projections, and Gram-Schmidt",
    page: 218,
    englishPage: 222,
  },
  {
    number: 13,
    title: "Adjoints and Unitary Diagonalization",
    page: 241,
    englishPage: 246,
  },
];

// Activities are matched by topic independently of the booklet chapter numbers.
const relatedActivityTopics: Record<number, { id: number; topic: string }[]> = {
  1: [{ id: 1, topic: "Complex numbers" }],
  2: [{ id: 2, topic: "Fields and finite fields" }],
  3: [{ id: 2, topic: "Fields and finite fields" }],
  4: [{ id: 1, topic: "Complex roots" }, { id: 5, topic: "Matrix operations" }],
  5: [{ id: 3, topic: "Linear systems and row reduction" }],
  6: [{ id: 4, topic: "Span and linear combinations" }],
  7: [{ id: 7, topic: "Rank and null spaces" }],
  8: [{ id: 8, topic: "Linearity" }, { id: 6, topic: "Bases and coordinates" }],
  9: [{ id: 9, topic: "Matrix representations" }, { id: 10, topic: "Determinants" }],
  10: [{ id: 10, topic: "Determinants" }, { id: 11, topic: "Eigenvalues and diagonalization" }],
  11: [{ id: 11, topic: "Diagonalization" }],
  12: [{ id: 12, topic: "Inner products and projections" }, { id: 13, topic: "Gram-Schmidt" }],
  13: [{ id: 12, topic: "Inner-product review" }, { id: 13, topic: "Orthonormal-basis review" }],
};
export function engineeringTutorialActivities(tutorialNumber: number) {
  return relatedActivityTopics[tutorialNumber] ?? [];
}
