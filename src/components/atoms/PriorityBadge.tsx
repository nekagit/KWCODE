import React from 'react';
import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: number;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <Badge variant="outline" className="text-xs">
      P{priority}
    </Badge>
  );
};
