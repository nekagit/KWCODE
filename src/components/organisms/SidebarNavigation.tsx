import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, MessageSquare, Folders, Lightbulb, Cpu, LayoutGrid, Settings, Moon } from "lucide-react";
import { NavLinkItem } from "@/components/molecules/Navigation/NavLinkItem";
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
    { href: "/ideas", label: "Ideas", icon: Lightbulb, iconClassName: c["18"] },
    { href: "/technologies", label: "Technologies", icon: Cpu, iconClassName: c["14"] },
  ],
  workNavItems: [
    { href: "/projects", label: "Projects", icon: Folders, iconClassName: c["14"] },
    { href: "/prompts", label: "Prompts", icon: MessageSquare, iconClassName: c["16"] },
  ],
  bottomNavItems: [
    { href: "/?tab=all", label: "Database", icon: LayoutGrid, tab: "all", iconClassName: c["17"] },
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
