import Image from "next/image";

import type { ProjectImage } from "@/content/projects";
import { cn } from "@/lib/cn";

/** Screenshot gallery for case studies. Desktop shots span wide; phones sit in a narrow column. */
export function Gallery({ images }: { images: ProjectImage[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-6">
      {images.map((img, i) => (
        <li
          key={img.src}
          className={cn(
            "overflow-hidden rounded-2xl border border-line bg-surface",
            img.kind === "mobile" ? "md:col-span-2" : i === 0 ? "md:col-span-6" : "md:col-span-4",
          )}
        >
          <figure>
            <div className={cn("relative w-full", img.kind === "mobile" ? "aspect-[9/16]" : i === 0 ? "aspect-[16/9]" : "aspect-[16/10]")}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={img.kind === "mobile" ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 66vw"}
                priority={i === 0}
                className="object-cover object-top"
              />
            </div>
            {img.caption ? (
              <figcaption className="border-t border-line px-4 py-3 font-mono text-[11px] leading-relaxed text-muted">{img.caption}</figcaption>
            ) : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}
