"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, X } from "lucide-react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

type LocationPickerProps = {
  lat?: number | null;
  lng?: number | null;
  onPick: (result: { lat: number; lng: number; address: string }) => void;
  onClear?: () => void;
};

const DEFAULT_CENTER: [number, number] = [19.8067, 105.7852];
const DEFAULT_ZOOM = 12;
const PICKED_ZOOM = 16;

export function LocationPicker({ lat, lng, onPick, onClear }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [loading, setLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
      const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
      const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
      const defaultIcon = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const initialCenter: [number, number] =
        lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER;
      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: lat != null && lng != null ? PICKED_ZOOM : DEFAULT_ZOOM,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (lat != null && lng != null) {
        markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
      }

      map.on("click", async (event: { latlng: { lat: number; lng: number } }) => {
        const { lat: clickLat, lng: clickLng } = event.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng], { icon: defaultIcon }).addTo(map);
        }
        setLoading(true);
        setGeocodeError(false);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${clickLat}&lon=${clickLng}&accept-language=vi`,
          );
          const data = await response.json().catch(() => null);
          const address: string = data?.display_name || "";
          if (!address) setGeocodeError(true);
          onPickRef.current({ lat: clickLat, lng: clickLng, address });
        } catch {
          setGeocodeError(true);
          onPickRef.current({ lat: clickLat, lng: clickLng, address: "" });
        } finally {
          setLoading(false);
        }
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    import("leaflet").then((L) => {
      if (lat == null || lng == null) {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        return;
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
      map.setView([lat, lng], Math.max(map.getZoom(), PICKED_ZOOM));
    });
  }, [lat, lng]);

  return (
    <div className="locationPicker">
      <div className="locationPickerHeader">
        <span className="locationPickerHint">
          <MapPin size={14} aria-hidden="true" />
          Bấm vào bản đồ để chọn vị trí chính xác — địa chỉ sẽ tự động điền.
        </span>
        {lat != null && lng != null && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="textButton"
            onClick={() => {
              markerRef.current?.remove();
              markerRef.current = null;
              onClear();
            }}
          >
            <X size={14} aria-hidden="true" /> Xóa vị trí
          </Button>
        )}
      </div>
      <div className="locationPickerMap" ref={containerRef} />
      {loading && (
        <span className="locationPickerStatus">
          <LoaderCircle size={13} className="spin" aria-hidden="true" /> Đang tìm địa chỉ…
        </span>
      )}
      {!loading && geocodeError && (
        <span className="locationPickerStatus locationPickerStatusError">
          Đã lấy tọa độ nhưng không dò được địa chỉ. Bạn có thể nhập tay ở trên.
        </span>
      )}
      {!loading && !geocodeError && lat != null && lng != null && (
        <span className="locationPickerStatus">
          Tọa độ: {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      )}
    </div>
  );
}
