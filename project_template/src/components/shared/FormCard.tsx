"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormCard({
  title,
  description,
  children,
  className,
}: FormCardProps) {
  return (
    <Card className={cn("max-w-xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
