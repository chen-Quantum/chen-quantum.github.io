export const academicYear = "2026–2027";
export const engineeringNotesPdf =
  "/materials/2026-2027/linear-algebra-engineering-notes.pdf";
export const engineeringNotesEnglishPdf =
  "/materials/2026-2027/linear-algebra-engineering-tutorials-en.pdf";
export const engineeringAppendixPages = { he: 269, en: 270 };
export function engineeringTutorialPdf(number: number, language: "he" | "en") {
  return `/materials/2026-2027/linear-algebra/tutorial-${String(number).padStart(2, "0")}-${language}.pdf`;
}
export const engineeringLogicAppendixPdf = {
  he: "/materials/2026-2027/linear-algebra/logic-appendix-he.pdf",
  en: "/materials/2026-2027/linear-algebra/logic-appendix-en.pdf",
};
export const engineeringTutorials = [
  { number: 1, title: "Complex numbers and induction", page: 6, englishPage: 6 },
  { number: 2, title: "Proof methods, sets, and fields", page: 23, englishPage: 24 },
  { number: 3, title: "Linear systems and subspaces", page: 35, englishPage: 36 },
  {
    number: 4,
    title: "Linear dependence, span, and sums of subspaces",
    page: 55,
    englishPage: 57,
  },
  { number: 5, title: "Matrix operations, bases, and dimension", page: 70, englishPage: 72 },
  {
    number: 6,
    title: "Bases, invertibility, and elementary matrices",
    page: 86,
    englishPage: 88,
  },
  {
    number: 7,
    title: "Rank, row and column spaces, and measurement systems",
    page: 107,
    englishPage: 108,
  },
  { number: 8, title: "Linear maps and coordinates", page: 135, englishPage: 136 },
  { number: 9, title: "Linear maps and matrix representations", page: 155, englishPage: 156 },
  { number: 10, title: "Matrix similarity and determinants", page: 174, englishPage: 175 },
  { number: 11, title: "Eigenvalues and diagonalization", page: 195, englishPage: 196 },
  {
    number: 12,
    title: "Inner products, orthogonality, and projections",
    page: 225,
    englishPage: 226,
  },
  {
    number: 13,
    title: "Gram–Schmidt and orthogonal diagonalization",
    page: 249,
    englishPage: 250,
  },
];
