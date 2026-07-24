"use client";

import {
  CircleAlert,
  CircleCheckBig,
  LoaderCircle,
  Save,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { requestJson } from "@/lib/client-api";
import { FormFieldContext } from "@/components/admin/FormFieldContext";
import { DynamicLocationPicker as LocationPicker } from "@/components/admin/DynamicLocationPicker";
import {
  getGoogleMapsOpenUrl,
  getGoogleMapsSearchUrl,
  getMapQueryFromUrl,
  isGoogleMapsUrl,
} from "@/lib/maps";
import type { SettingsInput } from "@/lib/validations";

type Settings = Partial<SettingsInput>;
type UploadField = "logoUrl" | "faviconUrl" | "ogImageUrl";

export function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState({
    brandName: initial.brandName || "",
    email: initial.email || "",
    phone: initial.phone || "",
    zaloUrl: initial.zaloUrl || "",
    facebookUrl: initial.facebookUrl || "",
    tiktokUrl: initial.tiktokUrl || "",
    logoUrl: initial.logoUrl || "",
    faviconUrl: initial.faviconUrl || "",
    seoTitle: initial.seoTitle || "",
    seoDescription: initial.seoDescription || "",
    ogImageUrl: initial.ogImageUrl || "",
    address: initial.address || "",
    workingHours: initial.workingHours || "",
    mapQuery: initial.mapQuery || initial.address || "",
    mapEmbedUrl: initial.mapEmbedUrl || "",
    mapLat: initial.mapLat ?? null,
    mapLng: initial.mapLng ?? null,
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState<UploadField | null>(null);

  useEffect(() => {
    if (!message.startsWith("Đã")) return;
    const timer = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  function markDirty(updater: (current: typeof values) => typeof values) {
    setDirty(true);
    setMessage("");
    setValues(updater);
  }

  function update(key: keyof typeof values, value: string) {
    markDirty((current) => ({ ...current, [key]: value }));
  }

  function updateAddress(value: string) {
    markDirty((current) => ({
      ...current,
      address: value,
      mapQuery:
        !current.mapQuery || current.mapQuery === current.address
          ? value
          : current.mapQuery,
    }));
  }

  function updateMapEmbedUrl(value: string) {
    const detectedQuery = getMapQueryFromUrl(value);
    markDirty((current) => ({
      ...current,
      mapEmbedUrl: value,
      mapQuery: detectedQuery || current.mapQuery,
    }));
  }

  function updateMapLocation(mapLat: number, mapLng: number, address: string) {
    markDirty((current) => ({
      ...current,
      mapLat,
      mapLng,
      mapQuery: address || current.mapQuery,
      address: address || current.address,
    }));
  }

  function clearMapLocation() {
    markDirty((current) => ({ ...current, mapLat: null, mapLng: null }));
  }

  async function uploadImage(file: File, field: UploadField) {
    setUploading(field);
    setMessage("");
    try {
      update(field, await uploadToCloudinary(file));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Upload ảnh thất bại",
      );
    } finally {
      setUploading(null);
    }
  }

  function uploadControl(field: UploadField, label: string) {
    return (
      <label className="settingsUpload">
        <Upload size={15} aria-hidden="true" />
        {uploading === field ? "Đang tải…" : label}
        <input
          type="file"
          accept="image/*"
          disabled={uploading !== null}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadImage(file, field);
            event.target.value = "";
          }}
        />
      </label>
    );
  }

  function preview(field: UploadField, alt: string) {
    const url = values[field];
    return url ? (
      <img
        className={`settingsPreview ${field === "ogImageUrl" ? "ogPreview" : ""}`}
        src={url}
        alt={alt}
      />
    ) : null;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await requestJson(
        "/api/admin/settings",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
        "Không thể lưu cài đặt website.",
      );
      setMessage("Đã lưu cài đặt website.");
      setDirty(false);
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Không thể kết nối. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="adminForm settingsForm" onSubmit={submit}>
      <div className="settingsSection">
        <div className="settingsSectionHeader">
          <span>01</span>
          <div>
            <h2>Thương hiệu & nhận diện</h2>
            <p>Tên, logo và favicon sẽ được dùng xuyên suốt website.</p>
          </div>
        </div>
        <div className="formGrid">
          <label>
            <FormFieldContext
              label="Tên thương hiệu"
              hint="Hiển thị tại header, footer và khu vực quản trị"
            />
            <input
              value={values.brandName}
              onChange={(event) => update("brandName", event.target.value)}
            />
          </label>
          <div className="settingsField">
            <label>
              <FormFieldContext
                label="Logo URL"
                hint="Ưu tiên ảnh nền trong suốt, tối thiểu 256 × 256 px"
              />
              <input
                type="url"
                placeholder="https://.../logo.png"
                value={values.logoUrl}
                onChange={(event) => update("logoUrl", event.target.value)}
              />
            </label>
            {uploadControl("logoUrl", "Upload logo")}
            {preview("logoUrl", "Xem trước logo")}
          </div>
          <div className="settingsField">
            <label>
              <FormFieldContext
                label="Favicon URL"
                hint="Ảnh vuông; để trống sẽ tự dùng logo"
              />
              <input
                type="url"
                placeholder="Để trống sẽ dùng logo"
                value={values.faviconUrl}
                onChange={(event) => update("faviconUrl", event.target.value)}
              />
            </label>
            {uploadControl("faviconUrl", "Upload favicon")}
            {preview("faviconUrl", "Xem trước favicon")}
          </div>
          <div className="settingsField">
            <label>
              <FormFieldContext
                label="Ảnh chia sẻ (OG image)"
                hint="Ảnh đại diện mạng xã hội, khuyến nghị 1200 × 630 px"
              />
              <input
                type="url"
                placeholder="1200 × 630 px"
                value={values.ogImageUrl}
                onChange={(event) => update("ogImageUrl", event.target.value)}
              />
            </label>
            {uploadControl("ogImageUrl", "Upload ảnh OG")}
            {preview("ogImageUrl", "Xem trước ảnh chia sẻ")}
          </div>
        </div>
      </div>
      <div className="settingsSection">
        <div className="settingsSectionHeader">
          <span>02</span>
          <div>
            <h2>SEO & chia sẻ</h2>
            <p>
              Kiểm soát tiêu đề, mô tả và ảnh khi website xuất hiện trên Google
              hoặc mạng xã hội.
            </p>
          </div>
        </div>
        <label>
          <FormFieldContext
            label="SEO title"
            hint="Tiêu đề hiển thị trên Google và tab trình duyệt"
          />
          <input
            maxLength={160}
            value={values.seoTitle}
            onChange={(event) => update("seoTitle", event.target.value)}
            placeholder="Thanh Hóa Land | Bất động sản Thanh Hóa"
          />
          <div className="fieldMeta">
            <span>Khuyến nghị tối đa 60 ký tự</span>
            <span>{values.seoTitle.length}/160</span>
          </div>
        </label>
        <label>
          <FormFieldContext
            label="SEO description"
            hint="Tóm tắt giá trị website trong kết quả tìm kiếm"
          />
          <textarea
            rows={3}
            maxLength={320}
            value={values.seoDescription}
            onChange={(event) => update("seoDescription", event.target.value)}
            placeholder="Mô tả ngắn 150–160 ký tự về website..."
          />
          <div className="fieldMeta">
            <span>Khuyến nghị 150–160 ký tự</span>
            <span>{values.seoDescription.length}/320</span>
          </div>
        </label>
      </div>
      <div className="settingsSection">
        <div className="settingsSectionHeader">
          <span>03</span>
          <div>
            <h2>Liên hệ & mạng xã hội</h2>
            <p>Để khách hàng liên hệ nhanh qua các kênh quen thuộc.</p>
          </div>
        </div>
        <div className="formGrid">
          <label>
            <FormFieldContext
              label="Email liên hệ"
              hint="Dùng trong footer và liên kết gửi email"
            />
            <input
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>
          <label>
            <FormFieldContext
              label="Hotline"
              hint="Dùng cho tất cả nút gọi nhanh trên website"
            />
            <input
              type="tel"
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </label>
          <label>
            <FormFieldContext
              label="Link Zalo"
              hint="Đường dẫn mở trực tiếp cuộc trò chuyện Zalo"
            />
            <input
              type="url"
              value={values.zaloUrl}
              onChange={(event) => update("zaloUrl", event.target.value)}
            />
          </label>
          <label>
            <FormFieldContext
              label="Link Facebook"
              hint="Để trống nếu chưa sử dụng kênh này"
            />
            <input
              type="url"
              placeholder="https://facebook.com/..."
              value={values.facebookUrl}
              onChange={(event) => update("facebookUrl", event.target.value)}
            />
          </label>
          <label>
            <FormFieldContext
              label="Link TikTok"
              hint="Để trống nếu chưa sử dụng kênh này"
            />
            <input
              type="url"
              placeholder="https://tiktok.com/@..."
              value={values.tiktokUrl}
              onChange={(event) => update("tiktokUrl", event.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="settingsSection settingsLocationSection">
        <div className="settingsSectionHeader">
          <span>04</span>
          <div>
            <h2>Địa điểm & thời gian</h2>
            <p>Địa chỉ và bản đồ có thể thay đổi mà không cần sửa code.</p>
          </div>
        </div>
        <label>
          <FormFieldContext
            label="Địa chỉ văn phòng"
            hint="Hiển thị trong footer và tự đồng bộ sang từ khóa bản đồ"
          />
          <input
            value={values.address}
            onChange={(event) => updateAddress(event.target.value)}
          />
        </label>
        <div className="formGrid">
          <label>
            <FormFieldContext
              label="Từ khóa bản đồ"
              hint="Có thể tinh chỉnh nếu Google Maps nhận sai địa điểm"
            />
            <input
              value={values.mapQuery}
              onChange={(event) => update("mapQuery", event.target.value)}
              placeholder="Địa chỉ dùng để định vị trên Google Maps"
            />
            <span className="fieldHint settingsMapHint">
              Bản đồ landing page dùng từ khóa này.{" "}
              <a
                href={getGoogleMapsSearchUrl(values.mapQuery)}
                target="_blank"
                rel="noreferrer"
              >
                Mở thử trên Google Maps ↗
              </a>
            </span>
          </label>
          <label>
            <FormFieldContext
              label="Link Google Maps"
              hint="Nhận link Chia sẻ hoặc URL Nhúng bản đồ của Google Maps"
            />
            <input
              type="url"
              value={values.mapEmbedUrl}
              onChange={(event) => updateMapEmbedUrl(event.target.value)}
              placeholder="https://maps.app.goo.gl/... hoặc URL embed"
            />
            <span className="fieldHint">
              Link chia sẻ được dùng để mở Maps; bản đồ nhúng dùng từ khóa bên
              trái. URL nhúng đầy đủ sẽ được ưu tiên trực tiếp.
              {values.mapEmbedUrl && isGoogleMapsUrl(values.mapEmbedUrl) ? (
                <>
                  {" "}
                  <a
                    href={getGoogleMapsOpenUrl(
                      values.mapEmbedUrl,
                      values.mapQuery || values.address,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở vị trí trên Google Maps ↗
                  </a>
                </>
              ) : null}
            </span>
          </label>
        </div>
        <LocationPicker
          lat={values.mapLat}
          lng={values.mapLng}
          onPick={({ lat, lng, address }) => updateMapLocation(lat, lng, address)}
          onClear={clearMapLocation}
        />
        <label>
          <FormFieldContext
            label="Giờ làm việc"
            hint="Hiển thị trong khu vực thông tin liên hệ"
          />
          <input
            value={values.workingHours}
            onChange={(event) => update("workingHours", event.target.value)}
          />
        </label>
      </div>
      <div className="formActions settingsFormActions">
        {message && (
          <div
            className={`settingsSaveNotice ${message.startsWith("Đã") ? "isSuccess" : "isError"}`}
            role={message.startsWith("Đã") ? "status" : "alert"}
            aria-live="polite"
          >
            {message.startsWith("Đã") ? (
              <CircleCheckBig size={18} aria-hidden="true" />
            ) : (
              <CircleAlert size={18} aria-hidden="true" />
            )}
            <span>{message}</span>
          </div>
        )}
        <button
          className="button"
          type="submit"
          disabled={saving || uploading !== null || !dirty}
          aria-busy={saving || uploading !== null}
        >
          {saving ? (
            <>
              <LoaderCircle className="spin" size={16} aria-hidden="true" />{" "}
              Đang lưu…
            </>
          ) : (
            <>
              <Save size={16} aria-hidden="true" />{" "}
              Lưu cài đặt
            </>
          )}
        </button>
      </div>
    </form>
  );
}
