"use client";

import {
  ArrowUpDown,
  Banknote,
  ChevronLeft,
  ChevronRight,
  House,
  MapPin,
  Search,
  SlidersHorizontal,
  Ruler,
  X,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { PublicProperty } from "@/data/demo-properties";
import {
  buildPropertySearchHaystack,
  getPriceInMillions,
} from "@/lib/property-display";
import { getPaginationItems } from "@/lib/pagination";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { PropertyCard } from "./PropertyCard";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LIST_PAGE_SIZE = 9;
const PRICE_OPTIONS = [
  { value: "ALL", label: "Tất cả mức giá" },
  { value: "UNDER_1000", label: "Dưới 1 tỷ" },
  { value: "1000_3000", label: "1–3 tỷ" },
  { value: "OVER_3000", label: "Trên 3 tỷ" },
] as const;
const AREA_OPTIONS = [
  { value: "ALL", label: "Tất cả diện tích" },
  { value: "UNDER_100", label: "Dưới 100 m²" },
  { value: "100_200", label: "100–200 m²" },
  { value: "OVER_200", label: "Trên 200 m²" },
] as const;
const SORT_OPTIONS = [
  { value: "DEFAULT", label: "Mặc định" },
  { value: "PRICE_ASC", label: "Giá thấp đến cao" },
  { value: "PRICE_DESC", label: "Giá cao đến thấp" },
  { value: "AREA_DESC", label: "Diện tích lớn nhất" },
] as const;

function getOptionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function PropertyExplorer({ properties }: { properties: PublicProperty[] }) {
  const [district, setDistrict] = useState("Tất cả khu vực");
  const [type, setType] = useState("Tất cả loại");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("DEFAULT");
  const [priceRange, setPriceRange] = useState("ALL");
  const [areaRange, setAreaRange] = useState("ALL");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("vi"));
  const districts = useMemo(
    () => [
      "Tất cả khu vực",
      ...Array.from(
        new Set(properties.map((property) => property.location.split(",")[0])),
      ),
    ],
    [properties],
  );
  const types = useMemo(
    () => [
      "Tất cả loại",
      ...Array.from(
        new Set(
          properties
            .map((property) => property.type)
            .filter(Boolean) as string[],
        ),
      ),
    ],
    [properties],
  );
  const filtered = useMemo(() => {
    const result = properties.filter((property) => {
      const haystack = buildPropertySearchHaystack(property);
      const price = getPriceInMillions(property);
      const priceMatches =
        priceRange === "ALL" ||
        (priceRange === "UNDER_1000" && price != null && price < 1000) ||
        (priceRange === "1000_3000" &&
          price != null &&
          price >= 1000 &&
          price <= 3000) ||
        (priceRange === "OVER_3000" && price != null && price > 3000);
      const area = property.area;
      const areaMatches =
        areaRange === "ALL" ||
        (areaRange === "UNDER_100" && area != null && area < 100) ||
        (areaRange === "100_200" &&
          area != null &&
          area >= 100 &&
          area <= 200) ||
        (areaRange === "OVER_200" && area != null && area > 200);
      return (
        (district === "Tất cả khu vực" ||
          property.location.startsWith(district)) &&
        (type === "Tất cả loại" || property.type === type) &&
        (!deferredQuery || haystack.includes(deferredQuery)) &&
        priceMatches &&
        areaMatches
      );
    });
    return [...result].sort((a, b) => {
      if (sort === "AREA_DESC") return (b.area || 0) - (a.area || 0);
      const aPrice = getPriceInMillions(a) ?? Infinity;
      const bPrice = getPriceInMillions(b) ?? Infinity;
      if (sort === "PRICE_ASC") return aPrice - bPrice;
      if (sort === "PRICE_DESC") return bPrice - aPrice;
      return a.sortOrder - b.sortOrder;
    });
  }, [areaRange, deferredQuery, district, priceRange, properties, sort, type]);
  const hasFilters =
    district !== "Tất cả khu vực" ||
    type !== "Tất cả loại" ||
    priceRange !== "ALL" ||
    areaRange !== "ALL" ||
    query !== "" ||
    sort !== "DEFAULT";
  const activeFilterCount = [
    district !== "Tất cả khu vực",
    type !== "Tất cả loại",
    priceRange !== "ALL",
    areaRange !== "ALL",
  ].filter(Boolean).length;
  const pageCount = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));
  const visibleProperties = filtered.slice(
    (page - 1) * LIST_PAGE_SIZE,
    page * LIST_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [areaRange, deferredQuery, district, priceRange, sort, type]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  function resetFilters() {
    setDistrict("Tất cả khu vực");
    setType("Tất cả loại");
    setPriceRange("ALL");
    setAreaRange("ALL");
    setQuery("");
    setSort("DEFAULT");
  }

  function changePage(nextPage: number) {
    const normalizedPage = Math.max(1, Math.min(pageCount, nextPage));
    if (normalizedPage === page) return;
    setPage(normalizedPage);
    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document
        .querySelector(".propertyResultsHeading")
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  function renderFilterControls(mobile = false) {
    return (
      <div className={mobile ? "mobileFilterFields" : "propertyFilters"}>
        {!mobile && (
          <div className="filterIntro">
            <SlidersHorizontal size={17} aria-hidden="true" />
            <span>Bộ lọc tin đăng</span>
          </div>
        )}
        <FilterSelect
          label="Khu vực"
          value={district}
          options={districts}
          onChange={setDistrict}
          Icon={MapPin}
        />
        <FilterSelect
          label="Loại bất động sản"
          value={type}
          options={types}
          onChange={setType}
          Icon={House}
        />
        <FilterSelect
          label="Khoảng giá"
          value={priceRange}
          displayValue={getOptionLabel(PRICE_OPTIONS, priceRange)}
          options={PRICE_OPTIONS}
          onChange={setPriceRange}
          Icon={Banknote}
        />
        <FilterSelect
          label="Diện tích"
          value={areaRange}
          displayValue={getOptionLabel(AREA_OPTIONS, areaRange)}
          options={AREA_OPTIONS}
          onChange={setAreaRange}
          Icon={Ruler}
        />
        {!mobile && hasFilters && (
          <button type="button" className="filterClear" onClick={resetFilters}>
            <X size={15} aria-hidden="true" /> Xóa lọc
          </button>
        )}
        {!mobile && (
          <span className="filterCount" aria-live="polite">
            {filtered.length} tin đang hiển thị
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="sectionHeading propertyResultsHeading">
        <div>
          <span className="eyebrow dark">Danh sách bất động sản</span>
          <h2 aria-live="polite">{filtered.length} sản phẩm</h2>
        </div>
        <p>Chọn một tin để xem đầy đủ hình ảnh, đặc điểm và vị trí bản đồ.</p>
      </div>
      <div className="propertySearchBar">
        <label className="propertySearch">
          <Search size={19} aria-hidden="true" />
          <span className="srOnly">Tìm kiếm bất động sản</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên hoặc khu vực…"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={17} aria-hidden="true" />
            </button>
          )}
        </label>
        <FilterSelect
          label="Sắp xếp"
          value={sort}
          displayValue={getOptionLabel(SORT_OPTIONS, sort)}
          options={SORT_OPTIONS}
          onChange={setSort}
          Icon={ArrowUpDown}
        />
      </div>
      <div className="desktopFilters">
        {renderFilterControls()}
      </div>
      <div className="mobileFilters">
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="mobileFilterTrigger"
            >
              <SlidersHorizontal size={17} aria-hidden="true" />
              Bộ lọc nâng cao
              {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[88dvh] rounded-t-3xl p-0"
          >
            <SheetHeader className="border-b border-border p-5 text-left">
              <SheetTitle className="font-serif text-2xl text-primary">
                Lọc bất động sản
              </SheetTitle>
              <SheetDescription>
                Chọn tiêu chí phù hợp để thu hẹp danh sách.
              </SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto p-5">
              {renderFilterControls(true)}
            </div>
            <SheetFooter className="grid grid-cols-2 border-t border-border bg-background p-4">
              <Button type="button" variant="outline" onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
              <Button type="button" onClick={() => setFiltersOpen(false)}>
                Xem {filtered.length} tin
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <span aria-live="polite">
          {filtered.length} tin
          <span className="srOnly"> đang hiển thị</span>
        </span>
      </div>
      <div className="grid">
        {visibleProperties.map((item, index) => (
          <PropertyCard
            property={item}
            priority={index === 0}
            key={item.id}
          />
        ))}
      </div>
      {pageCount > 1 && (
        <nav className="propertyPagination" aria-label="Phân trang bất động sản">
          <button
            type="button"
            className="propertyPaginationNav"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
            aria-label="Đến trang trước"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Trước</span>
          </button>
          <div className="propertyPaginationPages" aria-label="Chọn trang">
            {getPaginationItems(page, pageCount).map((item) =>
              typeof item === "number" ? (
                <button
                  type="button"
                  className={`propertyPaginationPage${item === page ? " current" : ""}`}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={`Đến trang ${item}`}
                  key={item}
                  onClick={() => changePage(item)}
                >
                  {item}
                </button>
              ) : (
                <span
                  className="propertyPaginationEllipsis"
                  aria-hidden="true"
                  key={item}
                >
                  …
                </span>
              ),
            )}
          </div>
          <span className="propertyPaginationStatus" aria-live="polite">
            Trang {page}/{pageCount}
          </span>
          <button
            type="button"
            className="propertyPaginationNav"
            disabled={page === pageCount}
            onClick={() => changePage(page + 1)}
            aria-label="Đến trang sau"
          >
            <span>Sau</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
      {filtered.length === 0 && (
        <div className="emptyState propertyEmpty">
          <Search size={28} aria-hidden="true" />
          <strong>Chưa tìm thấy tin phù hợp</strong>
          <span>Thử đổi từ khóa, khu vực hoặc loại bất động sản.</span>
          <button
            type="button"
            className="button secondary darkButton"
            onClick={resetFilters}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </>
  );
}
