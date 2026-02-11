import React from 'react';
import { Button } from "@/components/ui/button";
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface GenericButtonProps {
  onClick: () => void;
  icon?: React.ElementType<LucideIcon>;
  text: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "purple" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  disabled?: boolean;
  title?: string;
  iconPlacement?: "left" | "right";
  className?: string;
  iconClassName?: string;
}

export const GenericButton: React.FC<GenericButtonProps> = ({
  onClick,
  icon: Icon,
  text,
  variant = "default",
  size = "default",
  disabled = false,
  title,
  iconPlacement = "left",
  className,
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
    >
      {iconPlacement === "left" && Icon && <Icon className={cn("h-4 w-4 mr-2", iconClassName)} />}
      {text}
      {iconPlacement === "right" && Icon && <Icon className={cn("h-4 w-4 ml-2", iconClassName)} />}
    </Button>
  );
};
