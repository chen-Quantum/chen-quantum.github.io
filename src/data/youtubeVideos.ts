// AUTO-DERIVED from the unlisted YouTube playlist via yt-dlp (flat metadata).
// Titles + durations are taken verbatim from YouTube; category/track/session
// were classified by hand from the (clear) Hebrew titles. 0 unknown videos.
//
// NOTE ON PRIVACY: these are UNLISTED YouTube videos, not private/secure.
// Anyone with the link (or this site) can view them. Embeds use the
// privacy-enhanced youtube-nocookie.com domain.

import { courseFor } from "./courses";

export type VideoCategory =
  | "hedva2"
  | "linear_algebra"
  | "group_theory"
  | "quantum"
  | "physics"
  | "project"
  | "other"
  | "unknown";

// Content kinds. Older rows omit this; the export below stamps a sensible
// default ("tutorial", or "exam-solution" when isExamQuestion is true).
export type ContentType =
  | "tutorial"
  | "worked-solution"
  | "exam-solution"
  | "song"
  | "memory-aid"
  | "lecture"
  | "playlist"
  | "other"
  | "unknown";

export interface YouTubeVideo {
  index: number;
  title: string; // original Hebrew title, verbatim from YouTube
  videoId: string;
  url: string; // canonical watch URL
  embedUrl: string; // privacy-enhanced youtube-nocookie embed
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  description: string;
  category: VideoCategory;
  relatedPractice: string | null; // tirgulN for Hedva 2, else null
  laTutorial: number | null; // tutorial number for Linear Algebra, else null
  isExamQuestion: boolean;
  track: string; // audience / engineering section
  sessionNote: string; // morning/afternoon/group/etc. (may be empty)
  topics: string[];
  visibilityNote: string;
  // Content kind (tutorial / worked-solution / song / …). Optional in raw rows;
  // the export stamps a default ("tutorial", or "exam-solution" when
  // isExamQuestion is true). New playlists set this explicitly.
  contentType?: ContentType;
  // Optional playlist provenance — for videos that come from a named playlist.
  playlistId?: string;
  playlistTitle?: string;
  // Course identity for the /teaching course filters. Derived from `category`
  // via courseFor() (see src/data/courses.ts) at export time — do NOT hand-edit
  // per row; set the row's `category` and these follow automatically.
  courseId: string;
  courseTag: string;
}

// Raw rows carry only the hand-classified fields; courseId/courseTag are stamped
// on at export time from `category` (keeps the 30 rows free of derived data and
// preserves all manual corrections). To add a video: append a row here.
type RawVideo = Omit<YouTubeVideo, "courseId" | "courseTag">;

