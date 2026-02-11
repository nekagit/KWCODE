import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, MessageSquare, Terminal, Folders, Ticket as TicketIcon, Layers, Lightbulb, LayoutGrid, Building2, PanelLeftClose, PanelLeftOpen, TestTube2 } from "lucide-react";
import { NavLinkItem } from "@/components/molecules/Navigation/NavLinkItem";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; tab?: string };

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
  { href: "/prompts", label: "PromptRecords", icon: MessageSquare },
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
  const renderItem = (item: NavItem) => {
    const { href, label, icon, tab } = item;
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
      />
    );
  };

  return (
    <>
      {renderItem(dashboardNavItem)}
      <div className="flex flex-col flex-1 min-h-0 gap-4 mt-4">
        <div className="flex flex-col flex-1 min-h-0 border-t border-border/50 pt-4 gap-1">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 shrink-0">
              Testing · Architecture · Data
            </p>
          )}
          {toolsNavItems.map(renderItem)}
        </div>
        <div className="flex flex-col flex-1 min-h-0 border-t border-border/50 pt-4 gap-1">
          {!sidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 shrink-0">
              Projects · Tickets · Features
            </p>
          )}
          {workNavItems.map(renderItem)}
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
