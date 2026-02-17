"use client";

import { CardTitle as UICardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardTitleProps
  extends React.ComponentPropsWithoutRef<typeof UICardTitle> {
  className?: string;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <UICardTitle className={cn("text-lg", className)} {...props} />;
}
