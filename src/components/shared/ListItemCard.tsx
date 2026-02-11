import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ListItemCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  badge?: string;
  footerButtons?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export const ListItemCard: React.FC<ListItemCardProps> = ({
  id,
  title,
  subtitle,
  badge,
  footerButtons,
  children,
  className,
}) => {
  return (
    <li key={id}>
      <Card className={cn("bg-muted/30 p-4", className)}>
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </CardHeader>
        {children && <CardContent className="p-0 mb-2">{children}</CardContent>}
        {(badge || footerButtons) && (
          <CardFooter className="flex items-center justify-between p-0 gap-2 mt-2">
            {badge && <Badge variant="secondary">{badge}</Badge>}
            {footerButtons && <div className="flex flex-wrap gap-2 ml-auto">{footerButtons}</div>}
          </CardFooter>
        )}
      </Card>
    </li>
  );
};
