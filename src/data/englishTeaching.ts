import type { YouTubeVideo } from "./youtubeVideos";

// English display labels use the existing course/session metadata. The original
// YouTube titles and source PDFs remain intact for matching and maintenance.
export function englishVideoTitle(video: YouTubeVideo): string {
  if (!/[\u0590-\u05ff]/.test(video.title)) return video.title;
  const courses: Record<string, string> = {
    hedva2: "Calculus 2",
    linear_algebra: "Linear Algebra",
    group_theory: "Group Theory",
    quantum: "Quantum Computing",
    physics: "Physics",
  };
  const kinds: Record<string, string> = {
    tutorial: "Tutorial recording",
    "worked-solution": "Worked solution",
    "exam-solution": "Exam solution",
    song: "Study song",
    "memory-aid": "Memory aid",
    lecture: "Lecture recording",
  };
  const session =
    video.laTutorial ??
    (video.relatedPractice
      ? Number(video.relatedPractice.replace("tirgul", ""))
      : null);
  const lesson = session
    ? `Tutorial ${session}`
    : (kinds[video.contentType ?? "tutorial"] ?? "Course recording");
  return [
    courses[video.category] ?? "Course material",
    lesson,
    video.track,
    video.sessionNote,
  ]
    .filter(Boolean)
    .join(" · ");
}

export const practiceTopicsEn: Record<string, string[]> = {
  tirgul1: [
    "Pointwise convergence of sequences of functions",
    "Uniform convergence",
    "The supremum criterion",
    "Worked examples",
    "Pointwise limits, disproving uniform convergence, and convergence on subdomains",
  ],
  tirgul2: [
    "Further convergence of sequences of functions",
    "The supremum criterion",
    "Continuity of the limit under uniform convergence",
    "Series of functions",
    "The Weierstrass M-test",
    "Absolute and uniform convergence",
    "Integration and differentiation of sequences and series of functions",
  ],
  tirgul3: [
    "Definition of a power series",
    "Interval of convergence",
    "Radius of convergence",
    "Abel’s theorem",
    "The Cauchy-Hadamard formula",
    "The coefficient ratio formula",
    "Checking endpoints",
    "Term-by-term differentiation and integration",
    "Finding the radius and interval of convergence",
  ],
  tirgul4: [
    "Inner products",
    "Orthogonal projection",
    "Cross products",
    "Lines in space",
    "Planes",
    "Quadric surfaces",
    "Domains of multivariable functions",
    "Level curves and level surfaces",
    "Topology in Rⁿ",
    "Open and closed sets",
    "Interior, boundary, and closure",
    "Boundedness and compactness",
    "Connectedness and path connectedness",
  ],
  tirgul5: [
    "The multivariable ε-δ definition of a limit",
    "One-variable and multivariable limits",
    "Disproving a limit using paths",
    "The squeeze theorem",
    "Polar coordinates around a point",
    "Continuity",
    "Partial derivatives",
    "Directional derivatives",
    "Differentiability",
    "Differentiability implies continuity and the existence of partial derivatives, but not conversely",
  ],
};
