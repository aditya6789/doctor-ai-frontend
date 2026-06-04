import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "ClinicSuite";

const fullSizeClasses = {
  sm: "h-10 w-auto max-w-[200px]",
  md: "h-12 w-auto max-w-[240px] sm:h-14",
  lg: "h-14 w-auto max-w-[280px] sm:h-16",
  xl: "h-16 w-auto max-w-[320px] sm:h-[4.5rem]",
} as const;

const iconSizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
  xl: "h-16 w-16",
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
  const dimension = isFull ? { width: 360, height: 96 } : { width: 64, height: 64 };

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
