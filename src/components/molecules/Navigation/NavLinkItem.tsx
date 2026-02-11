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
};

export function NavLinkItem({
  href,
  label,
  icon: Icon,
  isActive,
  sidebarCollapsed,
}: NavLinkItemProps) {
  const linkEl = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md py-2.5 w-full text-sm font-medium transition-colors",
        sidebarCollapsed ? "justify-center px-0" : "px-3",
        isActive
          ? "bg-background shadow-sm text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
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
