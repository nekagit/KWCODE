/** List Item Card component. */
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import sharedClasses from './shared-classes';

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
    <li key={id} data-shared-ui>
      <Card className={cn(sharedClasses.ListItemCard.card, className)}>
        <CardHeader className={sharedClasses.ListItemCard.header}>
          <CardTitle className={sharedClasses.ListItemCard.title}>{title}</CardTitle>
          {subtitle && (
            <p className={sharedClasses.ListItemCard.subtitle}>
              {subtitle}
            </p>
          )}
        </CardHeader>
        {children && <CardContent className={sharedClasses.ListItemCard.content}>{children}</CardContent>}
        {(badge || footerButtons) && (
          <CardFooter className={sharedClasses.ListItemCard.footer}>
            {badge && <Badge variant="secondary">{badge}</Badge>}
            {footerButtons && <div className={sharedClasses.ListItemCard.footerButtons}>{footerButtons}</div>}
          </CardFooter>
        )}
      </Card>
    </li>
  );
};
