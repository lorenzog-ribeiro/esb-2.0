"use client";

import Link from "next/link";
import type { NavItem } from "@/config/site";

/** Props for NavLink component */
export interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  /** Mobile: larger touch target (min 44px) */
  variant?: "desktop" | "mobile";
  onClick?: () => void;
  className?: string;
}

export function NavLink({
  item,
  isActive,
  variant = "desktop",
  onClick,
  className = "",
}: NavLinkProps) {
  const Icon = item.icon;

  const baseClasses =
    "flex items-center gap-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const activeClasses = isActive
    ? "text-primary border-b-2 border-primary font-semibold"
    : "text-primary hover:text-accent";

  const sizeClasses =
    variant === "mobile"
      ? "min-h-[44px] min-w-[44px] py-3 px-4 text-lg" // Touch target 44x44
      : "px-2 py-1";

  return (
    <Link
      href={item.href}
      className={`${baseClasses} ${activeClasses} ${sizeClasses} ${className}`}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon
        className={variant === "mobile" ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0"}
        aria-hidden
      />
      {item.label}
    </Link>
  );
}
