export const academicYear = "2026–2027";
export const engineeringNotesPdf =
  "/materials/2026-2027/linear-algebra-engineering-notes.pdf";
export const engineeringNotesEnglishPdf =
  "/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf";
export const engineeringAppendixPages = { he: 332, en: 353 };
export function engineeringTutorialPdf(number: number, language: "he" | "en") {
  return `/materials/2026-2027/linear-algebra/tutorial-${String(number).padStart(2, "0")}-${language}.pdf`;
}
export const engineeringLogicAppendixPdf = {
  he: "/materials/2026-2027/linear-algebra/logic-appendix-he.pdf",
  en: "/materials/2026-2027/linear-algebra/logic-appendix-en.pdf",
};
export const engineeringTutorials = [
  { number: 1, title: "Complex numbers and induction", page: 6, englishPage: 6 },
  { number: 2, title: "Proof methods, sets, and fields", page: 24, englishPage: 27 },
  { number: 3, title: "Fields and Finite Fields", page: 38, englishPage: 41 },
  {
    number: 4,
    title: "Complex Polynomials and Matrix Operations",
    page: 53,
    englishPage: 57,
  },
  { number: 5, title: "Linear Systems, Row Reduction, and Invertible Matrices", page: 75, englishPage: 81 },
  {
    number: 6,
    title: "Vector Spaces, Subspaces, and Linear Combinations",
    page: 104,
    englishPage: 110,
  },
  {
    number: 7,
    title: "Linear Dependence, Bases, Dimension, and Row and Column Spaces",
    page: 129,
    englishPage: 133,
  },
  { number: 8, title: "Linear Maps and Coordinates", page: 159, englishPage: 166 },
  { number: 9, title: "Matrix Representations, Change of Basis, and Determinants", page: 181, englishPage: 191 },
  { number: 10, title: "Determinants, Adjugates, Similarity, and an Introduction to Diagonalization", page: 206, englishPage: 217 },
  { number: 11, title: "Diagonalization, Cayley-Hamilton, and an Introduction to Inner Products", page: 244, englishPage: 258 },
  {
    number: 12,
    title: "Inner Products, Norms, Orthogonality, Projections, and Gram-Schmidt",
    page: 278,
    englishPage: 294,
  },
  {
    number: 13,
    title: "Adjoints and Unitary Diagonalization",
    page: 308,
    englishPage: 328,
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