const rawVideos: RawVideo[] = [
  { index: 1, title: "חדווא 2ב לביו רפואה - תרגול 5 - גבולות בכמה משתנים(הפרכות וטכניקות) ,נגזרות חלקיות , פולריות", videoId: "Sa86qqfw4qo", url: "https://www.youtube.com/watch?v=Sa86qqfw4qo", embedUrl: "https://www.youtube-nocookie.com/embed/Sa86qqfw4qo", thumbnail: "https://i.ytimg.com/vi/Sa86qqfw4qo/hqdefault.jpg", duration: "1:33:19", durationSeconds: 5599, description: "", category: "hedva2", relatedPractice: "tirgul5", laTutorial: null, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "limits in several variables, partial derivatives, polar coordinates", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 2, title: "תרגול 5 להנדסת חשמל  -גבולות בכמה משתנים, נגזרות חלקיות ודיפרנציאביליות", videoId: "IeuB2vLrdWE", url: "https://www.youtube.com/watch?v=IeuB2vLrdWE", embedUrl: "https://www.youtube-nocookie.com/embed/IeuB2vLrdWE", thumbnail: "https://i.ytimg.com/vi/IeuB2vLrdWE/hqdefault.jpg", duration: "1:24:16", durationSeconds: 5056, description: "", category: "hedva2", relatedPractice: "tirgul5", laTutorial: null, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "limits, partial derivatives, differentiability", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 3, title: "תרגול 5 להנדסות  - טופולוגיה בR^n , גבולות בכמה משתנים.", videoId: "r-jm6vs-UKs", url: "https://www.youtube.com/watch?v=r-jm6vs-UKs", embedUrl: "https://www.youtube-nocookie.com/embed/r-jm6vs-UKs", thumbnail: "https://i.ytimg.com/vi/r-jm6vs-UKs/hqdefault.jpg", duration: "1:35:46", durationSeconds: 5746, description: "", category: "hedva2", relatedPractice: "tirgul5", laTutorial: null, isExamQuestion: false, track: "Engineering (general)", sessionNote: "topology in Rⁿ and limits in several variables", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 4, title: "חדווא 2ב למכנית - תרגול 4 - טורי חזקות והתחלה של וקטורים", videoId: "FtkLBb8Qg3I", url: "https://www.youtube.com/watch?v=FtkLBb8Qg3I", embedUrl: "https://www.youtube-nocookie.com/embed/FtkLBb8Qg3I", thumbnail: "https://i.ytimg.com/vi/FtkLBb8Qg3I/hqdefault.jpg", duration: "1:36:08", durationSeconds: 5768, description: "", category: "hedva2", relatedPractice: "tirgul4", laTutorial: null, isExamQuestion: false, track: "Mechanical Engineering", sessionNote: "power series, start of vectors", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 5, title: "חדווא 2ב לביו רפואה - תרגול 4 - וקטורים", videoId: "iLDO1kCc9C0", url: "https://www.youtube.com/watch?v=iLDO1kCc9C0", embedUrl: "https://www.youtube-nocookie.com/embed/iLDO1kCc9C0", thumbnail: "https://i.ytimg.com/vi/iLDO1kCc9C0/hqdefault.jpg", duration: "1:28:38", durationSeconds: 5318, description: "", category: "hedva2", relatedPractice: "tirgul4", laTutorial: null, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "vectors", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 6, title: "חדווא 2 לחשמל - תרגול 3 - טורי חזקות", videoId: "AFRe_78THNw", url: "https://www.youtube.com/watch?v=AFRe_78THNw", embedUrl: "https://www.youtube-nocookie.com/embed/AFRe_78THNw", thumbnail: "https://i.ytimg.com/vi/AFRe_78THNw/hqdefault.jpg", duration: "1:34:39", durationSeconds: 5679, description: "", category: "hedva2", relatedPractice: "tirgul3", laTutorial: null, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "power series", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 7, title: "חדווא 2 להנדסות - תרגול 3 - טורי חזקות", videoId: "9h5nFUw8TB8", url: "https://www.youtube.com/watch?v=9h5nFUw8TB8", embedUrl: "https://www.youtube-nocookie.com/embed/9h5nFUw8TB8", thumbnail: "https://i.ytimg.com/vi/9h5nFUw8TB8/hqdefault.jpg", duration: "1:32:57", durationSeconds: 5577, description: "", category: "hedva2", relatedPractice: "tirgul3", laTutorial: null, isExamQuestion: false, track: "Engineering (general)", sessionNote: "power series", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 8, title: "חדווא 2 להנדסה מכנית - תרגול 3 - המשך טורי פונקציות וטורי חזקות", videoId: "jYF3NHwS1nU", url: "https://www.youtube.com/watch?v=jYF3NHwS1nU", embedUrl: "https://www.youtube-nocookie.com/embed/jYF3NHwS1nU", thumbnail: "https://i.ytimg.com/vi/jYF3NHwS1nU/hqdefault.jpg", duration: "1:26:39", durationSeconds: 5199, description: "", category: "hedva2", relatedPractice: "tirgul3", laTutorial: null, isExamQuestion: false, track: "Mechanical Engineering", sessionNote: "series of functions and power series", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 9, title: "חדווא 2ב להנדסות בתל אביב - תרגול 2", videoId: "YjdVK4S2Jsk", url: "https://www.youtube.com/watch?v=YjdVK4S2Jsk", embedUrl: "https://www.youtube-nocookie.com/embed/YjdVK4S2Jsk", thumbnail: "https://i.ytimg.com/vi/YjdVK4S2Jsk/hqdefault.jpg", duration: "1:35:19", durationSeconds: 5719, description: "", category: "hedva2", relatedPractice: "tirgul2", laTutorial: null, isExamQuestion: false, track: "Engineering (general)", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 10, title: "תרגול 1 - חדווא 2ב להנדסת חשמל", videoId: "gdYJK-CAlWk", url: "https://www.youtube.com/watch?v=gdYJK-CAlWk", embedUrl: "https://www.youtube-nocookie.com/embed/gdYJK-CAlWk", thumbnail: "https://i.ytimg.com/vi/gdYJK-CAlWk/hqdefault.jpg", duration: "1:31:57", durationSeconds: 5517, description: "", category: "hedva2", relatedPractice: "tirgul1", laTutorial: null, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 11, title: "תרגול 1 - חדווא 2ב להנדסה ביו רפואית (יום רביעי)", videoId: "_EMDuDfZFR8", url: "https://www.youtube.com/watch?v=_EMDuDfZFR8", embedUrl: "https://www.youtube-nocookie.com/embed/_EMDuDfZFR8", thumbnail: "https://i.ytimg.com/vi/_EMDuDfZFR8/hqdefault.jpg", duration: "1:30:01", durationSeconds: 5401, description: "", category: "hedva2", relatedPractice: "tirgul1", laTutorial: null, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "Wednesday group", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 12, title: "תרגול 1 - חדווא 2ב להנדסה מכנית", videoId: "rOSrXbCkRXc", url: "https://www.youtube.com/watch?v=rOSrXbCkRXc", embedUrl: "https://www.youtube-nocookie.com/embed/rOSrXbCkRXc", thumbnail: "https://i.ytimg.com/vi/rOSrXbCkRXc/hqdefault.jpg", duration: "1:26:08", durationSeconds: 5168, description: "", category: "hedva2", relatedPractice: "tirgul1", laTutorial: null, isExamQuestion: false, track: "Mechanical Engineering", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 13, title: "תרגול 1 - חדווא 2ב להנדסה ביו רפואית (יום שני)", videoId: "WV6eDm8i1j0", url: "https://www.youtube.com/watch?v=WV6eDm8i1j0", embedUrl: "https://www.youtube-nocookie.com/embed/WV6eDm8i1j0", thumbnail: "https://i.ytimg.com/vi/WV6eDm8i1j0/hqdefault.jpg", duration: "1:25:10", durationSeconds: 5110, description: "", category: "hedva2", relatedPractice: "tirgul1", laTutorial: null, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "Monday group", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 14, title: "לינארית לחשמל תרגול 13 צהריים אחרון", videoId: "gqS1pPvu5qg", url: "https://www.youtube.com/watch?v=gqS1pPvu5qg", embedUrl: "https://www.youtube-nocookie.com/embed/gqS1pPvu5qg", thumbnail: "https://i.ytimg.com/vi/gqS1pPvu5qg/hqdefault.jpg", duration: "1:33:49", durationSeconds: 5629, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 13, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "afternoon · final session", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 15, title: "שאלה ממבחן 2022 מכנית מטריצות מייצגות+ו״ע", videoId: "ErDLMXsSEJk", url: "https://www.youtube.com/watch?v=ErDLMXsSEJk", embedUrl: "https://www.youtube-nocookie.com/embed/ErDLMXsSEJk", thumbnail: "https://i.ytimg.com/vi/ErDLMXsSEJk/hqdefault.jpg", duration: "44:15", durationSeconds: 2655, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: true, track: "Mechanical Engineering", sessionNote: "2022 exam question · representing matrices + eigenvalues/eigenvectors", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 16, title: "לינארית לחשמל - תרגול 13 בוקר", videoId: "oT-QUUj4fOg", url: "https://www.youtube.com/watch?v=oT-QUUj4fOg", embedUrl: "https://www.youtube-nocookie.com/embed/oT-QUUj4fOg", thumbnail: "https://i.ytimg.com/vi/oT-QUUj4fOg/hqdefault.jpg", duration: "1:32:00", durationSeconds: 5520, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 13, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "morning", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 17, title: "לינארית לביו רפואה - תרגול 13 ואחרון", videoId: "QTUgOMT3XsU", url: "https://www.youtube.com/watch?v=QTUgOMT3XsU", embedUrl: "https://www.youtube-nocookie.com/embed/QTUgOMT3XsU", thumbnail: "https://i.ytimg.com/vi/QTUgOMT3XsU/hqdefault.jpg", duration: "1:30:04", durationSeconds: 5404, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 13, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "final session", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 18, title: "ליניארית לחשמל תרגול 12", videoId: "PuXRbY3MR0Y", url: "https://www.youtube.com/watch?v=PuXRbY3MR0Y", embedUrl: "https://www.youtube-nocookie.com/embed/PuXRbY3MR0Y", thumbnail: "https://i.ytimg.com/vi/PuXRbY3MR0Y/hqdefault.jpg", duration: "1:56:56", durationSeconds: 7016, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 12, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 19, title: "לינארית לביו רפואה - תרגול 12", videoId: "-xXnLM2D0bs", url: "https://www.youtube.com/watch?v=-xXnLM2D0bs", embedUrl: "https://www.youtube-nocookie.com/embed/-xXnLM2D0bs", thumbnail: "https://i.ytimg.com/vi/-xXnLM2D0bs/hqdefault.jpg", duration: "1:30:42", durationSeconds: 5442, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 12, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 20, title: "לינארית להנדסה - תרגול 11 השלמה בזום", videoId: "2_vovGfLaXc", url: "https://www.youtube.com/watch?v=2_vovGfLaXc", embedUrl: "https://www.youtube-nocookie.com/embed/2_vovGfLaXc", thumbnail: "https://i.ytimg.com/vi/2_vovGfLaXc/hqdefault.jpg", duration: "1:51:46", durationSeconds: 6706, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 11, isExamQuestion: false, track: "Engineering (general)", sessionNote: "Zoom make-up", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 21, title: "לינארית לביו רפואה - תרגול 11", videoId: "36hPC5Df4QI", url: "https://www.youtube.com/watch?v=36hPC5Df4QI", embedUrl: "https://www.youtube-nocookie.com/embed/36hPC5Df4QI", thumbnail: "https://i.ytimg.com/vi/36hPC5Df4QI/hqdefault.jpg", duration: "1:36:15", durationSeconds: 5775, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 11, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 22, title: "לינארית לביולוגיה רפואה יום שלישי תרגול 10", videoId: "vZoQV4bFF78", url: "https://www.youtube.com/watch?v=vZoQV4bFF78", embedUrl: "https://www.youtube-nocookie.com/embed/vZoQV4bFF78", thumbnail: "https://i.ytimg.com/vi/vZoQV4bFF78/hqdefault.jpg", duration: "1:35:17", durationSeconds: 5717, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 10, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "Tuesday group", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 23, title: "לינארית לחשמליסטים - תרגול 10", videoId: "NyXE5_uDZ-A", url: "https://www.youtube.com/watch?v=NyXE5_uDZ-A", embedUrl: "https://www.youtube-nocookie.com/embed/NyXE5_uDZ-A", thumbnail: "https://i.ytimg.com/vi/NyXE5_uDZ-A/hqdefault.jpg", duration: "1:36:41", durationSeconds: 5801, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 10, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 24, title: "לינארית לביולוגיה רפואה - תרגול 9 יום רביעי", videoId: "uI71yDBKYNs", url: "https://www.youtube.com/watch?v=uI71yDBKYNs", embedUrl: "https://www.youtube-nocookie.com/embed/uI71yDBKYNs", thumbnail: "https://i.ytimg.com/vi/uI71yDBKYNs/hqdefault.jpg", duration: "1:38:15", durationSeconds: 5895, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 9, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "Wednesday group", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 25, title: "לינארית לביו-רפואה תרגול 9 קבוצה שלישי", videoId: "KIhNvE5yw0I", url: "https://www.youtube.com/watch?v=KIhNvE5yw0I", embedUrl: "https://www.youtube-nocookie.com/embed/KIhNvE5yw0I", thumbnail: "https://i.ytimg.com/vi/KIhNvE5yw0I/hqdefault.jpg", duration: "1:35:07", durationSeconds: 5707, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 9, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "Tuesday group", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 26, title: "לינארית לחשמל תרגול 9  קבוצה צהריים", videoId: "klqgBG28a74", url: "https://www.youtube.com/watch?v=klqgBG28a74", embedUrl: "https://www.youtube-nocookie.com/embed/klqgBG28a74", thumbnail: "https://i.ytimg.com/vi/klqgBG28a74/hqdefault.jpg", duration: "1:32:48", durationSeconds: 5568, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 9, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "afternoon group", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 27, title: "לינארית לחשמל תרגול 9 - שלישי בוקר", videoId: "ehtLUKVJWTw", url: "https://www.youtube.com/watch?v=ehtLUKVJWTw", embedUrl: "https://www.youtube-nocookie.com/embed/ehtLUKVJWTw", thumbnail: "https://i.ytimg.com/vi/ehtLUKVJWTw/hqdefault.jpg", duration: "1:45:06", durationSeconds: 6306, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 9, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "Tuesday morning", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 28, title: "לינארית לחשמל -תרגול 8 בוקררר", videoId: "t44ITGiL-e0", url: "https://www.youtube.com/watch?v=t44ITGiL-e0", embedUrl: "https://www.youtube-nocookie.com/embed/t44ITGiL-e0", thumbnail: "https://i.ytimg.com/vi/t44ITGiL-e0/hqdefault.jpg", duration: "1:36:28", durationSeconds: 5788, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 8, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "morning", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 29, title: "לינארית לביו-רפואה - תרגול 8 יום רביעי", videoId: "i6ql3gmfc18", url: "https://www.youtube.com/watch?v=i6ql3gmfc18", embedUrl: "https://www.youtube-nocookie.com/embed/i6ql3gmfc18", thumbnail: "https://i.ytimg.com/vi/i6ql3gmfc18/hqdefault.jpg", duration: "1:38:00", durationSeconds: 5880, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 8, isExamQuestion: false, track: "Biomedical Engineering", sessionNote: "Wednesday group", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },
  { index: 30, title: "לינארית לחשמל - תרגול 8 צהריים", videoId: "N6LBon7c3HA", url: "https://www.youtube.com/watch?v=N6LBon7c3HA", embedUrl: "https://www.youtube-nocookie.com/embed/N6LBon7c3HA", thumbnail: "https://i.ytimg.com/vi/N6LBon7c3HA/hqdefault.jpg", duration: "1:33:07", durationSeconds: 5587, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: 8, isExamQuestion: false, track: "Electrical Engineering", sessionNote: "afternoon", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it." },

  // ── Appended playlists (existing 30 rows above are unchanged). ──────────────
  // P1 · שאלות ממבחנים - לינארית להנדסת חשמל  (exam-solution · LA · Electrical)
  { index: 31, title: "אלגברה לינארית - מציאת בסיס למימד לחיתוך וסכום (שאלה ממבחן)", videoId: "smjyXbm2Y-8", url: "https://www.youtube.com/watch?v=smjyXbm2Y-8", embedUrl: "https://www.youtube-nocookie.com/embed/smjyXbm2Y-8", thumbnail: "https://i.ytimg.com/vi/smjyXbm2Y-8/hqdefault.jpg", duration: "19:42", durationSeconds: 1182, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: true, track: "Electrical Engineering", sessionNote: "exam question — basis and dimension for intersection and sum", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "exam-solution", playlistId: "PLm0oTNdEqyanqRzbtG56IX1fzIjknH6An", playlistTitle: "שאלות ממבחנים - לינארית להנדסת חשמל" },
  { index: 32, title: "אלגברה לינארית - מציאת בסיס למימד לתתי מרחבים (שאלה ממבחן)", videoId: "TZGM2YB4BoY", url: "https://www.youtube.com/watch?v=TZGM2YB4BoY", embedUrl: "https://www.youtube-nocookie.com/embed/TZGM2YB4BoY", thumbnail: "https://i.ytimg.com/vi/TZGM2YB4BoY/hqdefault.jpg", duration: "13:40", durationSeconds: 820, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: true, track: "Electrical Engineering", sessionNote: "exam question — basis and dimension for subspaces", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "exam-solution", playlistId: "PLm0oTNdEqyanqRzbtG56IX1fzIjknH6An", playlistTitle: "שאלות ממבחנים - לינארית להנדסת חשמל" },
  // P3 · תרגילים ופתרונות בתורת החבורות  (worked-solution · Group Theory)
  { index: 33, title: "תורת החבורות - תהי חבורה pית אז לכל חזקת p מתאימה קיימת תת״ח נורמלית", videoId: "azBkoNLUs8M", url: "https://www.youtube.com/watch?v=azBkoNLUs8M", embedUrl: "https://www.youtube-nocookie.com/embed/azBkoNLUs8M", thumbnail: "https://i.ytimg.com/vi/azBkoNLUs8M/hqdefault.jpg", duration: "13:29", durationSeconds: 809, description: "", category: "group_theory", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "p-group: for every order p^k there exists a normal subgroup of that order", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "worked-solution", playlistId: "PLm0oTNdEqyalMoJvzAouqqQoCU3NyWiBI", playlistTitle: "תרגילים ופתרונות בתורת החבורות" },
  // P4 · אלגברה לינארית טריקים שתיקים ודברים לזכור  (memory-aid · LA)
  { index: 34, title: "תנאים שקולים להפיכות מטריצה", videoId: "KJ5TNM4b8TU", url: "https://www.youtube.com/watch?v=KJ5TNM4b8TU", embedUrl: "https://www.youtube-nocookie.com/embed/KJ5TNM4b8TU", thumbnail: "https://i.ytimg.com/vi/KJ5TNM4b8TU/hqdefault.jpg", duration: "7:05", durationSeconds: 425, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "equivalent conditions for matrix invertibility", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "memory-aid", playlistId: "PLm0oTNdEqyamkS2BnpUAV7T_O9tHIG0NB", playlistTitle: "אלגברה לינארית טריקים שתיקים ודברים לזכור" },
  // P5 · אלגברה לינארית - ו״ע, ע״ע, מ״ע, פ״א  (worked-solution · LA)
  { index: 35, title: "שאלה על ערכים עצמיים", videoId: "yZ8u7h6ozVY", url: "https://www.youtube.com/watch?v=yZ8u7h6ozVY", embedUrl: "https://www.youtube-nocookie.com/embed/yZ8u7h6ozVY", thumbnail: "https://i.ytimg.com/vi/yZ8u7h6ozVY/hqdefault.jpg", duration: "10:30", durationSeconds: 630, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "eigenvalues exercise", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "worked-solution", playlistId: "PLm0oTNdEqyalwtYng6d2FFijOXHsBT_Sn", playlistTitle: "אלגברה לינארית - ו״ע, ע״ע ,מ״ע ,פ״א ." },
  // P6 · Span Of Consciousness (EP) — original Linear Algebra songs across styles
  { index: 36, title: "Is This Matrix INVERTIBLE? - JAZZ Edition", videoId: "FfgbA3mzCIk", url: "https://www.youtube.com/watch?v=FfgbA3mzCIk", embedUrl: "https://www.youtube-nocookie.com/embed/FfgbA3mzCIk", thumbnail: "https://i.ytimg.com/vi/FfgbA3mzCIk/hqdefault.jpg", duration: "3:32", durationSeconds: 212, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "jazz edition", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "song", playlistId: "PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y", playlistTitle: "Span Of Consciousness (EP)" },
  { index: 37, title: "Is This Matrix INVERTIBLE? - Techno Festival live", videoId: "WVJruw0hlPc", url: "https://www.youtube.com/watch?v=WVJruw0hlPc", embedUrl: "https://www.youtube-nocookie.com/embed/WVJruw0hlPc", thumbnail: "https://i.ytimg.com/vi/WVJruw0hlPc/hqdefault.jpg", duration: "3:21", durationSeconds: 201, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "techno · festival live", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "song", playlistId: "PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y", playlistTitle: "Span Of Consciousness (EP)" },
  { index: 38, title: "Dimension TheoremS", videoId: "XEXLwitVLKs", url: "https://www.youtube.com/watch?v=XEXLwitVLKs", embedUrl: "https://www.youtube-nocookie.com/embed/XEXLwitVLKs", thumbnail: "https://i.ytimg.com/vi/XEXLwitVLKs/hqdefault.jpg", duration: "3:44", durationSeconds: 224, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "song", playlistId: "PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y", playlistTitle: "Span Of Consciousness (EP)" },
  { index: 39, title: "I SAY LINEAR COMBO - HITECH Trance", videoId: "uSx5mZZ6-xc", url: "https://www.youtube.com/watch?v=uSx5mZZ6-xc", embedUrl: "https://www.youtube-nocookie.com/embed/uSx5mZZ6-xc", thumbnail: "https://i.ytimg.com/vi/uSx5mZZ6-xc/hqdefault.jpg", duration: "2:34", durationSeconds: 154, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "hi-tech trance", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "song", playlistId: "PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y", playlistTitle: "Span Of Consciousness (EP)" },
  { index: 40, title: "I SAY LINEAR COMBO - Nitzhonot GOA Trance", videoId: "wOzP-UZqgsw", url: "https://www.youtube.com/watch?v=wOzP-UZqgsw", embedUrl: "https://www.youtube-nocookie.com/embed/wOzP-UZqgsw", thumbnail: "https://i.ytimg.com/vi/wOzP-UZqgsw/hqdefault.jpg", duration: "7:29", durationSeconds: 449, description: "", category: "linear_algebra", relatedPractice: null, laTutorial: null, isExamQuestion: false, track: "", sessionNote: "Nitzhonot GOA trance", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "song", playlistId: "PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y", playlistTitle: "Span Of Consciousness (EP)" },

  // ── New upload to the main playlist (PLm0oTNdEqyakr9oIlO9PSWB9RzApsSEoW). ──
  // Hedva 2 tutorial 6 (engineering general track). Matched to tirgul6.pdf.
  { index: 41, title: "חדווא 2 להנדסות - תרגול 6 - נגזרת כיוונית , מישור משיק ושאר החבר׳ס", videoId: "BNwvvzMndGA", url: "https://www.youtube.com/watch?v=BNwvvzMndGA", embedUrl: "https://www.youtube-nocookie.com/embed/BNwvvzMndGA", thumbnail: "https://i.ytimg.com/vi/BNwvvzMndGA/hqdefault.jpg", duration: "1:22:12", durationSeconds: 4932, description: "", category: "hedva2", relatedPractice: "tirgul6", laTutorial: null, isExamQuestion: false, track: "Engineering (general)", sessionNote: "directional derivative, tangent plane, and related topics", topics: [], visibilityNote: "Unlisted YouTube video. Anyone with the link can view it.", contentType: "tutorial", playlistId: "PLm0oTNdEqyakr9oIlO9PSWB9RzApsSEoW", playlistTitle: "חדווא 2 2026 סמסטר ב׳" },
];

// Stamp courseId/courseTag onto every video from its category (single source of
// truth = the course registry in courses.ts). Also default contentType for
// rows that don't set it ("tutorial", or "exam-solution" for exam questions).
// This is the public export.
export const youtubeVideos: YouTubeVideo[] = rawVideos.map((v) => ({
  ...v,
  contentType:
    v.contentType ?? (v.isExamQuestion ? "exam-solution" : "tutorial"),
  ...courseFor(v.category),
}));

export const hedva2Videos = youtubeVideos.filter((v) => v.category === "hedva2");
export const linearAlgebraVideos = youtubeVideos.filter((v) => v.category === "linear_algebra");
export const groupTheoryVideos = youtubeVideos.filter((v) => v.category === "group_theory");
export const unknownVideos = youtubeVideos.filter((v) => v.category === "unknown");

export function videosForPractice(id: string): YouTubeVideo[] {
  return youtubeVideos.filter((v) => v.relatedPractice === id);
}

export function videosByContentType(type: ContentType): YouTubeVideo[] {
  return youtubeVideos.filter((v) => v.contentType === type);
}

export function videosByPlaylist(playlistId: string): YouTubeVideo[] {
  return youtubeVideos.filter((v) => v.playlistId === playlistId);
}
