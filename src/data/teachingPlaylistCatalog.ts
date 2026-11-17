import { teachingPlaylists } from "./playlists";
import { youtubeVideos } from "./youtubeVideos";
import type { YouTubeVideo } from "./youtubeVideos";

export interface TeachingPlaylistCard {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  videoIds: string[];
  youtubeUrl?: string;
}

export interface TeachingPlaylistGroup {
  id: string;
  title: string;
  caption: string;
  cards: TeachingPlaylistCard[];
}

const knownVideos = new Map(youtubeVideos.map((video) => [video.videoId, video]));

function fromYoutube(
  playlistId: string, id: string, title: string, subtitle: string, year: string,
): TeachingPlaylistCard {
  const playlist = teachingPlaylists.find((entry) => entry.id === playlistId);
  if (!playlist) throw new Error("Unknown teaching playlist " + playlistId);
  const videoIds = playlist.videoIds.filter((videoId) => knownVideos.has(videoId));
  return { id, title, subtitle, year, videoIds, youtubeUrl: playlist.url };
}

function hedvaTrack(
  id: string, title: string, track: string, includeMixed = false,
): TeachingPlaylistCard {
  const videoIds = youtubeVideos
    .filter((video) =>
      video.category === "hedva2" && video.contentType === "tutorial" &&
      (video.track === track ||
        (includeMixed && video.track === "Electrical / Biomedical Engineering"))
    )
    .sort((a, b) =>
      (Number(b.relatedPractice?.replace("tirgul", "") || 0) -
        Number(a.relatedPractice?.replace("tirgul", "") || 0)) ||
      b.index - a.index
    )
    .map((video) => video.videoId);
  return {
    id, title,
    subtitle: "כל הקלטות התרגול במסלול, עם דפי התרגול המתאימים",
    year: "2026",
    videoIds,
    // These are curated on-site collections: the separate original YouTube
    // playlist URLs are not public, so do not invent a list= parameter.
  };
}

export const teachingPlaylistGroups: TeachingPlaylistGroup[] = [
  {
    id: "current", title: "2026-2027", caption: "הקלטות הסמסטר הנוכחי",
    cards: [
      fromYoutube(
        "PLEvis3LHS9Ks", "current-linear-algebra",
        "אלגברה לינארית להנדסות 2026-2027",
        "חשמל וביו-רפואה · תרגולים 1-5", "2026-2027",
      ),
    ],
  },
  {
    id: "courses-2026", title: "2025-2026", caption: "חוברות והקלטות משנים קודמות, מחולקות לפי מסלול",
    cards: [
      hedvaTrack("hedva-biomedical-2026", "חדווא 2ב להנדסה ביו רפואית 2026", "Biomedical Engineering", true),
      hedvaTrack("hedva-mechanical-2026", "חדווא 2ב להנדסה מכנית 2026", "Mechanical Engineering"),
      hedvaTrack("hedva-electrical-2026", "חדווא 2ב להנדסת חשמל 2026", "Electrical Engineering", true),
      fromYoutube(
        "PLm0oTNdEqyakPZNxPchsnGy7R7BnkP2ML",
        "linear-electrical-2025", "אלגברה לינארית להנדסת חשמל תשפ״ו",
        "הפלייליסט המקורי והמלא · 18 סרטונים", "2025-2026",
      ),
      fromYoutube(
        "PLm0oTNdEqyaml_II1IKiInf06g2LTBeyt",
        "linear-biomedical-2025", "אלגברה לינארית להנדסה ביו רפואית תשפ״ו",
        "הפלייליסט המקורי והמלא · 17 סרטונים", "2025-2026",
      ),
    ],
  },
  {
    id: "extras", title: "פלייליסטים נוספים", caption: "פתרונות, שאלות ממבחנים, תורת החבורות ומוזיקה",
    cards: [
      fromYoutube(
        "PLm0oTNdEqyalxtp6tUphCnuvojTdVE3Pn", "hedva-extra",
        "חדוו״א 2 להנדסות", "מרכז מסה ואינטגרלים נפחיים", "2026",
      ),
      fromYoutube(
        "PLm0oTNdEqyakp7mgEnt8GzCfrpz-YSS1Y", "span-of-consciousness",
        "Span Of Consciousness (EP)", "שירים על אלגברה לינארית", "מוזיקה",
      ),
      fromYoutube(
        "PLm0oTNdEqyalwtYng6d2FFijOXHsBT_Sn", "linear-eigen",
        "אלגברה לינארית - ו״ע, ע״ע, מ״ע, פ״א",
        "תרגילים ופתרונות", "אלגברה לינארית",
      ),
      fromYoutube(
        "PLm0oTNdEqyamkS2BnpUAV7T_O9tHIG0NB", "linear-tips",
        "טריקים ודברים לזכור בלינארית",
        "סיכומים וטיפים", "אלגברה לינארית",
      ),
      fromYoutube(
        "PLm0oTNdEqyanqRzbtG56IX1fzIjknH6An", "linear-exams",
        "שאלות ממבחנים בלינארית",
        "פתרונות ממבחנים לחשמל", "אלגברה לינארית",
      ),
      fromYoutube(
        "PLm0oTNdEqyakeEk6T3jTBxeqS5z_zUzEv", "biomedical-homework",
        "מטלות בית פתורות - ביו-רפואה",
        "שאלות פתורות", "אלגברה לינארית",
      ),
      fromYoutube(
        "PLm0oTNdEqyalMoJvzAouqqQoCU3NyWiBI", "group-theory",
        "תרגילים ופתרונות בתורת החבורות",
        "תרגילים נוספים", "תורת החבורות",
      ),
      fromYoutube(
        "PLm0oTNdEqyakr9oIlO9PSWB9RzApsSEoW", "main-2026-archive",
        "ארכיון ההקלטות הראשי · 2026",
        "חדו״א 2 ולינארית בפלייליסט המקורי", "ארכיון",
      ),
    ],
  },
];

export function videosInTeachingPlaylist(card: TeachingPlaylistCard): YouTubeVideo[] {
  return card.videoIds.flatMap((id) => {
    const video = knownVideos.get(id);
    return video ? [video] : [];
  });
}

export function coverForTeachingPlaylist(card: TeachingPlaylistCard): string | undefined {
  return videosInTeachingPlaylist(card)[0]?.thumbnail;
}
