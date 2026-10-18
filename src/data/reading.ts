export interface ReadingPick {
  title: string;
  url: string;
  date: string;
  category: string;
  art: "light" | "probability" | "atoms" | "clock";
  summary: string;
  why: string;
}

// An explicitly dated editorial selection, not an automatically refreshed feed.
// Publication dates and article URLs checked against the publisher on 18 October 2026.
export const readingEdition = "October 2026";
export const readingPicks: ReadingPick[] = [
  {
    title: "Imaging with Zero Photons",
    url: "https://physics.aps.org/articles/v19/s127",
    date: "2026-10-15",
    category: "Light & measurement",
    art: "light",
    summary:
      "A counterintuitive imaging protocol built around correlations and the choice of which detection events to keep.",
    why: "Read past the headline and ask what the experiment actually measures.",
  },
  {
    title: "Quantum Probability Requires Probability",
    url: "https://physics.aps.org/articles/v19/133",
    date: "2026-10-13",
    category: "Quantum foundations",
    art: "probability",
    summary:
      "A discussion of the assumptions behind attempts to derive the Born rule, particularly the role of probability additivity.",
    why: "A useful exercise in separating a derivation from its starting assumptions.",
  },
  {
    title: "How To Arrange Hundreds of Atoms Between Two Mirrors",
    url: "https://physics.aps.org/articles/v19/s126",
    date: "2026-10-08",
    category: "Quantum technology",
    art: "atoms",
    summary:
      "A cavity microscope addresses an array of more than 600 atoms, with possible applications to future quantum systems.",
    why: "Connect the experimental geometry to the challenge of scaling quantum hardware.",
  },
  {
    title: "First Nuclear Clocks Kick Off a Precision Race",
    url: "https://physics.aps.org/articles/v19/139",
    date: "2026-10-07",
    category: "Precision physics",
    art: "clock",
    summary:
      "Two operating nuclear clocks mark a step toward new precision measurements, while still trailing the best atomic clocks in stability.",
    why: "See how a new measurement tool can open questions in fundamental physics.",
  },
];

export const studentReading = [
  {
    author: "Gilbert Strang · MIT OpenCourseWare",
    title: "18.06 Linear Algebra",
    url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    format: "Free course",
    level: "Start here",
    description:
      "A second explanation of the core ideas, with lectures and exercises. Use it alongside your TAU notes, then solve problems yourself.",
  },
  {
    author: "3Blue1Brown",
    title: "Essence of Linear Algebra",
    url: "https://www.3blue1brown.com/topics/linear-algebra",
    format: "Visual lessons",
    level: "Build intuition",
    description:
      "Geometric pictures for vectors, transformations, and eigenvectors. Pair the intuition with the definitions and proofs used in class.",
  },
  {
    author: "Gilbert Strang · Wellesley-Cambridge Press",
    title: "Introduction to Linear Algebra",
    url: "https://www.wellesleycambridge.com/",
    format: "Textbook",
    level: "Engineering companion",
    description:
      "An applied perspective on matrices and linear systems. An optional companion, rather than an additional course requirement.",
  },
  {
    author: "Sheldon Axler",
    title: "Linear Algebra Done Right",
    url: "https://linear.axler.net/",
    format: "Free open access book",
    level: "Further study",
    description:
      "A proof-oriented text intended for a second course. Recommended as enrichment once you are comfortable with the introductory material.",
  },
];

export const formatReadingDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
