import Image from "next/image";
import { cn } from "@/lib/utils";
import logoUnibac from "@/public/logo_unibac.png";

const ALT =
  "Logo de la Institución Universitaria Bellas Artes y Ciencias de Bolívar";

type UnibacLogoProps = {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function UnibacLogo({
  className,
  imgClassName,
  priority = false,
}: UnibacLogoProps) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <Image
        src={logoUnibac}
        alt={ALT}
        sizes="(max-width: 768px) 260px, 320px"
        priority={priority}
        className={cn(
          "h-auto max-h-32 w-auto max-w-[min(100%,320px)] object-contain object-center",
          imgClassName,
        )}
      />
    </div>
  );
}
