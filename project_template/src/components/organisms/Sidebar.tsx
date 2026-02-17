"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings } from "lucide-react";
import { NavItem } from "@/components/molecules/NavItem";
import { ToggleSidebarButton } from "@/components/molecules/ToggleSidebarButton";
import { Divider } from "@/components/molecules/Divider";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-[width] duration-200",
        isOpen ? "w-56" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {isOpen && (
          <span className="font-semibold text-foreground">Admin</span>
        )}
        <ToggleSidebarButton isOpen={isOpen} onClick={toggle} />
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
            className={!isOpen ? "justify-center px-2" : undefined}
          />
        ))}
      </nav>
      <Divider />
    </aside>
  );
}
