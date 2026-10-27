// Shared, existing materials for the International Engineering programme.
// Only include lecture notes and recitations actually uploaded to the site.
export const internationalLectureNotes = {
  number: 1,
  title: "Lecture 1: English student notes",
  pdf: "/materials/international-engineering/lecture-01-student-notes-en.pdf",
  sourceCredit: "Original notes by Yochai Maayan",
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
