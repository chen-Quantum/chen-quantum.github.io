import { getCollection } from "astro:content";
import { engineeringTutorials } from "./academicYear2026";
import { tirgulim } from "./tirgulim";
import { practiceTopicsEn } from "./englishTeaching";

export interface SiteSearchEntry {
  title: string;
  url: string;
  description: string;
  category: string;
  keywords?: string;
}

// Only published page metadata belongs here. Never index classroom messages,
// student records, access codes, gated files, or Markdown body comments.
export async function getSiteSearchEntries(): Promise<SiteSearchEntry[]> {
  const pages: SiteSearchEntry[] = [
    { title: "Teaching · 2026–2027", url: "/teaching/2026-2027", description: "Current courses, classroom links, 13 linear algebra tutorials, and activities in English and Hebrew.", category: "Teaching", keywords: "קורסים הוראה אלגברה לינארית תרגולים" },
    { title: "International Engineering · English course materials", url: "/teaching/international-engineering/", description: "Complete English Linear Algebra tutorial booklet, lecture notes, earlier recitations, activities, and classroom access instructions.", category: "Teaching", keywords: "linear algebra lecture notes English translation international engineering Columbia recitations אלגברה לינארית בינלאומי" },
    { title: "Linear Algebra · Complete tutorial booklet in English", url: "/teaching/international-engineering/#tutorial-booklet", description: "All 13 tutorials by Chen Gadi, with numbered exercises, worked solutions, diagrams, and the logic appendix. English and Hebrew PDF editions.", category: "Teaching", keywords: "booklet handbook book exercises solutions English translation international Columbia תרגולים חוברת אנגלית" },
    { title: "Student Hub", url: "/students", description: "Course classrooms, anonymous questions, peer answers, and private requests. Read replies on the website.", category: "Teaching", keywords: "סטודנטים שאלות כיתה" },
    { title: "Projects & code", url: "/projects", description: "Public projects, research previews, repository links, and release status.", category: "Projects" },
    { title: "Quantum community", url: "/quantum-community", description: "Quantum science conversations, community activities, and events at Tel Aviv University.", category: "Community", keywords: "קהילה קוונטים קוונטום QTC QuanTAU" },
    { title: "Interactive linear algebra lab · English", url: "/teaching/linear-algebra/lab/en/", description: "Explore the 13 linear algebra activities in English.", category: "Teaching", keywords: "vectors matrices eigenvalues projections Gram Schmidt lab interactive" },
    { title: "Interactive linear algebra lab · Hebrew", url: "/teaching/linear-algebra/lab/", description: "The same interactive activity collection with Hebrew course material.", category: "Teaching", keywords: "מעבדה אינטראקטיבית אלגברה לינארית ערכים עצמיים מטריצות" },
    { title: "Guided LLM activities · English", url: "/teaching/linear-algebra/llm/en/", description: "Linear algebra activities for learning with language models, in English.", category: "Teaching", keywords: "AI assignments prompts" },
    { title: "Guided LLM activities · Hebrew", url: "/teaching/linear-algebra/llm/", description: "Linear algebra activities for learning with language models, in Hebrew.", category: "Teaching", keywords: "בינה מלאכותית מטלות" },
    { title: "Teaching archive", url: "/teaching", description: "Find tutorial recordings, calculus practice sheets, and course resources.", category: "Teaching", keywords: "recordings calculus hedva חדוא הקלטות" },
    { title: "Linear algebra resources", url: "/teaching/linear-algebra", description: "Tutorial recordings, practice material, and links for linear algebra students.", category: "Teaching", keywords: "אלגברה לינארית" },
    { title: "Electrical Engineering · English syllabus", url: "/teaching/linear-algebra-electrical/syllabus", description: "Course topics, assessment, and study resources for linear algebra.", category: "Teaching", keywords: "syllabus grading exam סילבוס חשמל ציון" },
    { title: "Recommended books & student resources", url: "/reading#for-students", description: "Books, lectures, and additional material for independent study.", category: "Teaching", keywords: "books textbooks ספרים" },
    { title: "Course archive", url: "/courses", description: "Course overviews and reference material from earlier teaching pages.", category: "Teaching" },
    { title: "Research", url: "/research", description: "M.Sc. in Physics under Prof. Yaron Oz at Tel Aviv University, with links to public work.", category: "Academic", keywords: "physics מחקר פיזיקה" },
    { title: "Curriculum vitae", url: "/cv", description: "Education, teaching experience, and academic activities, available as a web page.", category: "Academic", keywords: "CV resume biography קורות חיים" },
    { title: "About Chen Gadi", url: "/about", description: "Academic background, teaching, and community involvement.", category: "Academic", keywords: "חן גדי" },
    { title: "Contact", url: "/contact", description: "Choose the right channel for a general enquiry, course question, or private request.", category: "Academic", keywords: "צור קשר" },
    { title: "Reading room", url: "/reading", description: "A curated selection of articles about science, technology, and ideas.", category: "Academic", keywords: "reading articles recommendations קריאה" },
    { title: "Community events", url: "/quantum-community/events", description: "Upcoming announcements and the archive of quantum community meetings.", category: "Community", keywords: "events calendar אירועים כנסים" },
    { title: "Community gallery", url: "/quantum-community/gallery", description: "Posters and moments from the quantum community event archive.", category: "Community" },
    { title: "Chen Gadi · Home", url: "/", description: "Physics, teaching, and quantum community at Tel Aviv University.", category: "Academic", keywords: "חן גדי" },
  ];
  const [projects, events, courses] = await Promise.all([
    getCollection("projects", ({ data }) => !data.draft),
    getCollection("communityEvents", ({ data }) => !data.draft),
    getCollection("courses", ({ data }) => !data.draft),
  ]);
  return [
    ...pages,
    ...engineeringTutorials.map((tutorial) => ({
      title: "Linear algebra · Tutorial " + tutorial.number + ": " + tutorial.title,
      url: "/teaching/2026-2027#tutorial-" + tutorial.number,
      description: "Tutorial booklet in English and Hebrew, with interactive activities in both languages.",
      category: "Teaching",
      keywords: "linear algebra engineering אלגברה לינארית תרגול " + tutorial.number,
    })),
    ...tirgulim.map((session, index) => ({
      title: "Calculus 2 · Tutorial " + (index + 1) + ": " + session.titleEn,
      url: "/teaching#" + session.id,
      description: (practiceTopicsEn[session.id] || []).join(". ") || "Practice sheet in Hebrew and associated tutorial recordings.",
      category: "Teaching",
      keywords: [session.titleHe, ...session.topics, "calculus hedva חדוא"].join(" "),
    })),
    ...projects.map(({ id, data }) => ({
      title: data.title, url: "/projects#project-" + id,
      description: data.description, category: "Projects",
      keywords: [...data.tech, data.status || "", data.repoLabel || "", data.repoNote || ""].join(" "),
    })),
    ...events.map(({ id, data }) => ({
      title: data.title, url: "/quantum-community/events/" + id,
      description: data.description, category: "Community",
      keywords: [data.dateDisplay || "", data.venue || "", ...data.speakers, ...data.partners].join(" "),
    })),
    ...courses.map(({ id, data }) => ({
      title: data.title + " · Course overview", url: "/courses/" + id,
      description: data.shortDescription, category: "Teaching",
      keywords: data.tags.join(" "),
    })),
  ];
}
