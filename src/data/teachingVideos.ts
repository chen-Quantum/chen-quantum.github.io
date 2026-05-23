// Manifest of teaching videos. Default to external hosting (YouTube /
// Vimeo / institutional video portal); large video files are NEVER stored
// in the repository. Entries with empty url + status "coming-soon" render
// as disabled cards until a URL is added.

export type TeachingVideoProvider = "youtube" | "vimeo" | "external";
export type TeachingVideoStatus = "available" | "coming-soon";

export interface TeachingVideo {
  courseId: string;
  title: string;
  provider: TeachingVideoProvider;
  url: string;
  status: TeachingVideoStatus;
  durationMinutes?: number;
  thumbnail?: string;
}

export const teachingVideos: TeachingVideo[] = [
  // Linear Algebra for Electrical Engineering
  {
    courseId: "linear-algebra-electrical",
    title: "Gaussian elimination — step by step",
    provider: "external",
    url: "",
    status: "coming-soon",
  },
  {
    courseId: "linear-algebra-electrical",
    title: "Bases and dimension — intuition + examples",
    provider: "external",
    url: "",
    status: "coming-soon",
  },
  {
    courseId: "linear-algebra-electrical",
    title: "Eigenvalues — a visual walk-through",
    provider: "external",
    url: "",
    status: "coming-soon",
  },

  // Linear Algebra for Biomedical Engineering
  {
    courseId: "linear-algebra-biomedical",
    title: "Matrix multiplication — three pictures",
    provider: "external",
    url: "",
    status: "coming-soon",
  },
  {
    courseId: "linear-algebra-biomedical",
    title: "Determinants — geometric meaning",
    provider: "external",
    url: "",
    status: "coming-soon",
  },

  // Calculus 2
  {
    courseId: "calculus-2",
    title: "Pointwise vs uniform convergence",
    provider: "external",
    url: "",
    status: "coming-soon",
  },
  {
    courseId: "calculus-2",
    title: "Building Taylor series from scratch",
    provider: "external",
    url: "",
    status: "coming-soon",
  },
  {
    courseId: "calculus-2",
    title: "Fourier series — orthogonality and coefficients",
    provider: "external",
    url: "",
    status: "coming-soon",
  },
];

export function videosForCourse(courseId: string): TeachingVideo[] {
  return teachingVideos.filter((v) => v.courseId === courseId);
}
