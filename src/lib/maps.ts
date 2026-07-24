const GOOGLE_MAPS_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "maps.app.goo.gl",
]);

export function parseMapCoordinates(
  latitude: string,
  longitude: string,
): [number, number] | null {
  if (!latitude.trim() || !longitude.trim()) return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }
  return [lat, lng];
}

export function getMapQueryFromUrl(value: string) {
  if (!value.trim()) return "";

  try {
    const url = new URL(value);
    for (const key of ["q", "query", "destination"]) {
      const query = url.searchParams.get(key)?.trim();
      if (query) return query;
    }

    const place = url.pathname.match(/\/place\/([^/]+)/i)?.[1];
    if (place) return decodeURIComponent(place).replaceAll("+", " ");

    const embedPayload = url.searchParams.get("pb") || "";
    const embeddedPlace = embedPayload.match(/!2s([^!]+)/)?.[1]?.trim();
    if (embeddedPlace) {
      return decodeURIComponent(embeddedPlace).replaceAll("+", " ");
    }

    const latitude = embedPayload.match(/!3d(-?\d+(?:\.\d+)?)/)?.[1];
    const longitude = embedPayload.match(/!2d(-?\d+(?:\.\d+)?)/)?.[1];
    return latitude && longitude ? `${latitude},${longitude}` : "";
  } catch {
    return "";
  }
}

export function isGoogleMapsUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return (
      GOOGLE_MAPS_HOSTS.has(hostname) || hostname.endsWith(".google.com")
    );
  } catch {
    return false;
  }
}

export function isEmbeddableGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      isGoogleMapsUrl(value) &&
      (url.pathname.includes("/maps/embed") ||
        url.searchParams.get("output") === "embed")
    );
  } catch {
    return false;
  }
}

export function getGoogleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getGoogleMapsOpenUrl(value: string | undefined, fallbackQuery: string) {
  if (!value || !isGoogleMapsUrl(value)) {
    return getGoogleMapsSearchUrl(fallbackQuery);
  }

  if (!isEmbeddableGoogleMapsUrl(value)) return value;

  return getGoogleMapsSearchUrl(getMapQueryFromUrl(value) || fallbackQuery);
}
