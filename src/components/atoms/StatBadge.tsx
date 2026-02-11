import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatBadgeProps {
  icon: React.ElementType;
  count: number;
  label: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ icon: Icon, count, label }) => {
  return (
    <Badge variant="secondary" className="gap-1" title={label}>
      <Icon className="h-3 w-3" />
      {count}
    </Badge>
  );
};
