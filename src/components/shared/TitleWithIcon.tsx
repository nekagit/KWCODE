import { LucideIcon } from "lucide-react";
import React from "react";

interface TitleWithIconProps {
  icon: LucideIcon;
  title: string;
  className?: string;
  iconClassName?: string;
}

export const TitleWithIcon: React.FC<TitleWithIconProps> = ({
  icon: Icon,
  title,
  className,
  iconClassName,
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Icon className={`h-5 w-5 ${iconClassName}`} />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
};
