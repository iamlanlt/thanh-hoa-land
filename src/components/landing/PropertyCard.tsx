import Image from "next/image";
import Link from "next/link";
import {
  Banknote,
  Building2,
  CircleCheckBig,
  CircleDot,
  Clock3,
  MapPin,
  Ruler,
  Sparkles,
} from "lucide-react";
import type { PublicProperty } from "@/types/property";
import { Badge } from "@/components/ui/badge";
import { optimizeImageUrl } from "@/lib/media";
import {
  formatArea,
  formatPropertyPrice,
  formatPublishedDate,
} from "@/lib/property-display";

export type PropertyCardItem = Pick<
  PublicProperty,
  | "id"
  | "slug"
  | "title"
  | "location"
  | "address"
  | "area"
  | "price"
  | "priceValue"
  | "priceUnit"
  | "status"
  | "featured"
  | "publishedAt"
  | "coverImage"
  | "images"
>;

export function PropertyCard({
  property,
  priority = false,
}: {
  property: PropertyCardItem;
  priority?: boolean;
}) {
  const imageUrl = property.images[0]?.url || property.coverImage;
  const badgeLabel =
    property.status === "SOLD"
      ? "Đã bán"
      : property.featured
        ? "Nổi bật"
        : "Đang bán";
  const BadgeIcon =
    property.status === "SOLD"
      ? CircleCheckBig
      : property.featured
        ? Sparkles
        : CircleDot;

  return (
    <article className="card">
      <Link className="cardClickArea" href={`/properties/${property.slug}`}>
        <div className="cardImage cardImageLink">
          {imageUrl ? (
            <Image
              src={optimizeImageUrl(imageUrl, 900)}
              alt={`${property.title} — ${property.location}`}
              width={800}
              height={520}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 390px"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
            />
          ) : (
            <span className="cardImagePlaceholder" aria-hidden="true">
              <Building2 size={34} strokeWidth={1.6} />
              <small>Đang cập nhật hình ảnh</small>
            </span>
          )}
          <Badge
            className={`propertyCardBadge ${property.featured ? "featured" : ""} ${property.status === "SOLD" ? "sold" : ""}`}
          >
            <BadgeIcon aria-hidden="true" />
            {badgeLabel}
          </Badge>
        </div>
        <div className="cardBody">
          <p className="location">
            <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
            {property.address || property.location}
          </p>
          <h3 className="cardTitleLink">{property.title}</h3>
          <div className="propertyMeta">
            <span>
              <Ruler size={15} strokeWidth={1.8} aria-hidden="true" />
              <b>{formatArea(property.area)}</b>
            </span>
            <span className="price">
              <Banknote size={15} strokeWidth={1.8} aria-hidden="true" />
              {formatPropertyPrice(property)}
            </span>
          </div>
          <div className="propertyCardFooter">
            <span>
              <Clock3 size={14} strokeWidth={1.8} aria-hidden="true" />
              {formatPublishedDate(property.publishedAt)}
            </span>
            <span className="propertyCardHint">Xem tin</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
