export const MAP_SERVICES = {
  leafletIcons: {
    retina:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    standard: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadow: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  },
  nominatimOrigin: "https://nominatim.openstreetmap.org",
  openStreetMapAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  openStreetMapTiles: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
} as const;
