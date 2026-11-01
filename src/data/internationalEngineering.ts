// Shared, existing materials for the International Engineering programme.
// Only include lecture notes and recitations actually uploaded to the site.
export const internationalLectureNotes = [
  { number: 1, title: "Week 1: Student notes", pdf: "/materials/international-engineering/lecture-01-student-notes-en.pdf" },
  { number: 2, title: "Week 2: Student notes", pdf: "/materials/international-engineering/lecture-02-student-notes-en.pdf" },
  { number: 3, title: "Week 3: Student notes", pdf: "/materials/international-engineering/lecture-03-student-notes-en.pdf" },
  { number: 4, title: "Week 4: Student notes", pdf: "/materials/international-engineering/lecture-04-student-notes-en.pdf" },
  { number: 5, title: "Week 5: Student notes", pdf: "/materials/international-engineering/lecture-05-student-notes-en.pdf" },
  { number: 6, title: "Week 6: Student notes", pdf: "/materials/international-engineering/lecture-06-student-notes-en.pdf" },
] as const;

export const internationalLectureArchive = {
  title: "Weeks 1-6: all lecture notes",
  zip: "/materials/international-engineering/lecture-notes-weeks-01-06-en.zip",
} as const;

export const internationalEarlierRecitations = [
  {
    number: 1,
    title: "Recitation 1: Complex Numbers and Induction",
    pdf: "/materials/international-engineering/recitation-01-en.pdf",
  },
  {
    number: 2,
    title: "Recitation 2: Proof Methods, Sets and Fields",
    pdf: "/materials/international-engineering/recitation-02-en.pdf",
  },
] as const;
