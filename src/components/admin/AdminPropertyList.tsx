"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  Banknote,
  Building2,
  CircleCheckBig,
  CircleDot,
  Clock3,
  Eye,
  EyeOff,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { PublicProperty } from "@/types/property";
import { useDebouncedQuery } from "@/hooks/use-debounced-query";
import { PropertyActions } from "@/components/admin/PropertyActions";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { FilterSelect } from "@/components/ui/filter-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  formatArea,
  formatPropertyPrice,
  formatPublishedDate,
} from "@/lib/property-display";
import {
  getPropertyStatusLabel,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPES,
} from "@/lib/property-options";

type AdminProperty = Pick<
  PublicProperty,
  | "id"
  | "title"
  | "type"
  | "area"
  | "location"
  | "price"
  | "priceValue"
  | "priceUnit"
  | "status"
  | "featured"
  | "published"
  | "publishedAt"
  | "coverImage"
  | "images"
>;

type AdminFilters = {
  query?: string;
  type?: string;
  status?: string;
  visibility?: string;
  featured?: string;
};

type Props = {
  properties: AdminProperty[];
  filters: AdminFilters;
  pagination: { page: number; pageCount: number; total: number };
};

function pageHref(filters: AdminFilters, page: number) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("page", String(page));
  return `/admin/properties?${params.toString()}`;
}

