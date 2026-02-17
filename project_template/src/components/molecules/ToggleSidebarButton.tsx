"use client";

import { IconButton } from "@/components/atoms/IconButton";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export interface ToggleSidebarButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function ToggleSidebarButton({ isOpen, onClick }: ToggleSidebarButtonProps) {
  return (
    <IconButton
      onClick={onClick}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isOpen ? (
        <PanelLeftClose className="h-5 w-5" />
      ) : (
        <PanelLeftOpen className="h-5 w-5" />
      )}
    </IconButton>
  );
}
