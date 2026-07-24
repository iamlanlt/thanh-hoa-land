import Link from "next/link";
import {
  countPublishedProperties,
  listPublishedProperties,
} from "@/services/property.service";
import { PropertyGrid } from "@/components/landing/PropertyGrid";
import { LeadForm } from "@/components/landing/LeadForm";
import { ContactActions } from "@/components/landing/ContactActions";
import { getPublicSettings } from "@/services/setting.service";
import { Reveal } from "@/components/ui/reveal";
import { PublicShell } from "@/components/landing/PublicShell";
import { HeroSlideshow } from "@/components/landing/HeroSlideshow";
import { optimizeImageUrl } from "@/lib/media";
import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsOpenUrl,
} from "@/lib/maps";

export const revalidate = 60;

const HERO_FALLBACKS = [
  {
    src: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=75",
    alt: "Không gian nhà ở hiện đại",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=75",
    alt: "Biệt thự hiện đại nhiều ánh sáng",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=75",
    alt: "Không gian sống cao cấp",
  },
  {
    src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=75",
    alt: "Ngôi nhà gia đình trong khu dân cư xanh",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=75",
    alt: "Kiến trúc nhà ở đương đại",
  },
  {
    src: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1600&q=75",
    alt: "Nhà nghỉ dưỡng giữa không gian thiên nhiên",
  },
] as const;

export default async function Home() {
  const [availableProperties, propertyCount, settings] = await Promise.all([
    listPublishedProperties({ limit: 12 }),
    countPublishedProperties(),
    getPublicSettings(),
  ]);
  const properties = availableProperties.slice(0, 6);
  const phone = settings.phone;
  const zaloUrl = settings.zaloUrl;
  const mapQuery =
    settings.mapLat && settings.mapLng
      ? `${settings.mapLat},${settings.mapLng}`
      : settings.mapQuery || settings.address;
  const officeMapUrl = getGoogleMapsOpenUrl(
    settings.mapEmbedUrl,
    mapQuery,
  );
  const propertyHeroImages = availableProperties
    .filter((property) => property.coverImage)
    .map((property) => ({
      src: optimizeImageUrl(property.coverImage || "", 1600),
      alt: property.title,
    }));
  const heroImages = [...propertyHeroImages, ...HERO_FALLBACKS]
    .filter(
      (image, index, list) =>
        image.src && list.findIndex((item) => item.src === image.src) === index,
    )
    .slice(0, 8);

  return (
    <main>
      <PublicShell settings={settings} home>
        <section id="top" className="hero">
          <HeroSlideshow images={heroImages} />
          <div className="heroOverlay" />
          <Reveal className="container heroContent">
            <span className="eyebrow">Bất động sản Thanh Hóa</span>
            <h1>
              Tìm đúng vị trí.
              <br />
              Nắm trọn cơ hội.
            </h1>
            <p>
              Nhà đất chọn lọc, thông tin rõ ràng và đồng hành xuyên suốt quá
              trình giao dịch.
            </p>
            <div className="heroActions">
              <Link className="button" href="/properties">
                Xem bất động sản
              </Link>
              <a
                className="button secondary"
                href={zaloUrl}
                target="_blank"
                rel="noreferrer"
              >
                Nhắn Zalo
              </a>
            </div>
            <div className="stats">
              <div>
                <strong>{propertyCount}+</strong>
                <span>Sản phẩm đang bán</span>
              </div>
              <div>
                <strong>5 năm</strong>
                <span>Kinh nghiệm địa phương</span>
              </div>
              <div>
                <strong>1–1</strong>
                <span>Tư vấn tận tâm</span>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="san-pham" className="section container">
          <div className="sectionHeading">
            <div>
              <span className="eyebrow dark">Danh mục nổi bật</span>
              <h2>Nhà đất đang hiển thị</h2>
            </div>
            <p>
              Các sản phẩm có thông tin được kiểm tra trước khi giới thiệu.{" "}
              <Link href="/properties">Xem tất cả →</Link>
            </p>
          </div>
          <PropertyGrid properties={properties} />
        </section>

        <section id="quy-trinh" className="process section">
          <div className="container">
            <div className="sectionHeading">
              <div>
                <span className="eyebrow dark">Đồng hành cùng bạn</span>
                <h2>Quy trình rõ ràng</h2>
              </div>
              <p>
                Từ cuộc gọi đầu tiên đến khi hoàn tất giao dịch, mọi bước đều được
                tư vấn minh bạch.
              </p>
            </div>
            <div className="processGrid">
              <div>
                <b>01</b>
                <h3>Tiếp nhận nhu cầu</h3>
                <p>Lắng nghe khu vực, ngân sách và mục tiêu của bạn.</p>
              </div>
              <div>
                <b>02</b>
                <h3>Chọn sản phẩm</h3>
                <p>Gửi thông tin những tin phù hợp và sắp xếp lịch xem.</p>
              </div>
              <div>
                <b>03</b>
                <h3>Hỗ trợ giao dịch</h3>
                <p>Đồng hành kiểm tra hồ sơ và thủ tục đến khi hoàn tất.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="gioi-thieu" className="about">
          <div className="container aboutGrid">
            <div className="aboutImage" />
            <div className="aboutContent">
              <span className="eyebrow dark">Về {settings.brandName}</span>
              <h2>Hiểu địa phương, tư vấn đúng nhu cầu</h2>
              <p>
                Chúng tôi tập trung vào các sản phẩm nhà đất tại Thanh Hóa, ưu
                tiên tính minh bạch và giá trị thực tế cho người mua.
              </p>
              <div className="benefits">
                <div>
                  <b>01</b>
                  <span>
                    <strong>Sản phẩm chọn lọc</strong>Kiểm tra thông tin trước khi
                    giới thiệu.
                  </span>
                </div>
                <div>
                  <b>02</b>
                  <span>
                    <strong>Tư vấn rõ ràng</strong>Không gây áp lực, không thông
                    tin mập mờ.
                  </span>
                </div>
                <div>
                  <b>03</b>
                  <span>
                    <strong>Hỗ trợ giao dịch</strong>Đồng hành từ xem đất đến hoàn
                    tất thủ tục.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="vi-tri" className="mapSection section">
          <div className="container mapGrid">
            <div>
              <span className="eyebrow dark">Vị trí liên hệ</span>
              <h2>Thanh Hóa trên bản đồ</h2>
              <p className="muted">
                Ghé thăm hoặc liên hệ để được tư vấn khu vực phù hợp với nhu cầu
                của bạn.
              </p>
              <a
                className="button"
                href={officeMapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Mở Google Maps →
              </a>
            </div>
            <div className="mapFrame">
              <iframe
                title="Bản đồ Thanh Hóa Land"
                src={getGoogleMapsEmbedUrl(mapQuery, settings.mapEmbedUrl)}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section id="lien-he" className="contact section" data-contact-region>
          <div className="container contactLayout">
            <div className="contactBox">
              <span className="eyebrow">Tư vấn miễn phí</span>
              <h2>Bạn đang tìm nhà đất tại Thanh Hóa?</h2>
              <p>
                Để lại số điện thoại, chúng tôi sẽ gửi danh sách phù hợp với khu
                vực và ngân sách của bạn.
              </p>
              <ContactActions phone={phone} zaloUrl={zaloUrl} />
            </div>
            <LeadForm brandName={settings.brandName} />
          </div>
        </section>
      </PublicShell>
    </main>
  );
}
