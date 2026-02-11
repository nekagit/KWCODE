import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, MessageSquare, Terminal, Folders, Ticket as TicketIcon, Layers, Lightbulb, LayoutGrid, Building2, PanelLeftClose, PanelLeftOpen, TestTube2, ScrollText, Play, Settings } from "lucide-react";
import { NavLinkItem } from "@/components/molecules/Navigation/NavLinkItem";
import { useQuickActions } from "@/context/quick-actions-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; tab?: string; iconClassName?: string };

const dashboardNavItem: NavItem = {
  href: "/",
  label: "Dashboard",
  icon: LayoutDashboard,
  tab: "dashboard",
};

const toolsNavItems: NavItem[] = [
  { href: "/testing", label: "Testing", icon: TestTube2 },
  { href: "/architecture", label: "Architecture", icon: Building2 },
  { href: "/?tab=all", label: "Database", icon: LayoutGrid, tab: "all" },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
];

const workNavItems: NavItem[] = [
  { href: "/projects", label: "Projects", icon: Folders },
  { href: "/?tab=tickets", label: "Tickets", icon: TicketIcon, tab: "tickets" },
  { href: "/?tab=feature", label: "Feature", icon: Layers, tab: "feature" },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
];

const bottomNavItems: NavItem[] = [
  { href: "/run", label: "Run", icon: Play, iconClassName: "text-info/90" },
  { href: "/configuration", label: "Configuration", icon: Settings, iconClassName: "text-muted-foreground/90" },
];

function SidebarNavWithParams({
  pathname,
  sidebarCollapsed,
}: {
  pathname: string | null;
  sidebarCollapsed: boolean;
}) {
  const searchParams = useSearchParams();
  const currentTab = pathname === "/" ? (searchParams?.get("tab") ?? "dashboard") : null;
  return (
    <SidebarNavigationContent
      pathname={pathname ?? ""}
      currentTab={currentTab}
      sidebarCollapsed={sidebarCollapsed}
    />
  );
}

function SidebarNavigationContent({
  pathname,
  currentTab,
  sidebarCollapsed,
}: {
  pathname: string;
  currentTab: string | null;
  sidebarCollapsed: boolean;
}) {
  const { openLogModal } = useQuickActions();

  const renderItem = (item: NavItem) => {
    const { href, label, icon, tab, iconClassName } = item;
    const isActive = tab != null
      ? pathname === "/" && currentTab === tab
      : pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <NavLinkItem
        key={href}
        href={href}
        label={label}
        icon={icon}
        isActive={isActive}
        sidebarCollapsed={sidebarCollapsed}
        iconClassName={iconClassName}
      />
    );
  };

  return (
    <>
      {renderItem(dashboardNavItem)}
      <div className="flex flex-col flex-1 min-h-0 gap-4 mt-4">
        <div className="flex flex-col flex-1 min-h-0 border-t border-primary/30 pt-4 gap-1">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 shrink-0">
              Testing · Architecture · Data
            </p>
          )}
          {toolsNavItems.map(renderItem)}
        </div>
        <div className="flex flex-col flex-1 min-h-0 border-t border-primary/30 pt-4 gap-1">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 shrink-0">
              Projects · Tickets · Features
            </p>
          )}
          {workNavItems.map(renderItem)}
        </div>
        <div className="flex flex-col flex-1 min-h-0 border-t border-primary/30 pt-4 gap-1 mt-auto">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 shrink-0">
              Log · Run · Configuration
            </p>
          )}
          {/* Log: opens modal (no page) */}
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => openLogModal()}
                  className={cn(
                    "flex items-center gap-2 rounded-md py-2.5 w-full text-sm font-medium transition-colors justify-center px-0",
                    "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  aria-label="Open log"
                >
                  <ScrollText className="h-4 w-4 shrink-0 text-info/80" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Log</TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => openLogModal()}
              className={cn(
                "flex items-center gap-2 rounded-md py-2.5 w-full text-sm font-medium transition-colors px-3",
                "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <ScrollText className="h-4 w-4 shrink-0 text-info/80" />
              <span className="truncate">Log</span>
            </button>
          )}
          {bottomNavItems.map(renderItem)}
        </div>
      </div>
    </>
  );
}

export function SidebarNavigation({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col flex-1 min-w-0 w-full px-2 gap-1">
      <Suspense fallback={<SidebarNavigationContent pathname={pathname ?? ""} currentTab="dashboard" sidebarCollapsed={sidebarCollapsed} />}>
        <SidebarNavWithParams pathname={pathname ?? ""} sidebarCollapsed={sidebarCollapsed} />
      </Suspense>
    </nav>
  );
}
