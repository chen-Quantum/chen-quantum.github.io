// Hedva 2 (Calculus 2 / חדו"א 2) practice sessions — "tirgulim".
//
// Each session maps to a real PDF under public/files/teaching/calculus-2/ and to
// the matching recorded sessions in youtubeVideos.ts (multiple engineering tracks
// were recorded per tutorial). Topic lists are the authoritative session contents.
//
// videoIds are matched to a session ONLY when the video title clearly states the
// tutorial number (תרגול N). No guessing.

export interface TirgulSession {
  id: string; // "tirgul1" … — matches YouTubeVideo.relatedPractice
  courseId: string; // course identity for /teaching filters (see courses.ts)
  titleHe: string;
  titleEn: string;
  topics: string[]; // Hebrew, as taught
  pdfPath: string; // served from /public; verified to exist
  videoIds: string[]; // matched recordings (see youtubeVideos.ts)
  tags?: string[]; // optional free-form tags (e.g. ["exam-prep"])
}

export const tirgulim: TirgulSession[] = [
  {
    id: "tirgul1",
    courseId: "hedva2",
    titleHe: "תרגול 1 — התכנסות סדרות פונקציות",
    titleEn: "Convergence of sequences of functions",
    topics: [
      "התכנסות נקודתית של סדרות פונקציות",
      "התכנסות במידה שווה",
      "מבחן הסופרימום",
      "דוגמאות מנחות",
      "גבול נקודתי, שלילת התכנסות במידה שווה, והתכנסות על תתי-תחומים",
    ],
    pdfPath: "/files/teaching/calculus-2/tirgul1.pdf",
    videoIds: ["gdYJK-CAlWk", "_EMDuDfZFR8", "rOSrXbCkRXc", "WV6eDm8i1j0"],
  },
  {
    id: "tirgul2",
    courseId: "hedva2",
    titleHe: "תרגול 2 — טורי פונקציות ועוד",
    titleEn: "Series of functions and more",
    topics: [
      "המשך התכנסות סדרות פונקציות",
      "קריטריון הסופרימום",
      "רציפות הגבול תחת התכנסות במידה שווה",
      "טורי פונקציות",
      "מבחן ויירשטראס",
      "התכנסות בהחלט ובמידה שווה",
      "אינטגרציה וגזירה של סדרות וטורי פונקציות",
    ],
    pdfPath: "/files/teaching/calculus-2/tirgul2.pdf",
    videoIds: ["YjdVK4S2Jsk"],
  },
  {
    id: "tirgul3",
    courseId: "hedva2",
    titleHe: "תרגול 3 — טורי חזקות",
    titleEn: "Power series",
    topics: [
      "הגדרת טור חזקות",
      "תחום התכנסות",
      "רדיוס התכנסות",
      "משפט אבל",
      "נוסחת קושי-הדמר",
      "נוסחת מנת המקדמים",
      "בדיקת קצוות",
      "גזירה ואינטגרציה איבר-איבר",
      "חישוב רדיוס ותחום התכנסות",
    ],
    pdfPath: "/files/teaching/calculus-2/tirgul3.pdf",
    videoIds: ["AFRe_78THNw", "9h5nFUw8TB8", "jYF3NHwS1nU"],
  },
  {
    id: "tirgul4",
    courseId: "hedva2",
    titleHe: "תרגול 4 — וקטורים, מישורים, משטחים, תחום הגדרה, קווי גובה, טופולוגיה וקשירות",
    titleEn:
      "Vectors, planes, surfaces, domains, level curves, topology and connectedness",
    topics: [
      "מכפלה פנימית",
      "היטל אורתוגונלי",
      "מכפלה וקטורית",
      "ישרים במרחב",
      "מישורים",
      "משטחים ריבועיים",
      "תחום הגדרה של פונקציות בכמה משתנים",
      "קווי גובה ומשטחי רמה",
      "טופולוגיה ב-Rⁿ",
      "קבוצות פתוחות וסגורות",
      "פנים, שפה וסגור",
      "חסימות וקומפקטיות",
      "קשירות וקשירות מסילתית",
    ],
    pdfPath: "/files/teaching/calculus-2/tirgul4.pdf",
    videoIds: ["FtkLBb8Qg3I", "iLDO1kCc9C0"],
  },
  {
    id: "tirgul5",
    courseId: "hedva2",
    titleHe: "תרגול 5 — גבולות, רציפות, נגזרות חלקיות ודיפרנציאביליות",
    titleEn: "Limits, continuity, partial derivatives and differentiability",
    topics: [
      "גבול לפי ε-δ בכמה משתנים",
      "ההבדל בין גבול חד-ממדי לרב-ממדי",
      "שיטת מסלולים להפרכת גבול",
      "כלל הסנדוויץ'",
      "קואורדינטות פולריות סביב נקודה",
      "רציפות",
      "נגזרות חלקיות",
      "נגזרות כיווניות",
      "דיפרנציאביליות",
      "דיפרנציאביליות גוררת רציפות וקיום נגזרות חלקיות (אך לא להפך)",
    ],
    pdfPath: "/files/teaching/calculus-2/tirgul5.pdf",
    videoIds: ["Sa86qqfw4qo", "IeuB2vLrdWE", "r-jm6vs-UKs"],
  },
  {
    // tirgul6 PDF was copied from ../tirgulim/tirgul6.pdf. The topics list is
    // intentionally left empty — the skill does not parse PDFs and does not
    // invent topic names. Add topics here once the session content is provided.
    id: "tirgul6",
    courseId: "hedva2",
    titleHe: "תרגול 6",
    titleEn: "Practice sheet 6",
    topics: [],
    pdfPath: "/files/teaching/calculus-2/tirgul6.pdf",
    videoIds: ["BNwvvzMndGA", "uELbKWDmI68"],
  },
  {
    // tirgul7 PDF was copied from ../tirgulim/tirgul7.pdf. Topics are left empty
    // — the session contents are not parsed from the PDF and not invented. Add
    // them here once the session content is provided.
    id: "tirgul7",
    courseId: "hedva2",
    titleHe: "תרגול 7",
    titleEn: "Practice sheet 7",
    topics: [],
    pdfPath: "/files/teaching/calculus-2/tirgul7.pdf",
    videoIds: ["yVU2b8tFQqc", "6KdvvXKJ0Q0"],
  },
  {
    // Copied from ../tirgulim/תרגול 8 של הביוקר -משוואות סתומות נק קיצון.pdf.
    // Topics are left empty instead of being inferred from the PDF contents.
    id: "tirgul8",
    courseId: "hedva2",
    titleHe: "תרגול 8",
    titleEn: "Practice sheet 8",
    topics: [],
    pdfPath: "/files/teaching/calculus-2/tirgul8.pdf",
    videoIds: ["o5ma3KJTytE", "NAefZGXrn-4", "ERBwkt_Y58M"],
  },
  {
    // Copied from ../tirgulim/תרגול 9 -אינטגרליפ כפולים.pdf.
    // Topics are left empty instead of being inferred from the PDF contents.
    id: "tirgul9",
    courseId: "hedva2",
    titleHe: "תרגול 9",
    titleEn: "Practice sheet 9",
    topics: [],
    pdfPath: "/files/teaching/calculus-2/tirgul9.pdf",
    videoIds: ["wvPMXV-uoFw"],
  },
  {
    // Copied from ../tirgulim/תרגול 10 -אינטגרלים משולשים.pdf.
    // Topics are left empty instead of being inferred from the PDF contents.
    id: "tirgul10",
    courseId: "hedva2",
    titleHe: "תרגול 10 — אינטגרלים משולשים",
    titleEn: "Triple integrals",
    topics: [],
    pdfPath: "/files/teaching/calculus-2/tirgul10.pdf",
    videoIds: ["PC-q415eLvU", "PBCggtB-Ayk", "qLyxqHZCzGE", "q6thMbb2VPs"],
  },
  {
    // Copied from ../tirgulim/דף תרגול 11 - איטנגרלים קווים עמקוים פרמטריים משפט גרין.pdf.
    // Topics are left empty instead of being inferred from the PDF contents.
    id: "tirgul11",
    courseId: "hedva2",
    titleHe: "תרגול 11",
    titleEn: "Practice sheet 11",
    topics: [],
    pdfPath: "/files/teaching/calculus-2/tirgul11.pdf",
    videoIds: ["Wl8GTdup7zk", "uiQYDmSx_cw", "VV16DidUM-M"],
  },
  {
    // Copied from ../tirgulim/דף תרגול 12 ואחרון - אינטגרלים משטחיים , משפט גאוס וסטוקס.pdf.
    // Topics are left empty instead of being inferred from the PDF contents.
    id: "tirgul12",
    courseId: "hedva2",
    titleHe: "תרגול 12",
    titleEn: "Practice sheet 12",
    topics: [],
    pdfPath: "/files/teaching/calculus-2/tirgul12.pdf",
    videoIds: ["x7daItXdVJc", "vo8dhVKLmFw"],
  },
];
