// Manifest of teaching materials shown on /teaching and per-course pages.
// Each entry is either a real file under public/files/teaching/<courseId>/
// (status: "available") or a planned material whose target path is recorded
// so the file can be added later (status: "coming-soon").
//
// No file is added here without first existing under public/files/. Items
// marked "coming-soon" intentionally render as disabled cards.

export type TeachingMaterialType = "pdf" | "worksheet" | "notes" | "link";
export type TeachingMaterialStatus = "available" | "coming-soon";

export interface TeachingMaterial {
  courseId: string;
  title: string;
  type: TeachingMaterialType;
  href: string;
  status: TeachingMaterialStatus;
  description?: string;
}

export const teachingMaterials: TeachingMaterial[] = [
  // Linear Algebra for Electrical Engineering
  {
    courseId: "linear-algebra-electrical",
    title: "Systems of linear equations — worked problems",
    type: "worksheet",
    href: "/files/teaching/linear-algebra-electrical/systems-worked-problems.pdf",
    status: "coming-soon",
  },
  {
    courseId: "linear-algebra-electrical",
    title: "Vector spaces and bases — lecture notes",
    type: "notes",
    href: "/files/teaching/linear-algebra-electrical/vector-spaces-notes.pdf",
    status: "coming-soon",
  },
  {
    courseId: "linear-algebra-electrical",
    title: "Eigenvalues and diagonalization — practice sheet",
    type: "worksheet",
    href: "/files/teaching/linear-algebra-electrical/eigenvalues-practice.pdf",
    status: "coming-soon",
  },

  // Linear Algebra for Biomedical Engineering
  {
    courseId: "linear-algebra-biomedical",
    title: "Matrix algebra — quick reference",
    type: "notes",
    href: "/files/teaching/linear-algebra-biomedical/matrix-quick-reference.pdf",
    status: "coming-soon",
  },
  {
    courseId: "linear-algebra-biomedical",
    title: "Determinants and rank — practice problems",
    type: "worksheet",
    href: "/files/teaching/linear-algebra-biomedical/determinants-practice.pdf",
    status: "coming-soon",
  },
  {
    courseId: "linear-algebra-biomedical",
    title: "Linear transformations — examples and exercises",
    type: "worksheet",
    href: "/files/teaching/linear-algebra-biomedical/linear-transformations.pdf",
    status: "coming-soon",
  },

  // Calculus 2
  {
    courseId: "calculus-2",
    title: "Uniform convergence — practice sheet",
    type: "worksheet",
    href: "/files/teaching/calculus-2/uniform-convergence.pdf",
    status: "coming-soon",
  },
  {
    courseId: "calculus-2",
    title: "Taylor and power series — lecture notes",
    type: "notes",
    href: "/files/teaching/calculus-2/taylor-power-series.pdf",
    status: "coming-soon",
  },
  {
    courseId: "calculus-2",
    title: "Fourier series — worked examples",
    type: "worksheet",
    href: "/files/teaching/calculus-2/fourier-series-examples.pdf",
    status: "coming-soon",
  },
  {
    courseId: "calculus-2",
    title: "Double integrals — practice problems",
    type: "worksheet",
    href: "/files/teaching/calculus-2/double-integrals.pdf",
    status: "coming-soon",
  },
];

export function materialsForCourse(courseId: string): TeachingMaterial[] {
  return teachingMaterials.filter((m) => m.courseId === courseId);
}
