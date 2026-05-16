import Image from "next/image";

import { parsePublicImageUrl } from "@/lib/media/parse-public-image-url";
import { cn } from "@/lib/utils";

export type ListCardThumbnailProps = {
  src: unknown;
  alt: string;
  className?: string;
};

export function ListCardThumbnail({
  src,
  alt,
  className,
}: ListCardThumbnailProps) {
  const href = parsePublicImageUrl(src);
  if (href == null) return null;

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden border-b border-border bg-muted/30",
        className,
      )}
    >
      <Image
        src={href}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover transition-opacity duration-150"
      />
    </div>
  );
}
