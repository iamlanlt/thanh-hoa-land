"use client";

import dynamic from "next/dynamic";

export const DynamicLocationPicker = dynamic(
  () => import("@/components/admin/LocationPicker").then((mod) => mod.LocationPicker),
  { ssr: false },
);
