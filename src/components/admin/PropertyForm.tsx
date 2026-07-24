"use client";

import { useFieldArray, useForm, type UseFormSetValue } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Plus, Upload } from "lucide-react";
import {
  DIRECTIONS,
  FURNITURE_STATUSES,
  LEGAL_STATUSES,
  PRICE_UNITS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPES,
  THANH_HOA_AREAS,
} from "@/lib/property-options";
import { slugify } from "@/lib/slug";
import { formatPricePerSquareMeter } from "@/lib/property-display";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { requestJson } from "@/lib/client-api";
import { validateUploadFile } from "@/lib/media-policy";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldContext } from "@/components/admin/FormFieldContext";
import { DynamicLocationPicker as LocationPicker } from "@/components/admin/DynamicLocationPicker";

type FormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  location: string;
  address: string;
  lat: number | null;
  lng: number | null;
  area: string;
  price: string;
  priceValue: string;
  priceUnit: string;
  type: string;
  legalStatus: string;
  frontage: string;
  accessRoadWidth: string;
  direction: string;
  floors: string;
  bedrooms: string;
  bathrooms: string;
  furniture: string;
  status: "AVAILABLE" | "SOLD";
  featured: boolean;
  published: boolean;
  sortOrder: string;
  images: { url: string; sortOrder: number }[];
  videoUrls: string[];
};
type Initial = Partial<FormValues> & {
  images?: { url: string; sortOrder: number }[];
  videoUrls?: string[];
};

