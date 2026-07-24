import type { PublicProperty } from "@/types/property";

const numberFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

const publishedDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatArea(value?: number | null) {
  return value ? `${numberFormatter.format(value)} m²` : "Liên hệ";
}

export function getPriceInMillions(
  property: Pick<PublicProperty, "price" | "priceValue" | "priceUnit">,
) {
  if (property.priceValue == null) {
    if (!property.price) return null;
    const normalized = property.price
      .toLocaleLowerCase("vi")
      .replace(",", ".");
    const amount = Number.parseFloat(normalized.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(amount)) return null;
    return normalized.includes("tỷ") ? amount * 1000 : amount;
  }
  if (property.priceUnit === "Tỷ") return property.priceValue * 1000;
  if (property.priceUnit === "Triệu") return property.priceValue;
  return null;
}

export function formatPropertyPrice(
  property: Pick<PublicProperty, "price" | "priceValue" | "priceUnit">,
) {
  const { priceValue, priceUnit, price } = property;
  if (priceUnit === "Thỏa thuận") return "Giá thỏa thuận";
  if (priceValue != null && priceUnit) {
    return `${numberFormatter.format(priceValue)} ${priceUnit.toLocaleLowerCase("vi")}`;
  }
  return price || "Liên hệ";
}

export function formatPricePerSquareMeter(
  property: Pick<
    PublicProperty,
    "price" | "priceValue" | "priceUnit" | "area"
  >,
) {
  const priceInMillions = getPriceInMillions(property);
  if (priceInMillions == null || !property.area || property.area <= 0) {
    return null;
  }
  return `${numberFormatter.format(priceInMillions / property.area)} triệu/m²`;
}

export function buildPropertySearchHaystack(
  property: Pick<PublicProperty, "title" | "location" | "address" | "type">,
) {
  return [property.title, property.location, property.address, property.type]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("vi");
}

export function formatPublishedDate(value?: Date | string | null) {
  if (!value) return "Ngày đăng đang cập nhật";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Ngày đăng đang cập nhật";
  const days = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)),
  );
  if (days === 0) return "Đăng hôm nay";
  if (days === 1) return "Đăng hôm qua";
  if (days <= 30) return `Đăng ${days} ngày trước`;
  return `Đăng ${publishedDateFormatter.format(date)}`;
}

export function getPropertyFacts(property: PublicProperty) {
  const facts: Array<readonly [string, string | null | undefined]> = [
    ["Loại hình", property.type],
    ["Diện tích", property.area ? formatArea(property.area) : null],
    ["Mặt tiền", property.frontage ? `${numberFormatter.format(property.frontage)} m` : null],
    ["Đường vào", property.accessRoadWidth ? `${numberFormatter.format(property.accessRoadWidth)} m` : null],
    ["Hướng", property.direction],
    ["Số tầng", property.floors ? `${property.floors} tầng` : null],
    ["Phòng ngủ", property.bedrooms ? `${property.bedrooms} phòng` : null],
    ["Phòng tắm", property.bathrooms ? `${property.bathrooms} phòng` : null],
    ["Nội thất", property.furniture],
    ["Pháp lý", property.legalStatus],
  ];
  return facts.filter(
    (fact): fact is readonly [string, string] => Boolean(fact[1]),
  );
}
