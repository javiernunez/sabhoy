export function getYouTubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    let videoId: string | null = null;

    if (host.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v");
      if (!videoId && parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/")[2] ?? null;
      }
      if (!videoId && parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/")[2] ?? null;
      }
    } else if (host === "youtu.be") {
      videoId = parsed.pathname.replace("/", "").split("?")[0] || null;
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
