"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  active,
  className,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
        className
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
