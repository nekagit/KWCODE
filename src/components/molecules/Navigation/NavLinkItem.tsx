import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "flex items-center gap-2 rounded-md py-2.5 w-full text-sm font-medium transition-colors",
        sidebarCollapsed ? "justify-center px-0" : "px-3",
        isActive
          ? "bg-background shadow-sm text-primary border-l-2 border-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", !isActive && iconClassName)} />
      {!sidebarCollapsed && <span className="truncate">{label}</span>}
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
