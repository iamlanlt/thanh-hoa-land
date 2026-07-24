"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { optimizeImageUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  alt?: string | null;
};

export function PropertyGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="propertyGallery" aria-label={`Thư viện ảnh ${title}`}>
      <div className="propertyGalleryMain relative overflow-hidden rounded-2xl bg-muted shadow-sm">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {images.map((image, index) => (
              <div className="min-w-0 flex-[0_0_100%]" key={image.id}>
                <Image
                  src={optimizeImageUrl(image.url, 1600)}
                  alt={image.alt || `${title} — ảnh ${index + 1}`}
                  width={1600}
                  height={960}
                  sizes="(max-width: 800px) 100vw, 1100px"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="propertyGalleryImage aspect-[16/9] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Images className="size-4" aria-hidden="true" />
          {selectedIndex + 1}/{images.length}
        </div>

        {images.length > 1 && (
          <>
            <span className="propertyGalleryNav propertyGalleryNavPrevious">
              <Button
                type="button"
                variant="secondary"
                size="icon-lg"
                className="size-11 !translate-y-0 rounded-full bg-background/90 shadow-md backdrop-blur-sm active:!translate-y-0"
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </span>
            <span className="propertyGalleryNav propertyGalleryNavNext">
              <Button
                type="button"
                variant="secondary"
                size="icon-lg"
                className="size-11 !translate-y-0 rounded-full bg-background/90 shadow-md backdrop-blur-sm active:!translate-y-0"
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="size-5" />
              </Button>
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="propertyGalleryThumbs">
          {images.slice(0, 6).map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "propertyGalleryThumb overflow-hidden rounded-xl border-2 bg-muted transition",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/15"
                  : "border-transparent opacity-75 hover:opacity-100",
              )}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-current={selectedIndex === index ? "true" : undefined}
            >
              <Image
                src={optimizeImageUrl(image.url, 360)}
                alt=""
                width={360}
                height={240}
                sizes="120px"
                className="aspect-[3/2] w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
