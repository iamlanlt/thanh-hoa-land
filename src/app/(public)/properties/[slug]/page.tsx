import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPropertyBySlug,
  listRelatedProperties,
} from "@/services/property.service";
import { getPublicSettings } from "@/services/setting.service";
import { siteConfig } from "@/lib/config";
import { getGoogleMapsSearchUrl } from "@/lib/maps";
import { createBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/json-ld";
import { getVideoEmbedUrl } from "@/lib/media";
import { getPropertyStatusLabel } from "@/lib/property-options";
import {
  formatArea,
  formatPropertyPrice,
  formatPublishedDate,
  getPriceInMillions,
  getPropertyFacts,
} from "@/lib/property-display";
import { LeadForm } from "@/components/landing/LeadForm";
import { PropertyGallery } from "@/components/landing/PropertyGallery";
import { PublicShell } from "@/components/landing/PublicShell";
import { PropertyCard } from "@/components/landing/PropertyCard";
import { ContactActions } from "@/components/landing/ContactActions";
import { PublicMap } from "@/components/landing/PublicMap";
import {
  Banknote,
  Building2,
  CircleCheckBig,
  CircleDot,
  Clock3,
  MapPin,
  Ruler,
  Video,
} from "lucide-react";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const property = await getPropertyBySlug((await params).slug);
  if (!property) return { title: "Không tìm thấy tin" };
  const settings = await getPublicSettings();
  const image =
    property.images[0]?.url ||
    property.coverImage ||
    settings.ogImageUrl ||
    settings.logoUrl;
  const description =
    property.shortDescription ||
    property.description ||
    `Thông tin ${property.title}.`;
  return {
    title: `${property.title} | ${settings.brandName}`,
    description,
    openGraph: {
      title: property.title,
      description,
      type: "article",
      ...(image ? { images: [{ url: image, alt: property.title }] } : {}),
    },
    alternates: { canonical: `/properties/${property.slug}` },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const property = await getPropertyBySlug((await params).slug);
  if (!property) notFound();
  const [relatedProperties, settings] = await Promise.all([
    listRelatedProperties(property),
    getPublicSettings(),
  ]);
  const images = (
    property.images?.length
      ? property.images
      : [{ id: "cover", url: property.coverImage || "", sortOrder: 0 }]
  ).filter((image) => image.url);
  const videos = property.videoUrls ?? [];
  const phone = settings.phone;
  const zaloUrl = settings.zaloUrl;
  const mapQuery = property.address || property.location;
  const mapCoordsQuery =
    property.lat != null && property.lng != null
      ? `${property.lat},${property.lng}`
      : mapQuery;
  const mapUrl = getGoogleMapsSearchUrl(mapCoordsQuery);
  const displayPrice = formatPropertyPrice(property);
  const facts = getPropertyFacts(property);
  const siteUrl = siteConfig.siteUrl;
  const pageUrl = `${siteUrl}/properties/${property.slug}`;
  const priceInMillions = getPriceInMillions(property);
  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    url: pageUrl,
    description:
      property.shortDescription || property.description || property.title,
    ...(images.length ? { image: images.map((image) => image.url) } : {}),
    ...(property.publishedAt
      ? { datePosted: new Date(property.publishedAt).toISOString() }
      : {}),
    about: {
      "@type": "Residence",
      name: property.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address || property.location,
        addressRegion: "Thanh Hóa",
        addressCountry: "VN",
      },
      ...(property.area
        ? {
            floorSize: {
              "@type": "QuantitativeValue",
              value: property.area,
              unitCode: "MTK",
            },
          }
        : {}),
    },
    ...(priceInMillions
      ? {
          offers: {
            "@type": "Offer",
            price: Math.round(priceInMillions * 1_000_000),
            priceCurrency: "VND",
            availability:
              property.status === "SOLD"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            url: pageUrl,
          },
        }
      : {}),
  };
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: "Trang chủ", item: siteUrl },
    { name: "Bất động sản", item: `${siteUrl}/properties` },
    { name: property.title, item: pageUrl },
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps(listingJsonLd)}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps(breadcrumbJsonLd)}
      />
      <PublicShell settings={settings}>
        <section className="detailHero">
          <div className="container">
            <nav className="breadcrumbs" aria-label="Đường dẫn trang">
              <Link href="/">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <Link href="/properties">Bất động sản</Link>
              <span aria-hidden="true">/</span>
              <span>{property.type || "Chi tiết"}</span>
            </nav>
            <p className="eyebrow dark">
              {property.type || "Bất động sản"}
            </p>
            <h1>{property.title}</h1>
            <p className="detailLocation">
              <MapPin size={16} aria-hidden="true" />{" "}
              {property.address || property.location}
            </p>
          </div>
        </section>
        <section className="detailSection container">
          {images.length > 0 ? (
            <PropertyGallery images={images} title={property.title} />
          ) : (
            <div className="detailGalleryPlaceholder">
              <Building2 size={42} strokeWidth={1.4} aria-hidden="true" />
              <strong>Hình ảnh đang được cập nhật</strong>
              <span>Liên hệ để nhận ảnh và thông tin mới nhất.</span>
            </div>
          )}
          <p className="detailPublished">
            <Clock3 size={14} aria-hidden="true" />
            {formatPublishedDate(property.publishedAt)}
          </p>
          {videos.length > 0 && (
            <section className="detailVideos" aria-labelledby="video-heading">
              <div className="detailMapHeader">
                <div>
                  <span className="eyebrow dark">Video giới thiệu</span>
                  <h2 id="video-heading">Xem không gian thực tế</h2>
                </div>
                <Video size={22} aria-hidden="true" />
              </div>
              <div className="videoGrid">
                {videos.map((url, index) => {
                  const embedUrl = getVideoEmbedUrl(url);
                  return embedUrl ? (
                    <div className="videoFrame" key={url}>
                      <iframe
                        title={`Video ${index + 1} của ${property.title}`}
                        src={embedUrl}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      key={url}
                      className="videoFrame"
                      src={url}
                      controls
                      preload="metadata"
                      playsInline
                    />
                  );
                })}
              </div>
            </section>
          )}
          <div className="detailGrid">
            <article className="detailContent">
              <div className="detailStats">
                <div>
                  <span><Banknote size={15} strokeWidth={1.8} aria-hidden="true" />Giá bán</span>
                  <strong>{displayPrice}</strong>
                </div>
                <div>
                  <span><Ruler size={15} strokeWidth={1.8} aria-hidden="true" />Diện tích</span>
                  <strong>{formatArea(property.area)}</strong>
                </div>
                <div>
                  <span>
                    {property.status === "SOLD" ? (
                      <CircleCheckBig size={15} strokeWidth={1.8} aria-hidden="true" />
                    ) : (
                      <CircleDot size={15} strokeWidth={1.8} aria-hidden="true" />
                    )}
                    Trạng thái
                  </span>
                  <strong>
                    {getPropertyStatusLabel(property.status)}
                  </strong>
                </div>
              </div>
              <h2>Thông tin bất động sản</h2>
              <p>
                {property.description ||
                  property.shortDescription ||
                  "Vui lòng liên hệ để nhận thông tin chi tiết."}
              </p>
              <section className="propertyFacts" aria-labelledby="facts-heading">
                <h2 id="facts-heading">Đặc điểm bất động sản</h2>
                {facts.length > 0 ? (
                  <dl className="propertyFactsGrid">
                    {facts.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p>Liên hệ để nhận thông tin đặc điểm và pháp lý mới nhất.</p>
                )}
              </section>
              <ContactActions
                phone={phone}
                zaloUrl={zaloUrl}
                mapUrl={mapUrl}
                variant="detail"
              />
            </article>
            <aside className="detailAside" data-contact-region>
              <span className="eyebrow dark">Nhận thông tin</span>
              <h2>Bạn quan tâm tin này?</h2>
              <p className="muted">
                Nhận thông tin pháp lý, vị trí và lịch xem thực tế.
              </p>
              <LeadForm propertyId={property.id} brandName={settings.brandName} />
            </aside>
          </div>
          <section className="detailMap">
            <div className="detailMapHeader">
              <div>
                <span className="eyebrow dark">Vị trí bất động sản</span>
                <h2>Xem vị trí trên bản đồ</h2>
              </div>
              <a href={mapUrl} target="_blank" rel="noreferrer">
                Mở Google Maps →
              </a>
            </div>
            <p className="detailLocation">
              <MapPin size={16} aria-hidden="true" /> {mapQuery}
            </p>
            <div className="detailMapFrame">
              <PublicMap
                title={`Bản đồ vị trí ${property.title}`}
                center={
                  property.lat != null && property.lng != null
                    ? [property.lat, property.lng]
                    : undefined
                }
                zoom={14}
              />
            </div>
          </section>
        </section>
        {relatedProperties.length > 0 && (
          <section className="section container relatedSection">
            <div className="sectionHeading">
              <div>
                <span className="eyebrow dark">Có thể bạn quan tâm</span>
                <h2>Tin liên quan</h2>
              </div>
            </div>
            <div className="propertyGrid relatedGrid">
              {relatedProperties.map((item) => (
                <PropertyCard property={item} key={item.id} />
              ))}
            </div>
          </section>
        )}
      </PublicShell>
    </main>
  );
}
