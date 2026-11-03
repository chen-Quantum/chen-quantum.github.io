export const biomedicalNotesPdf =
  "/materials/2026-2027/linear-algebra-biomedical-notes-he.pdf";
export const biomedicalNotesEnglishPdf =
  "/materials/2026-2027/linear-algebra-biomedical-notes-en.pdf";
export const biomedicalEnrichmentPdf = {
  he: "/materials/2026-2027/linear-algebra-biomedical/enrichment-he.pdf",
  en: "/materials/2026-2027/linear-algebra-biomedical/enrichment-en.pdf",
};

export function biomedicalTutorialPdf(number: number, language: "he" | "en") {
  return `/materials/2026-2027/linear-algebra-biomedical/tutorial-${String(number).padStart(2, "0")}-${language}.pdf`;
}

interface BiomedicalTutorial {
  number: number;
  title: string;
  titleHe: string;
  lectureWeek: number | null;
  page: number;
  englishPage: number;
}

export const biomedicalTutorials: BiomedicalTutorial[] = [
  { number: 1, title: "Complex Numbers and Induction", titleHe: "מספרים מרוכבים ואינדוקציה", lectureWeek: null, page: 6, englishPage: 6 },
  { number: 2, title: "Mathematical Language and Proof Methods", titleHe: "שפה מתמטית ושיטות הוכחה", lectureWeek: 1, page: 23, englishPage: 24 },
  { number: 3, title: "Fields and Finite Fields", titleHe: "שדות ושדות סופיים", lectureWeek: 1, page: 26, englishPage: 27 },
  { number: 4, title: "Linear Systems, Gaussian Elimination, and Span", titleHe: "מערכות משוואות, גאוס ופרישה", lectureWeek: 3, page: 38, englishPage: 39 },
  { number: 5, title: "Linear Dependence, Bases, and Matrix Operations", titleHe: "תלות לינארית, בסיסים ופעולות במטריצות", lectureWeek: 4, page: 49, englishPage: 51 },
  { number: 6, title: "Invertible Matrices and the Determinant", titleHe: "מטריצות הפיכות והגדרת הדטרמיננטה", lectureWeek: 5, page: 64, englishPage: 67 },
  { number: 7, title: "Determinant Properties, Expansions, and Cramer's Rule", titleHe: "תכונות הדטרמיננטה, פיתוח וכלל קרמר", lectureWeek: 6, page: 80, englishPage: 82 },
  { number: 8, title: "Adjugates and Vector Spaces", titleHe: "מטריצה מצורפת ומרחבים וקטוריים", lectureWeek: 7, page: 92, englishPage: 95 },
  { number: 9, title: "Dimension, Row and Column Spaces, and Rank", titleHe: "נוסחת הממדים, מרחבי שורות ועמודות ודרגה", lectureWeek: 8, page: 109, englishPage: 112 },
  { number: 10, title: "Null Spaces and Linear Maps", titleHe: "המרחב המאפס והעתקות לינאריות", lectureWeek: 9, page: 128, englishPage: 131 },
  { number: 11, title: "Coordinates, Matrix Representations, and Change of Basis", titleHe: "קואורדינטות, מטריצה מייצגת ומעבר בסיסים", lectureWeek: 10, page: 152, englishPage: 154 },
  { number: 12, title: "Similarity, Eigenvalues, and Eigenspaces", titleHe: "דמיון, ערכים עצמיים ומרחבים עצמיים", lectureWeek: 11, page: 171, englishPage: 173 },
  { number: 13, title: "Diagonalization, Cayley-Hamilton, Jordan Form, and Inner Products", titleHe: "לכסון, קיילי-המילטון, ז'ורדן ומכפלה פנימית", lectureWeek: 12, page: 190, englishPage: 193 },
  { number: 14, title: "Orthogonality, Best Approximation, and Gram-Schmidt", titleHe: "אורתוגונליות, קירוב טוב ביותר וגרם שמידט", lectureWeek: 13, page: 227, englishPage: 231 },
  { number: 15, title: "Orthogonal Matrices, the Spectral Theorem, and SVD", titleHe: "מטריצות אורתוגונליות, המשפט הספקטרלי ו-SVD", lectureWeek: null, page: 251, englishPage: 256 },
];
