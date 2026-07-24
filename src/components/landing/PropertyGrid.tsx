import type { PublicProperty } from "@/data/demo-properties";

import { PropertyCard } from "./PropertyCard";

export function PropertyGrid({
  properties,
}: {
  properties: PublicProperty[];
}) {
  return (
    <div className="grid">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
