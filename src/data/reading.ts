export interface ReadingPick {
  title: string;
  url: string;
  date: string;
  category: string;
  publisher: string;
  topic: "physics" | "ml";
  format: string;
  featured?: boolean;
  accessNote?: string;
  art: "light" | "probability" | "atoms" | "clock" | "network" | "geometry";
  summary: string;
  why: string;
}

// An explicitly dated editorial selection, not an automatically refreshed feed.
// Publication dates and article URLs checked against the publisher on 18 October 2026.
export const readingEdition = "October 2026";
export const readingPicks: ReadingPick[] = [
  {
    title: "Gravity Seems Holographic. What Does That Mean for Reality?",
    url: "https://www.quantamagazine.org/gravity-seems-holographic-what-does-that-mean-for-reality-20260925/",
    date: "2026-09-25",
    category: "Quantum gravity & spacetime",
    publisher: "Quanta Magazine",
    topic: "physics",
    format: "Essay",
    art: "geometry",
    featured: true,
    summary:
      "An introduction to holography, black-hole entropy, and the question of how far AdS/CFT applies to our universe.",
    why: "Follow the distinction between a precise theoretical correspondence and claims about the world we live in.",
  },
  {
    title: "Attempts to Keep Humans in the AI Loop May Actually Push Them Out",
    url: "https://spectrum.ieee.org/agentic-ai-humans-in-loop",
    date: "2026-10-05",
    category: "AI systems & human oversight",
    publisher: "IEEE Spectrum",
    topic: "ml",
    format: "Analysis",
    art: "network",
    featured: true,
    summary:
      "An examination of why asking people to approve an AI system’s actions does not automatically create effective human oversight.",
    why: "Useful when thinking about how to design applications that people can actually supervise.",
  },
  {
    title: "He Wants AI Benchmarking To Be a Science, Not a Dark Art",
    url: "https://www.quantamagazine.org/he-wants-ai-benchmarking-to-be-a-science-not-a-dark-art-20261016/",
    date: "2026-10-16",
    category: "Machine learning & evaluation",
    publisher: "Quanta Magazine",
    topic: "ml",
    format: "Interview",
    art: "probability",
    summary:
      "Moritz Hardt discusses what benchmark scores tell us, where comparisons go wrong, and how evaluation might improve.",
    why: "A reminder to ask what a score measures before treating a leaderboard as a scientific conclusion.",
  },
  {
    title: "Is ‘Attention’ the Essence of Intelligence?",
    url: "https://www.quantamagazine.org/is-attention-the-essence-of-intelligence-20261012/",
    date: "2026-10-12",
    category: "Neural networks & attention",
    publisher: "Quanta Magazine",
    topic: "ml",
    format: "Essay",
    art: "network",
    summary:
      "An accessible account of attention, from early machine translation to transformer models, and the importance of context.",
    why: "Connect the vectors and matrix operations from linear algebra to a central mechanism in modern AI.",
  },
  {
    title:
      "Retrofitted LLM can count the letter ‘i’s in ‘artificial intelligence’",
    url: "https://www.nature.com/articles/d41586-026-03059-2",
    date: "2026-10-07",
    category: "Language models & representation",
    publisher: "Nature",
    topic: "ml",
    format: "News & Views",
    art: "network",
    summary:
      "An overview of byteification, a way to retrofit language models for tasks involving individual letters.",
    why: "A neat example of how representation choices shape what a model finds easy or difficult.",
    accessNote: "Publisher access may require a subscription.",
  },
  {
    title: "To turn invisible, we need to tweak the path light travels",
    url: "https://www.sciencenews.org/article/invisibility-tweak-path-light-cloak",
    date: "2026-10-13",
    category: "Optics & everyday physics",
    publisher: "Science News",
    topic: "physics",
    format: "Explainer",
    art: "light",
    summary:
      "From transparent animals to proposed cloaking devices, a tour of how light makes objects visible.",
    why: "A lighter read that connects reflection, refraction, materials, and the limits of fictional invisibility.",
  },
  {
    title: "Imaging with Zero Photons",
    publisher: "APS Physics",
    topic: "physics",
    format: "Synopsis",
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
    publisher: "APS Physics",
    topic: "physics",
    format: "Viewpoint",
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
    publisher: "APS Physics",
    topic: "physics",
    format: "Synopsis",
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
    publisher: "APS Physics",
    topic: "physics",
    format: "Research news",
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