export function AdminPropertyList({ properties, filters, pagination }: Props) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFiltering, startFiltering] = useTransition();
  function navigate(nextFilters: AdminFilters, mode: "push" | "replace" = "push") {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.delete("page");
    const href = params.size
      ? `/admin/properties?${params.toString()}`
      : "/admin/properties";
    startFiltering(() => {
      router[mode](href, { scroll: false });
    });
  }

  const [query, setQuery] = useDebouncedQuery(filters.query, (nextQuery) => {
    navigate({ ...filters, query: nextQuery }, "replace");
  });
  const hasFilters = Boolean(
    query ||
      filters.type ||
      filters.status ||
      filters.visibility ||
      filters.featured,
  );

  function updateFilter(
    key: "type" | "status" | "visibility" | "featured",
    value: string,
  ) {
    navigate({
      ...filters,
      query: query.trim() || undefined,
      [key]: value === "ALL" ? undefined : value,
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({
      ...filters,
      query: query.trim() || undefined,
    });
  }

  function renderFilterFields(mobile = false) {
    return (
      <div
        className={
          mobile ? "adminMobileFilterFields" : "adminPropertyFilterFields"
        }
        aria-busy={isFiltering}
      >
        <div className="adminPropertyFilterField">
          <FilterSelect
            label="Loại tin"
            value={filters.type || "ALL"}
            displayValue={filters.type || "Tất cả loại"}
            options={[
              { value: "ALL", label: "Tất cả loại" },
              ...PROPERTY_TYPES.map((type) => ({ value: type, label: type })),
            ]}
            onChange={(value) => updateFilter("type", value)}
            Icon={Building2}
          />
        </div>
        <div className="adminPropertyFilterField">
          <FilterSelect
            label="Trạng thái"
            value={filters.status || "ALL"}
            displayValue={
              filters.status
                ? getPropertyStatusLabel(filters.status)
                : "Tất cả"
            }
            options={[
              { value: "ALL", label: "Tất cả" },
              ...PROPERTY_STATUS_OPTIONS,
            ]}
            onChange={(value) => updateFilter("status", value)}
            Icon={CircleCheckBig}
          />
        </div>
        <div className="adminPropertyFilterField">
          <FilterSelect
            label="Hiển thị"
            value={filters.visibility || "ALL"}
            displayValue={
              filters.visibility === "VISIBLE"
                ? "Đang hiện"
                : filters.visibility === "HIDDEN"
                  ? "Đang ẩn"
                  : "Tất cả"
            }
            options={[
              { value: "ALL", label: "Tất cả" },
              { value: "VISIBLE", label: "Đang hiện" },
              { value: "HIDDEN", label: "Đang ẩn" },
            ]}
            onChange={(value) => updateFilter("visibility", value)}
            Icon={Eye}
          />
        </div>
        <div className="adminPropertyFilterField">
          <FilterSelect
            label="Ưu tiên"
            value={filters.featured || "ALL"}
            displayValue={
              filters.featured === "true"
                ? "Tin nổi bật"
                : filters.featured === "false"
                  ? "Tin thường"
                  : "Tất cả tin"
            }
            options={[
              { value: "ALL", label: "Tất cả tin" },
              { value: "true", label: "Tin nổi bật" },
              { value: "false", label: "Tin thường" },
            ]}
            onChange={(value) => updateFilter("featured", value)}
            Icon={Sparkles}
          />
        </div>
        {!mobile && (
          <div className="adminPropertyToolbarActions">
            <p className="adminPropertyToolbarMeta" aria-live="polite">
              <strong>{pagination.total}</strong> tin đăng
            </p>
            {hasFilters && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/properties">
                  <X aria-hidden="true" /> Xóa lọc
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="adminPropertyWorkspace" aria-label="Danh sách tin đăng">
      <form
        className="adminPropertyToolbar"
        role="search"
        onSubmit={submitSearch}
      >
        <label className="adminPropertySearch">
          <Search size={18} aria-hidden="true" />
          <span className="srOnly">Tìm tin đăng</span>
          <input
            name="query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, địa chỉ hoặc khu vực…"
          />
        </label>
        <div className="adminPropertyDesktopFilters">
          {renderFilterFields()}
        </div>
        <div className="adminPropertyMobileFilters">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="adminMobileFilterTrigger"
              >
                <span>
                  <SlidersHorizontal size={17} aria-hidden="true" />
                  Bộ lọc nâng cao
                </span>
                <span className="adminMobileFilterMeta">{pagination.total} tin</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[88dvh] rounded-t-3xl p-0">
              <SheetHeader className="border-b border-border p-5 text-left">
                <SheetTitle className="font-serif text-2xl text-primary">
                  Lọc tin đăng
                </SheetTitle>
                <SheetDescription>
                  Chọn tiêu chí để thu hẹp danh sách quản trị.
                </SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto p-5">
                {renderFilterFields(true)}
              </div>
              <SheetFooter className="grid grid-cols-2 border-t border-border bg-background p-4">
                <Button asChild variant="outline">
                  <Link href="/admin/properties">Xóa bộ lọc</Link>
                </Button>
                <Button type="button" onClick={() => setFiltersOpen(false)}>
                  Xem {pagination.total} tin
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </form>

      {properties.length === 0 ? (
        <div className="emptyState propertyEmpty">
          <Search size={28} aria-hidden="true" />
          <strong>Không tìm thấy tin đăng</strong>
          <span>Thử đổi từ khóa hoặc tiêu chí lọc.</span>
          {hasFilters && <Link className="button secondary" href="/admin/properties">Xóa bộ lọc</Link>}
        </div>
      ) : (
        <div className="adminPropertyList">
          {properties.map((property, index) => (
            <article className="propertyAdminCard" key={property.id}>
              <div className="propertyAdminContent">
                <div className="propertyAdminMedia">
                  {property.images[0]?.url || property.coverImage ? (
                    <Image
                      src={property.images[0]?.url || property.coverImage!}
                      alt=""
                      width={112}
                      height={88}
                      sizes="112px"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  ) : <span aria-hidden="true">TH</span>}
                </div>
                <div className="propertyAdminIdentity">
                  <div className="propertyAdminTitleRow">
                    <h2>{property.title}</h2>
                    {property.featured && (
                      <span className="propertyAdminFeatured">
                        <Sparkles size={12} strokeWidth={2} aria-hidden="true" /> Nổi bật
                      </span>
                    )}
                  </div>
                  <div className="propertyAdminMetaLine">
                    <span>{property.type || "Bất động sản"} · {formatArea(property.area)}</span>
                    <span className="propertyAdminDate">
                      <Clock3 size={13} aria-hidden="true" />
                      {formatPublishedDate(property.publishedAt)}
                    </span>
                  </div>
                  <div className="propertyAdminFacts">
                    <span className="propertyAdminLocation">
                      <MapPin size={15} aria-hidden="true" />
                      {property.location}
                    </span>
                    <strong className="propertyAdminPrice">
                      <Banknote size={15} strokeWidth={1.8} aria-hidden="true" />
                      {formatPropertyPrice(property)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="propertyAdminCardControls">
                <div className="propertyAdminStateRow">
                  <span className="srOnly">Trạng thái</span>
                  <Badge variant="outline" className={`statusPill ${property.status === "SOLD" ? "sold" : "available"}`}>
                    {property.status === "SOLD" ? (
                      <CircleCheckBig size={14} aria-hidden="true" />
                    ) : (
                      <CircleDot size={14} aria-hidden="true" />
                    )}
                    {getPropertyStatusLabel(property.status)}
                  </Badge>
                </div>
                <div className="propertyAdminStateRow">
                  <span className="srOnly">Hiển thị</span>
                  <Badge variant="outline" className={`visibilityPill ${property.published ? "visible" : "hidden"}`}>
                    {property.published ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
                    {property.published ? "Đang hiện" : "Đang ẩn"}
                  </Badge>
                </div>
                <PropertyActions id={property.id} />
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminPagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        ariaLabel="Phân trang tin đăng"
        getHref={(page) => pageHref(filters, page)}
      />
    </section>
  );
}
