import type { PublicProperty } from "@/types/property";

import { PropertyCard } from "./PropertyCard";

export function PropertyGrid({
  properties,
}: {
  properties: PublicProperty[];
}) {
  return (
    <div className="propertyGrid">
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
