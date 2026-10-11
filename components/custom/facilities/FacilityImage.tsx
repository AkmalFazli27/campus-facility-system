"use client";

import { useState } from "react";
import { createElement } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getFacilityImage, getFacilityTypeIcon } from "@/lib/facilities/images";

type FacilityImageProps = {
  type: string;
  name?: string;
  imageUrl?: string | null;
  className?: string;
  sizes?: string;
};

// Prioritas berlapis: foto custom (fase upload) → gambar per tipe → ikon fallback.
// Tidak pernah menampilkan gambar rusak: tiap sumber yang gagal dimuat
// lanjut ke lapis berikutnya hingga banner ikon.
export default function FacilityImage({
  type,
  name,
  imageUrl,
  className,
  sizes,
}: FacilityImageProps) {
  const mapping = getFacilityImage(type);
  const candidates = [imageUrl?.trim() || null, mapping.src].filter(
    (src): src is string => Boolean(src),
  );
  const [failedCount, setFailedCount] = useState(0);

  const alt = name ? `Foto ${name}` : mapping.alt;

  if (failedCount >= candidates.length) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex aspect-video w-full flex-col items-center justify-center gap-2 bg-orange-50 text-orange-300",
          className,
        )}
      >
        {createElement(getFacilityTypeIcon(type), {
          className: "size-10",
          "aria-hidden": true,
        })}
        <span className="text-xs font-medium tracking-wide uppercase">{type}</span>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-orange-50", className)}>
      <Image
        src={candidates[failedCount] ?? mapping.src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 640px) 100vw, 33vw"}
        className="object-cover"
        onError={() => setFailedCount((count) => count + 1)}
      />
    </div>
  );
}
