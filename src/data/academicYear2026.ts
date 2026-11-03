export const academicYear = "2026–2027";
export const engineeringNotesPdf =
  "/materials/2026-2027/linear-algebra-engineering-notes.pdf";
export const engineeringNotesEnglishPdf =
  "/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf";
export const engineeringAppendixPages = { he: 227, en: 231 };
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
  { number: 3, title: "Linear systems and subspaces", page: 33, englishPage: 34 },
  {
    number: 4,
    title: "Linear dependence, span, and sums of subspaces",
    page: 50,
    englishPage: 51,
  },
  { number: 5, title: "Matrix operations, bases, and dimension", page: 64, englishPage: 66 },
  {
    number: 6,
    title: "Bases, invertibility, and elementary matrices",
    page: 79,
    englishPage: 81,
  },
  {
    number: 7,
    title: "Rank, row and column spaces, and measurement systems",
    page: 95,
    englishPage: 97,
  },
  { number: 8, title: "Linear maps and coordinates", page: 113, englishPage: 115 },
  { number: 9, title: "Linear maps and matrix representations", page: 128, englishPage: 130 },
  { number: 10, title: "Matrix similarity and determinants", page: 142, englishPage: 144 },
  { number: 11, title: "Eigenvalues and diagonalization", page: 163, englishPage: 165 },
  {
    number: 12,
    title: "Inner products, orthogonality, and projections",
    page: 188,
    englishPage: 191,
  },
  {
    number: 13,
    title: "Gram–Schmidt and orthogonal diagonalization",
    page: 211,
    englishPage: 215,
  },
];
