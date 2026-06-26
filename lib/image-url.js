const GOOGLE_DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/thumbnail\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/
];

export function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  for (const pattern of GOOGLE_DRIVE_ID_PATTERNS) {
    const match = url.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function isGoogleDriveUrl(url) {
  return typeof url === "string" && url.includes("drive.google.com");
}

export function toGoogleDriveDirectUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function normalizeImageUrl(url) {
  const trimmed = typeof url === "string" ? url.trim() : "";

  if (!trimmed) {
    return trimmed;
  }

  const fileId = extractGoogleDriveFileId(trimmed);

  if (fileId) {
    return toGoogleDriveDirectUrl(fileId);
  }

  return trimmed;
}

export function normalizeImageUrls(urls) {
  if (!Array.isArray(urls)) {
    return [];
  }

  return urls.map((url) => normalizeImageUrl(url));
}
