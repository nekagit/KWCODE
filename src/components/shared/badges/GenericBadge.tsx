import React from 'react';
import { Badge, BadgeProps } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface GenericBadgeProps {
  icon?: LucideIcon;
  text: string | number;
  variant?: "default" | "secondary" | "destructive" | "outline" | "purple" | null | undefined;
  className?: string;
  title?: string;
}

export const GenericBadge: React.FC<GenericBadgeProps> = ({
  icon: Icon,
  text,
  variant = "secondary",
  className,
  title,
}) => {
  const resolvedVariant: BadgeProps["variant"] = variant === "purple" ? "default" : variant;
  const purpleClass = variant === "purple"
    ? "bg-purple-500 text-purple-50-foreground hover:bg-purple-500/80"
    : "";

  return (
    <Badge variant={resolvedVariant} className={cn("gap-1", className, purpleClass)} title={title}>
      {Icon && <Icon className="h-3 w-3" />}
      {text}
    </Badge>
  );
};
