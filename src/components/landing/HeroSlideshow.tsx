"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type HeroImage = {
  src: string;
  alt: string;
};

function slideCropClass(index: number) {
  const position = index + 1;
  if (position % 3 === 0) return " cropB";
  if (position % 2 === 0) return " cropA";
  return "";
}

export function HeroSlideshow({ images }: { images: HeroImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const loadedIndices = useRef<Set<number>>(new Set());

  useEffect(() => {
    setActiveIndex((current) =>
      Math.min(current, Math.max(images.length - 1, 0)),
    );
  }, [images.length]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion || paused || images.length < 2) return;

    let timer: number | undefined;
    const startRotation = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        setActiveIndex((current) => {
          if (!loadedIndices.current.has(current)) return current;
          return (current + 1) % images.length;
        });
      }, 5500);
    };

    let observer: PerformanceObserver | undefined;
    if ("PerformanceObserver" in window) {
      try {
        observer = new PerformanceObserver(() => {
          startRotation();
          observer?.disconnect();
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        observer = undefined;
      }
    }
    const fallback = window.setTimeout(startRotation, 8000);

    return () => {
      observer?.disconnect();
      window.clearTimeout(fallback);
      if (timer) window.clearInterval(timer);
    };
  }, [images.length, paused]);

  const mountedIndices = useMemo(() => {
    const count = images.length;
    if (count <= 3) return new Set(images.map((_, index) => index));
    const previous = (activeIndex - 1 + count) % count;
    const next = (activeIndex + 1) % count;
    return new Set([previous, activeIndex, next]);
  }, [activeIndex, images.length]);

  if (!images.length) return null;

  return (
    <div
      className="heroSlideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          setActiveIndex((current) => (current + 1) % images.length);
        }
        if (event.key === "ArrowLeft") {
          setActiveIndex(
            (current) => (current - 1 + images.length) % images.length,
          );
        }
      }}
      role="region"
      aria-label="Bộ ảnh bất động sản nổi bật"
    >
      {images.map((image, index) => {
        if (!mountedIndices.has(index)) return null;
        return (
          <div
            className={`heroSlide${index === activeIndex ? " isActive" : ""}`}
            key={`${image.src}-${index}`}
            aria-hidden="true"
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes="100vw"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              className={`heroSlideImage${slideCropClass(index)}`}
              onLoad={() => {
                loadedIndices.current.add(index);
              }}
              onError={() => {
                loadedIndices.current.add(index);
              }}
            />
          </div>
        );
      })}
      {images.length > 1 && (
        <div className="heroDots">
          {images.map((image, index) => (
            <button
              type="button"
              className={index === activeIndex ? "isActive" : ""}
              onClick={() => setActiveIndex(index)}
              aria-label={`Hiển thị ảnh nền ${index + 1}: ${image.alt}`}
              aria-pressed={index === activeIndex}
              key={`${image.src}-dot`}
            />
          ))}
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        Ảnh {activeIndex + 1} trên {images.length}: {images[activeIndex].alt}
      </span>
    </div>
  );
}
