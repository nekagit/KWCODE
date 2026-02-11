import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Navigation/NavLinkItem.tsx");

type NavLinkItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  sidebarCollapsed: boolean;
  /** Optional class for icon when not active (e.g. text-info/90 for scheme color). */
  iconClassName?: string;
};

export function NavLinkItem({
  href,
  label,
  icon: Icon,
  isActive,
  sidebarCollapsed,
  iconClassName,
}: NavLinkItemProps) {
  const linkEl = (
    <Link
      href={href}
      className={cn(classes[1],
        sidebarCollapsed ? "justify-center px-0" : "px-3",
        isActive
          ? "bg-background shadow-sm text-primary border-l-2 border-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent"
      )}
    >
      <Icon className={cn(classes[2], !isActive && iconClassName)} />
      {!sidebarCollapsed && <span className={classes[0]}>{label}</span>}
    </Link>
  );

  return (
    <span key={href}>
      {sidebarCollapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        linkEl
      )}
    </span>
  );
}
