import React from 'react';
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

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
  return (
    <Badge variant={variant} className={cn("gap-1", className)} title={title}>
      {Icon && <Icon className="h-3 w-3" />}
      {text}
    </Badge>
  );
};
