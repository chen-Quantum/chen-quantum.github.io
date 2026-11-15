import type { YouTubeVideo } from "./youtubeVideos";
import { tirgulim } from "./tirgulim";
import { engineeringTutorialPdf, engineeringTutorials } from "./academicYear2026";
import { biomedicalTutorialPdf, biomedicalTutorials } from "./biomedicalTutorials2026";

/** Match the recording's actual course and topic, never just a number across different tracks. */
export interface RecordingPracticeSheet {
  label: string;
  hebrewPdf: string;
  englishPdf?: string;
  match: "session" | "topic";
}

export const CURRENT_LINEAR_ALGEBRA_PLAYLIST = "PLEvis3LHS9Ks";

export function practiceSheetsForRecording(video: YouTubeVideo): RecordingPracticeSheet[] {
  if (video.category === "hedva2" && video.relatedPractice) {
    const tutorial = tirgulim.find((entry) =>
      entry.id === video.relatedPractice && entry.videoIds.includes(video.videoId)
    );
    if (!tutorial) return [];
    const number = Number(tutorial.id.replace("tirgul", ""));
    return [{ label: `חדו״א 2 · תרגול ${number}`, hebrewPdf: tutorial.pdfPath, match: "session" }];
  }

  if (
    video.category !== "linear_algebra" ||
    video.playlistId !== CURRENT_LINEAR_ALGEBRA_PLAYLIST ||
    video.contentType !== "tutorial" ||
    video.laTutorial === null
  ) return [];

  const number = video.laTutorial;
  const biomedical = video.track === "Biomedical Engineering";
  const electrical = video.track === "Electrical Engineering";
  if (!biomedical && !electrical) return [];

  const registry = biomedical ? biomedicalTutorials : engineeringTutorials;
  const pdfFor = biomedical ? biomedicalTutorialPdf : engineeringTutorialPdf;

  // The Electrical tutorial 4 video explicitly covers fields and complex numbers,
  // whereas booklet chapter 4 covers polynomials and matrix operations.
  // Link by the stated topics instead of presenting chapter 4 as an exact match.
  const electricalFieldsAndComplex =
    electrical && number === 4 &&
    /שדות/.test(video.title) && /מרוכבים/.test(video.title);

  const chapters = electricalFieldsAndComplex ? [3, 1] : [number];
  return chapters.flatMap((chapter) => {
    const tutorial = registry.find((entry) => entry.number === chapter);
    if (!tutorial) return [];
    const label = electricalFieldsAndComplex
      ? (chapter === 3 ? "שדות ושדות סופיים · פרק 3" : "מספרים מרוכבים · פרק 1")
      : `${biomedical ? "ביו-רפואה" : "חשמל"} · תרגול ${number}`;
    return [{
      label,
      hebrewPdf: pdfFor(chapter, "he"),
      englishPdf: pdfFor(chapter, "en"),
      match: electricalFieldsAndComplex ? "topic" as const : "session" as const,
    }];
  });
}

/** No historic Linear Algebra tutorial PDFs were found in the published archive. */
export function olderRecordingMaterialsIndex(video: YouTubeVideo): string | null {
  if (
    video.category !== "linear_algebra" ||
    video.playlistId === CURRENT_LINEAR_ALGEBRA_PLAYLIST ||
    video.laTutorial === null ||
    video.contentType !== "tutorial"
  ) return null;
  return video.track === "Biomedical Engineering"
    ? "/teaching/2026-2027/#biomedical-tutorial-downloads"
    : "/teaching/2026-2027/#tutorial-downloads";
}
