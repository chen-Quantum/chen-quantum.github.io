// Teaching playlists — source-of-truth metadata for the YouTube playlists that
// videos in src/data/youtubeVideos.ts come from. Used by /teaching and the
// dedicated /teaching/linear-algebra subpage to render grouped sections (per
// playlist / per content type) without hand-crafting the same metadata twice.
//
// Adding a new playlist: append a row here AND ingest its videos into
// youtubeVideos.ts with `playlistId` set. `confidence` reflects how
// unambiguous the classification is from the playlist + video titles alone.
//
// Conventions:
//   - `id`      = the YouTube `list=` parameter (stable identifier).
//   - `url`     = canonical playlist URL.
//   - `title`   = verbatim playlist title.
//   - `videoIds`= list of video ids that belong to this playlist (matches
//                 youtubeVideos.ts rows where `playlistId === id`).
//   - `notes`   = anything that needs manual follow-up.

import type { ContentType } from "./youtubeVideos";

export interface TeachingPlaylist {
  id: string;
  url: string;
  title: string;
  courseId: string;
  contentType: ContentType;
  description?: string;
  videoIds: string[];
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export const teachingPlaylists: TeachingPlaylist[] = [
  {
    // Original main teaching playlist. Mixed content (Hedva 2 + Linear
    // Algebra) — each video is classified individually in youtubeVideos.ts.
    id: "PLm0oTNdEqyakr9oIlO9PSWB9RzApsSEoW",
    url: "https://www.youtube.com/playlist?list=PLm0oTNdEqyakr9oIlO9PSWB9RzApsSEoW",
    title: "חדווא 2 2026 סמסטר ב׳",
    courseId: "other",
    contentType: "tutorial",
    description:
      "Recorded tutorial sessions across multiple engineering tracks " +
      "(Hedva 2 + Linear Algebra; per-video classification).",
    videoIds: [
      "Sa86qqfw4qo", "IeuB2vLrdWE", "r-jm6vs-UKs", "FtkLBb8Qg3I",
      "iLDO1kCc9C0", "AFRe_78THNw", "9h5nFUw8TB8", "jYF3NHwS1nU",
      "YjdVK4S2Jsk", "gdYJK-CAlWk", "_EMDuDfZFR8", "rOSrXbCkRXc",
      "WV6eDm8i1j0", "gqS1pPvu5qg", "ErDLMXsSEJk", "oT-QUUj4fOg",
      "QTUgOMT3XsU", "PuXRbY3MR0Y", "-xXnLM2D0bs", "2_vovGfLaXc",
      "36hPC5Df4QI", "vZoQV4bFF78", "NyXE5_uDZ-A", "uI71yDBKYNs",
      "KIhNvE5yw0I", "klqgBG28a74", "ehtLUKVJWTw", "t44ITGiL-e0",
      "i6ql3gmfc18", "N6LBon7c3HA", "BNwvvzMndGA",
    ],
    confidence: "high",
    notes:
      "Original main teaching playlist; video-level classification is " +
      "required because it contains both Hedva 2 and Linear Algebra " +
      "recordings.",
  },
  {
    id: "PLm0oTNdEqyanqRzbtG56IX1fzIjknH6An",
    url: "https://www.youtube.com/playlist?list=PLm0oTNdEqyanqRzbtG56IX1fzIjknH6An",
    title: "שאלות ממבחנים - לינארית להנדסת חשמל",
    courseId: "linear-algebra",
    contentType: "exam-solution",
    description: "Worked exam questions, Linear Algebra (Electrical Engineering track).",
    videoIds: ["smjyXbm2Y-8", "TZGM2YB4BoY"],
    confidence: "high",
  },
  {
    id: "PLm0oTNdEqyakeEk6T3jTBxeqS5z_zUzEv",
    url: "https://www.youtube.com/playlist?list=PLm0oTNdEqyakeEk6T3jTBxeqS5z_zUzEv",
    title: "שתי וקטורים הם בתל אממ הם לא צל אחד של השני",
    courseId: "linear-algebra",
    contentType: "unknown",
    videoIds: [],
    confidence: "low",
    notes:
      "Playlist reported empty by yt-dlp on the audit run (title reads like a song line; the start video was not returned). Needs manual review before publishing.",
  },
  {
    id: "PLm0oTNdEqyalMoJvzAouqqQoCU3NyWiBI",
    url: "https://www.youtube.com/playlist?list=PLm0oTNdEqyalMoJvzAouqqQoCU3NyWiBI",
    title: "תרגילים ופתרונות בתורת החבורות",
    courseId: "group-theory",
    contentType: "worked-solution",
    description: "Worked solutions in Group Theory.",
    videoIds: ["azBkoNLUs8M"],
    confidence: "high",
  },
  {
    id: "PLm0oTNdEqyamkS2BnpUAV7T_O9tHIG0NB",
    url: "https://www.youtube.com/playlist?list=PLm0oTNdEqyamkS2BnpUAV7T_O9tHIG0NB",
    title: "אלגברה לינארית טריקים שתיקים ודברים לזכור",
    courseId: "linear-algebra",
    contentType: "memory-aid",
    description: "Linear algebra tricks and things to remember.",
    videoIds: ["KJ5TNM4b8TU"],
    confidence: "high",
  },
  {
    id: "PLm0oTNdEqyalwtYng6d2FFijOXHsBT_Sn",
    url: "https://www.youtube.com/playlist?list=PLm0oTNdEqyalwtYng6d2FFijOXHsBT_Sn",
    title: "אלגברה לינארית - ו״ע, ע״ע ,מ״ע ,פ״א .",
    courseId: "linear-algebra",
    contentType: "worked-solution",
    description:
      "Eigenvectors, eigenvalues, representing matrices, characteristic polynomial.",
    videoIds: ["yZ8u7h6ozVY"],
    confidence: "high",
  },
  {
    id: "PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y",
    url: "https://www.youtube.com/playlist?list=PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y",
    title: "Span Of Consciousness (EP)",
    courseId: "linear-algebra",
    contentType: "song",
    description: "Original songs about linear algebra concepts, across musical styles.",
    videoIds: [
      "FfgbA3mzCIk",
      "WVJruw0hlPc",
      "XEXLwitVLKs",
      "uSx5mZZ6-xc",
      "wOzP-UZqgsw",
    ],
    confidence: "high",
  },
];

// Helpers
export function playlistsForCourse(courseId: string): TeachingPlaylist[] {
  return teachingPlaylists.filter((p) => p.courseId === courseId);
}

export function playlistsByContentType(type: ContentType): TeachingPlaylist[] {
  return teachingPlaylists.filter((p) => p.contentType === type);
}

export function playlistById(id: string): TeachingPlaylist | undefined {
  return teachingPlaylists.find((p) => p.id === id);
}
