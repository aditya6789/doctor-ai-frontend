import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "ClinicSuite";

type BrandLogoProps = {
  /** `full` = icon + wordmark; `icon` = grid mark only */
  variant?: "full" | "icon";
  href?: string | null;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  href = "/",
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const src = variant === "full" ? "/full_logo.png" : "/logo.png";
  const isFull = variant === "full";

  const image = (
    <Image
      src={src}
      alt={BRAND_NAME}
      width={isFull ? 200 : 44}
      height={isFull ? 52 : 44}
      priority={priority}
      className={cn(
        "h-auto w-auto object-contain object-left",
        isFull ? "h-8 w-auto max-w-[min(100%,200px)] sm:h-9" : "h-9 w-9 sm:h-10 sm:w-10",
        imageClassName
      )}
    />
  );

  const wrapperClass = cn("inline-flex shrink-0 items-center", className);

  if (href) {
    return (
      <Link href={href} className={wrapperClass} aria-label={BRAND_NAME}>
        {image}
      </Link>
    );
  }

  return <span className={wrapperClass}>{image}</span>;
}
