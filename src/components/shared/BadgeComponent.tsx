import React from 'react';
import { Badge, BadgeProps } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import sharedClasses from './shared-classes';

interface BadgeComponentProps {
  icon?: LucideIcon;
  text: string | number;
  variant?: "default" | "secondary" | "destructive" | "outline" | "purple" | null | undefined;
  className?: string;
  title?: string;
}

export const BadgeComponent: React.FC<BadgeComponentProps> = ({
  icon: Icon,
  text,
  variant = "secondary",
  className,
  title,
}) => {
  const resolvedVariant: BadgeProps["variant"] = variant === "purple" ? "default" : variant;
  const purpleClass = variant === "purple" ? sharedClasses.BadgeComponent.rootPurple : "";

  return (
    <Badge data-shared-ui variant={resolvedVariant} className={cn(sharedClasses.BadgeComponent.root, className, purpleClass)} title={title}>
      {Icon && <Icon className={sharedClasses.BadgeComponent.icon} />}
      {text}
    </Badge>
  );
};
