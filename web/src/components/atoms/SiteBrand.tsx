"use client";

import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/config/site";

/** Props for SiteBrand component */
export interface SiteBrandProps {
  /** Show text alongside logo */
  showName?: boolean;
  /** Logo size — defaults to responsive (sm: 32, md: 70) */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 md:w-10 md:h-10",
  md: "w-8 h-8 md:w-[70px] md:h-[70px]",
  lg: "w-12 h-12 md:w-20 md:h-20",
} as const;

export function SiteBrand({
  showName = true,
  size = "md",
  className = "",
}: SiteBrandProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 md:gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg ${className}`}
      aria-label={`${SITE.name} - Página inicial`}
    >
      <span className="rounded-lg p-1 md:p-2 flex items-center justify-center">
        <Image
          src="/bolsito_new.svg"
          alt=""
          width={70}
          height={70}
          className={`${sizeMap[size]} object-contain`}
          priority
        />
      </span>
      {showName && (
        <span className="hidden sm:block gradient-text text-lg md:text-xl font-bold">
          {SITE.name}
        </span>
      )}
    </Link>
  );
}
