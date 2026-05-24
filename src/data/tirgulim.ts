// Hedva 2 (Calculus 2 / חדו"א 2) practice sessions — "tirgulim".
//
// Each session maps to a real PDF under public/files/teaching/calculus-2/ and to
// the matching recorded sessions in youtubeVideos.ts (multiple engineering tracks
// were recorded per tutorial). Topic lists are the authoritative session contents.
//
// videoIds are matched to a session ONLY when the video title clearly states the
// tutorial number (תרגול N). No guessing.

export interface TirgulSession {
  id: string; // "tirgul1" … "tirgul5" — matches YouTubeVideo.relatedPractice
  titleHe: string;
  titleEn: string;
  topics: string[]; // Hebrew, as taught
  pdfPath: string; // served from /public; verified to exist
  videoIds: string[]; // matched recordings (see youtubeVideos.ts)
}

export const tirgulim: TirgulSession[] = [
  {
    id: "tirgul1",
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
];
