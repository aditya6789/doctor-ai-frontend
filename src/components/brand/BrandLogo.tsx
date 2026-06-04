import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "ClinicSuite";
export const CONTACT_EMAIL = "hello@clinicsuite.cloud";

const fullSizeClasses = {
  sm: "h-12 w-auto max-w-[220px]",
  md: "h-14 w-auto max-w-[260px] sm:h-16",
  lg: "h-16 w-auto max-w-[300px] sm:h-[4.25rem]",
  xl: "h-[4.5rem] w-auto max-w-[360px] sm:h-20",
  "2xl": "h-20 w-auto max-w-[400px] sm:h-24 md:h-[6.5rem]",
} as const;

const iconSizeClasses = {
  sm: "h-12 w-12",
  md: "h-14 w-14",
  lg: "h-16 w-16",
  xl: "h-[4.5rem] w-[4.5rem]",
  "2xl": "h-20 w-20 sm:h-24 sm:w-24",
} as const;

type BrandLogoProps = {
  /** `full` = icon + wordmark; `icon` = grid mark only */
  variant?: "full" | "icon";
  size?: keyof typeof fullSizeClasses;
  href?: string | null;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  size = "md",
  href = "/",
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const src = variant === "full" ? "/full_logo.png" : "/logo.png";
  const isFull = variant === "full";
  const dimension = isFull ? { width: 520, height: 140 } : { width: 96, height: 96 };

  const image = (
    <Image
      src={src}
      alt={BRAND_NAME}
      width={dimension.width}
      height={dimension.height}
      priority={priority}
      className={cn(
        "object-contain object-left",
        isFull ? fullSizeClasses[size] : iconSizeClasses[size],
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