function PresetField({
  label,
  name,
  value,
  options,
  setValue,
  required,
  hint,
  allowCustom,
  error,
}: {
  label: string;
  name:
    | "location"
    | "type"
    | "priceUnit"
    | "legalStatus"
    | "status"
    | "direction"
    | "furniture";
  value: string;
  options: readonly { value: string; label: string }[];
  setValue: UseFormSetValue<FormValues>;
  required?: boolean;
  hint?: string;
  allowCustom?: boolean;
  error?: string;
}) {
  const isPreset = options.some((option) => option.value === value);
  const [customMode, setCustomMode] = useState(value !== "" && !isPreset);
  const selected = options.find((option) => option.value === value);
  const mode = customMode ? "__custom" : value || "__placeholder";
  const selectValue = (nextValue: string) => {
    if (nextValue === "__custom") {
      setCustomMode(true);
      setValue(name, "", { shouldDirty: true, shouldValidate: true });
      return;
    }
    setCustomMode(false);
    setValue(name, nextValue, { shouldDirty: true, shouldValidate: true });
  };
  const buttonLabel =
    selected?.label ||
    (mode === "__custom"
      ? value || "Tùy chỉnh…"
      : `Chọn ${label.toLowerCase()}`);
  return (
    <div className="choiceField" data-field={name}>
      <span className="choiceLabel">{label}</span>
      {hint && <span className="fieldHint">{hint}</span>}
      <div className="choicePicker">
        <Select value={mode} onValueChange={selectValue}>
          <SelectTrigger
            className={`choiceTrigger h-[54px] w-full rounded-xl border-input bg-background px-4 shadow-none${error ? " border-destructive" : ""}`}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-label={`${label}: ${buttonLabel}`}
          >
            <SelectValue>{buttonLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            {mode === "__placeholder" && (
              <SelectItem value="__placeholder" disabled>
                {buttonLabel}
              </SelectItem>
            )}
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            {allowCustom && (
              <SelectItem value="__custom">Tùy chỉnh…</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      {customMode && (
        <Input
          value={value}
          onChange={(event) =>
            setValue(name, event.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder={`Nhập ${label.toLowerCase()}`}
          aria-label={`${label} tùy chỉnh`}
          autoFocus
          className="mt-2 h-12"
        />
      )}
      {error && (
        <p className="fieldError" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function PropertyForm({
  initial,
  propertyId,
}: {
  initial?: Initial;
  propertyId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const slugEdited = useRef(Boolean(initial?.slug));
  const { register, control, handleSubmit, setValue, watch } =
    useForm<FormValues>({
      defaultValues: {
        title: initial?.title || "",
        slug: initial?.slug || "",
        shortDescription: initial?.shortDescription || "",
        description: initial?.description || "",
        location: initial?.location || "",
        address: initial?.address || "",
        lat: initial?.lat ?? null,
        lng: initial?.lng ?? null,
        area: initial?.area || "",
        price: initial?.price || "",
        priceValue: initial?.priceValue || "",
        priceUnit: initial?.priceUnit || "",
        type: initial?.type || "Đất nền",
        legalStatus: initial?.legalStatus || "",
        frontage: initial?.frontage || "",
        accessRoadWidth: initial?.accessRoadWidth || "",
        direction: initial?.direction || "",
        floors: initial?.floors || "",
        bedrooms: initial?.bedrooms || "",
        bathrooms: initial?.bathrooms || "",
        furniture: initial?.furniture || "",
        status: initial?.status || "AVAILABLE",
        featured: initial?.featured ?? false,
        published: initial?.published ?? true,
        sortOrder: initial?.sortOrder?.toString() || "0",
        images: initial?.images?.length
          ? initial.images
          : [{ url: "", sortOrder: 0 }],
        videoUrls: initial?.videoUrls || [],
      },
    });
  const location = watch("location");
  useEffect(() => {
    if (location.trim()) setLocationError(false);
  }, [location]);
  const lat = watch("lat");
  const lng = watch("lng");
  const type = watch("type");
  const area = watch("area");
  const priceValue = watch("priceValue");
  const priceUnit = watch("priceUnit");
  const legacyPrice = watch("price");
  const legalStatus = watch("legalStatus");
  const direction = watch("direction");
  const furniture = watch("furniture");
  const status = watch("status");
  const imageValues = watch("images");
  const videoUrls = watch("videoUrls");
  const pricePerSquareMeter = formatPricePerSquareMeter({
    area: area ? Number(area.replace(",", ".")) : null,
    price: legacyPrice || null,
    priceValue: priceValue ? Number(priceValue.replace(",", ".")) : null,
    priceUnit: priceUnit || null,
  });
  const showsResidentialFields = /nhà|biệt thự|liền kề|shophouse|chung cư/i.test(
    type,
  );
  const { fields, append, remove } = useFieldArray({ control, name: "images" });

  async function uploadMedia(file: File, resourceType: "image" | "video") {
    const validationError = validateUploadFile(file, resourceType);
    if (validationError) {
      setError(validationError);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const uploadedUrl = await uploadToCloudinary(file, resourceType);
      if (resourceType === "video") {
        setValue("videoUrls", [...videoUrls, uploadedUrl], {
          shouldDirty: true,
        });
      } else {
        append({ url: uploadedUrl, sortOrder: fields.length });
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : `Upload ${resourceType === "video" ? "video" : "ảnh"} thất bại`,
      );
    } finally {
      setUploading(false);
    }
  }

  async function submit(values: FormValues) {
    setPending(true);
    setError("");
    if (!values.location.trim()) {
      setLocationError(true);
      setPending(false);
      const field = document.querySelector('[data-field="location"]');
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.querySelector<HTMLElement>("button, input")?.focus();
      return;
    }
    try {
      await requestJson(
        propertyId
          ? `/api/admin/properties/${propertyId}`
          : "/api/admin/properties",
        {
          method: propertyId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            area: values.area || "",
            sortOrder: values.sortOrder || 0,
            images: values.images
              .filter((image) => image.url.trim())
              .map((image, index) => ({ ...image, sortOrder: index })),
            videoUrls: values.videoUrls.filter((url) => url.trim()),
          }),
        },
        "Không thể lưu tin đăng.",
      );
      router.push("/admin/properties");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể kết nối. Vui lòng thử lại.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="adminForm" onSubmit={handleSubmit(submit)}>
      <div className="formSectionHeading">
        <span>01</span>
        <div>
          <h2>Thông tin chính</h2>
          <p>Nội dung dùng cho danh sách, tìm kiếm và trang chi tiết.</p>
        </div>
      </div>
      <div className="formGrid">
        <label>
          <FormFieldContext
            label="Tên tin đăng"
            hint="Ngắn gọn, nêu rõ loại và khu vực"
          />
          <Input
            {...register("title", {
              required: true,
              onChange: (event) => {
                if (!slugEdited.current)
                  setValue("slug", slugify(event.target.value), {
                    shouldValidate: true,
                  });
              },
            })}
            placeholder="Ví dụ: Đất nền Quảng Xương"
          />
        </label>
        <label>
          <FormFieldContext
            label="Slug"
            hint="Tự sinh từ tên, có thể chỉnh sửa"
          />
          <Input
            {...register("slug", {
              required: true,
              onChange: () => {
                slugEdited.current = true;
              },
            })}
            placeholder="dat-nen-quang-xuong"
          />
        </label>
        <PresetField
          label="Khu vực"
          name="location"
          value={location}
          options={THANH_HOA_AREAS.map((option) => {
            const value =
              option === "TP. Thanh Hóa" ? option : `${option}, Thanh Hóa`;
            return { value, label: value };
          })}
          setValue={setValue}
          required
          allowCustom
          hint="Danh mục Thanh Hóa, có thể chọn hoặc nhập riêng"
          error={locationError ? "Vui lòng chọn hoặc nhập khu vực." : undefined}
        />
        <label>
          <FormFieldContext
            label="Địa chỉ chính xác"
            hint="Dùng để tạo liên kết Google Maps"
          />
          <Input
            {...register("address")}
            placeholder="Số nhà, đường, phường/xã..."
          />
        </label>
        <div className="locationPickerField">
          <LocationPicker
            lat={lat}
            lng={lng}
            onPick={({ lat: pickedLat, lng: pickedLng, address }) => {
              setValue("lat", pickedLat, { shouldDirty: true });
              setValue("lng", pickedLng, { shouldDirty: true });
              if (address) {
                setValue("address", address, { shouldDirty: true });
              }
            }}
            onClear={() => {
              setValue("lat", null, { shouldDirty: true });
              setValue("lng", null, { shouldDirty: true });
            }}
          />
        </div>
        <PresetField
          label="Loại bất động sản"
          name="type"
          value={type}
          options={PROPERTY_TYPES.map((option) => ({
            value: option,
            label: option,
          }))}
          setValue={setValue}
          allowCustom
          hint="Chọn danh mục để lọc tin nhất quán"
        />
        <label>
          <FormFieldContext
            label="Diện tích (m²)"
            hint="Nhập diện tích sử dụng hoặc khu đất"
          />
          <Input type="number" step="0.1" min="0.1" {...register("area")} />
        </label>
        <label>
          <FormFieldContext
            label="Giá bán"
            hint="Chỉ nhập số, ví dụ 1,35"
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register("priceValue")}
            placeholder="1.35"
          />
          {pricePerSquareMeter && (
            <span className="fieldHint fieldCalculated">
              Ước tính: {pricePerSquareMeter}
            </span>
          )}
        </label>
        <PresetField
          label="Đơn vị giá"
          name="priceUnit"
          value={priceUnit}
          options={PRICE_UNITS.map((option) => ({
            value: option,
            label: option,
          }))}
          setValue={setValue}
          hint="Giúp hiển thị giá đồng nhất"
          allowCustom
        />
        {initial?.price && !initial?.priceValue && (
          <label>
            <FormFieldContext
              label="Giá dữ liệu cũ"
              hint="Chỉ dùng tạm đến khi giá số ở trên được cập nhật"
            />
            <Input {...register("price")} readOnly />
          </label>
        )}
        <PresetField
          label="Trạng thái"
          name="status"
          value={status}
          options={PROPERTY_STATUS_OPTIONS}
          setValue={setValue}
          hint="Tình trạng giao dịch hiện tại"
        />
        <label>
          <FormFieldContext
            label="Thứ tự hiển thị"
            hint="Số nhỏ được ưu tiên hiển thị trước"
          />
          <Input type="number" min="0" {...register("sortOrder")} />
        </label>
      </div>
      <div className="formSectionHeading compact">
        <span>02</span>
        <div>
          <h2>Đặc điểm bất động sản</h2>
          <p>Chỉ nhập các thông số đã được kiểm tra.</p>
        </div>
      </div>
      <div className="formGrid propertyFactsForm">
        <label>
          <FormFieldContext
            label="Mặt tiền (m)"
            hint="Chiều ngang mặt tiếp giáp đường, tính bằng mét"
          />
          <Input type="number" step="0.1" min="0.1" {...register("frontage")} />
        </label>
        <label>
          <FormFieldContext
            label="Đường vào (m)"
            hint="Bề rộng lối tiếp cận thực tế, tính bằng mét"
          />
          <Input
            type="number"
            step="0.1"
            min="0.1"
            {...register("accessRoadWidth")}
          />
        </label>
        <PresetField
          label="Hướng"
          name="direction"
          value={direction}
          options={DIRECTIONS.map((option) => ({ value: option, label: option }))}
          setValue={setValue}
          hint="Hướng mặt tiền hoặc cửa chính"
          allowCustom
        />
        {showsResidentialFields && (
          <>
            <label>
              <FormFieldContext
                label="Số tầng"
                hint="Tổng số tầng sử dụng của công trình"
              />
              <Input type="number" min="1" {...register("floors")} />
            </label>
            <label>
              <FormFieldContext
                label="Phòng ngủ"
                hint="Số phòng ngủ thực tế"
              />
              <Input type="number" min="0" {...register("bedrooms")} />
            </label>
            <label>
              <FormFieldContext
                label="Phòng tắm"
                hint="Số phòng tắm hoặc WC"
              />
              <Input type="number" min="0" {...register("bathrooms")} />
            </label>
            <PresetField
              label="Nội thất"
              name="furniture"
              value={furniture}
              options={FURNITURE_STATUSES.map((option) => ({
                value: option,
                label: option,
              }))}
              setValue={setValue}
              hint="Mức độ bàn giao nội thất hiện tại"
              allowCustom
            />
          </>
        )}
        <PresetField
          label="Pháp lý"
          name="legalStatus"
          value={legalStatus}
          options={LEGAL_STATUSES.map((option) => ({
            value: option,
            label: option,
          }))}
          setValue={setValue}
          hint="Loại giấy tờ đã được kiểm tra"
          allowCustom
        />
      </div>
      <div className="formSectionHeading compact">
        <span>03</span>
        <div>
          <h2>Nội dung mô tả</h2>
          <p>Thông tin giúp khách hàng đánh giá tin đăng.</p>
        </div>
      </div>
      <label>
        <FormFieldContext
          label="Mô tả ngắn"
          hint="Hiển thị trên thẻ tin và kết quả tìm kiếm"
        />
        <Textarea
          rows={2}
          {...register("shortDescription")}
          placeholder="Tóm tắt dùng cho card và SEO"
        />
      </label>
      <label>
        <FormFieldContext
          label="Mô tả chi tiết"
          hint="Nêu rõ vị trí, tiện ích, pháp lý và điểm nổi bật"
        />
        <Textarea
          rows={6}
          {...register("description")}
          placeholder="Mô tả vị trí, tiện ích, quy hoạch và điểm nổi bật..."
        />
      </label>
      <div className="formSectionHeading compact">
        <span>04</span>
        <div>
          <h2>Hiển thị</h2>
          <p>Kiểm soát trạng thái xuất bản và mức độ ưu tiên.</p>
        </div>
      </div>
      <div className="checkRow">
        <label>
          <input type="checkbox" {...register("published")} />
          <span>
            <strong>Đang hiển thị</strong>
            <small>Cho phép tin xuất hiện trên website khi đang bán</small>
          </span>
        </label>
        <label>
          <input type="checkbox" {...register("featured")} />
          <span>
            <strong>Tin nổi bật</strong>
            <small>Ưu tiên tin trong các khu vực nổi bật</small>
          </span>
        </label>
      </div>
      <div className="formSectionHeading compact">
        <span>05</span>
        <div>
          <h2>Thư viện media</h2>
          <p>Ảnh đầu tiên được dùng làm ảnh đại diện của tin.</p>
        </div>
      </div>
      <div className="imageFields">
        <div className="adminSectionTitle">
          <h2>Ảnh tin đăng</h2>
          <div className="imageTools">
            <label className="uploadButton">
              <Upload size={15} aria-hidden="true" />
              {uploading ? "Đang tải…" : "Upload ảnh"}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadMedia(file, "image");
                  event.target.value = "";
                }}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="textButton"
              onClick={() => append({ url: "", sortOrder: fields.length })}
            >
              <Plus size={14} aria-hidden="true" /> Thêm URL
            </Button>
          </div>
        </div>
        {fields.map((field, index) => (
          <div className="imageRow" key={field.id}>
            {imageValues[index]?.url && (
              <img
                className="imageThumb"
                src={imageValues[index].url}
                alt={`Ảnh ${index + 1} của tin đăng`}
                loading="lazy"
              />
            )}
            <Input
              {...register(`images.${index}.url`)}
              placeholder="https://..."
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="dangerText"
              onClick={() => remove(index)}
            >
              Xóa
            </Button>
          </div>
        ))}
      </div>
      <div className="videoFields">
        <div className="adminSectionTitle">
          <div>
            <h2>Video giới thiệu</h2>
            <p className="fieldHint">
              Dán link YouTube, Vimeo hoặc video Cloudinary.
            </p>
          </div>
          <div className="imageTools">
            <label className="uploadButton">
              <Upload size={15} aria-hidden="true" />
              {uploading ? "Đang tải…" : "Upload video"}
              <input
                type="file"
                accept="video/*"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadMedia(file, "video");
                  event.target.value = "";
                }}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="textButton"
              onClick={() =>
                setValue("videoUrls", [...videoUrls, ""], {
                  shouldDirty: true,
                })
              }
            >
              <Plus size={14} aria-hidden="true" /> Thêm URL
            </Button>
          </div>
        </div>
        {videoUrls.length === 0 && (
          <p className="mediaEmpty">Chưa thêm video. Video là tuỳ chọn.</p>
        )}
        {videoUrls.map((url, index) => (
          <div className="videoRow" key={`video-${index}`}>
            <span className="mediaIndex">{index + 1}</span>
            <Input
              value={url}
              onChange={(event) => {
                const next = [...videoUrls];
                next[index] = event.target.value;
                setValue("videoUrls", next, { shouldDirty: true });
              }}
              placeholder="https://youtube.com/watch?v=..."
              aria-label={`URL video ${index + 1}`}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="dangerText"
              onClick={() =>
                setValue(
                  "videoUrls",
                  videoUrls.filter((_, itemIndex) => itemIndex !== index),
                  { shouldDirty: true },
                )
              }
            >
              Xóa
            </Button>
          </div>
        ))}
      </div>
      {error && (
        <p className="formError" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      <div className="formActions">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="button secondary darkButton h-12"
          onClick={() => router.push("/admin/properties")}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          size="lg"
          className="button h-12 bg-primary text-primary-foreground"
          disabled={pending || uploading}
          aria-busy={pending || uploading}
        >
          {pending ? (
            <>
              <LoaderCircle className="spin" size={17} aria-hidden="true" />
              Đang lưu…
            </>
          ) : propertyId ? (
            "Lưu thay đổi"
          ) : (
            "Tạo tin đăng"
          )}
        </Button>
      </div>
    </form>
  );
}
