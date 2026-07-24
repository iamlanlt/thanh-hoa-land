"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_SERVICES } from "@/lib/map-config";

const DEFAULT_CENTER: [number, number] = [19.8067, 105.7852];

export function PublicMap({
  center = DEFAULT_CENTER,
  zoom = 13,
  title,
}: {
  center?: [number, number];
  zoom?: number;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const icon = L.icon({
        iconRetinaUrl: MAP_SERVICES.leafletIcons.retina,
        iconUrl: MAP_SERVICES.leafletIcons.standard,
        shadowUrl: MAP_SERVICES.leafletIcons.shadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
      });
      L.tileLayer(MAP_SERVICES.openStreetMapTiles, {
        attribution: MAP_SERVICES.openStreetMapAttribution,
        maxZoom: 19,
      }).addTo(map);
      markerRef.current = L.marker(center, { icon, title }).addTo(map);
      markerRef.current.bindPopup(title);
      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [center, title, zoom]);

  return <div ref={containerRef} className="publicMap" role="img" aria-label={title} />;
}
