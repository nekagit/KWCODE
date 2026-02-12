import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, MessageSquare, Terminal, Folders, Ticket as TicketIcon, Layers, Lightbulb, LayoutGrid, Building2, PanelLeftClose, PanelLeftOpen, TestTube2, ScrollText, Play, Settings, Moon } from "lucide-react";
import { NavLinkItem } from "@/components/molecules/Navigation/NavLinkItem";
import { useQuickActions } from "@/context/quick-actions-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("SidebarNavigation.tsx");

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; tab?: string; iconClassName?: string };

const getNavItems = (): {
  dashboardNavItem: NavItem;
  toolsNavItems: NavItem[];
  workNavItems: NavItem[];
  bottomNavItems: NavItem[];
} => ({
  dashboardNavItem: {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    tab: "dashboard",
    iconClassName: c["14"],
  },
  toolsNavItems: [
    { href: "/testing", label: "Testing", icon: TestTube2, iconClassName: c["15"] },
    { href: "/architecture", label: "Architecture", icon: Building2, iconClassName: c["16"] },
    { href: "/?tab=all", label: "Database", icon: LayoutGrid, tab: "all", iconClassName: c["17"] },
    { href: "/ideas", label: "Ideas", icon: Lightbulb, iconClassName: c["18"] },
  ],
  workNavItems: [
    { href: "/projects", label: "Projects", icon: Folders, iconClassName: c["14"] },
    { href: "/?tab=tickets", label: "Tickets", icon: TicketIcon, tab: "tickets", iconClassName: c["18"] },
    { href: "/?tab=feature", label: "Feature", icon: Layers, tab: "feature", iconClassName: c["15"] },
    { href: "/prompts", label: "Prompts", icon: MessageSquare, iconClassName: c["16"] },
  ],
  bottomNavItems: [
    { href: "/run", label: "Run", icon: Play, iconClassName: c["17"] },
    { href: "/configuration", label: "Configuration", icon: Settings, iconClassName: c["14"] },
    { href: "/loading-screen", label: "Loading", icon: Moon, iconClassName: c["19"] },
  ],
});

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
  const { dashboardNavItem, toolsNavItems, workNavItems, bottomNavItems } = getNavItems();

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
      {/* Dashboard — standalone top item */}
      <div className="px-2 pt-3 pb-1">
        {renderItem(dashboardNavItem)}
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-1 px-2">
        {/* Tools section */}
        <div className="flex flex-col gap-0.5 pt-3">
          {!sidebarCollapsed && (
            <p className="sidebar-section-label px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
              Tools
            </p>
          )}
          {toolsNavItems.map(renderItem)}
        </div>

        {/* Work section */}
        <div className="flex flex-col gap-0.5 pt-3">
          {!sidebarCollapsed && (
            <p className="sidebar-section-label px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
              Work
            </p>
          )}
          {workNavItems.map(renderItem)}
        </div>

        {/* System section — pushed to bottom */}
        <div className="flex flex-col gap-0.5 pt-3 mt-auto">
          {!sidebarCollapsed && (
            <p className="sidebar-section-label px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
              System
            </p>
          )}
          {/* Log: opens modal (no page) */}
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => openLogModal()}
                  className="sidebar-nav-item flex items-center gap-2.5 rounded-lg w-full text-[13px] font-medium justify-center px-0 py-2 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  aria-label="Open log"
                >
                  <ScrollText className="size-[18px] shrink-0 text-info/80" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Log</TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => openLogModal()}
              className="sidebar-nav-item flex items-center gap-2.5 rounded-lg w-full text-[13px] font-medium px-3 py-2 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <ScrollText className="size-[18px] shrink-0 text-info/80" />
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
    <nav className="flex flex-col flex-1 min-w-0 w-full">
      <Suspense fallback={<SidebarNavigationContent pathname={pathname ?? ""} currentTab="dashboard" sidebarCollapsed={sidebarCollapsed} />}>
        <SidebarNavWithParams pathname={pathname ?? ""} sidebarCollapsed={sidebarCollapsed} />
      </Suspense>
    </nav>
  );
}
