"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact image slider for cards. Accepts an array of image objects
 * ({ url }) or plain URL strings. Shows prev/next arrows + dot indicators
 * when there is more than one image.
 */
export default function ImageSlider({ images = [], alt = "", className, aspect = "aspect-[4/3]" }) {
  const slides = (images || [])
    .map((im) => (typeof im === "string" ? im : im?.url))
    .filter(Boolean);
  const [i, setI] = useState(0);

  const list = slides.length ? slides : ["/placeholder.svg"];
  const count = list.length;
  const go = (dir) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setI((c) => (c + dir + count) % count);
  };

  return (
    <div className={cn("group relative overflow-hidden rounded-lg bg-muted", aspect, className)}>
      <Image
        key={i}
        src={list[i]}
        alt={alt}
        fill
        sizes="(max-width:768px) 100vw, 400px"
        className="object-cover transition-opacity"
      />

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={go(-1)}
            aria-label="Previous image"
            className="absolute left-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 transition-opacity hover:bg-black/65 group-hover:opacity-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={go(1)}
            aria-label="Next image"
            className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 transition-opacity hover:bg-black/65 group-hover:opacity-100"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
            {list.map((_, d) => (
              <button
                key={d}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setI(d); }}
                aria-label={`Go to image ${d + 1}`}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  d === i ? "w-4 bg-white" : "bg-white/55 hover:bg-white/80"
                )}
              />
            ))}
          </div>

          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {i + 1}/{count}
          </span>
        </>
      )}
    </div>
  );
}
