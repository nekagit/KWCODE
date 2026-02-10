"use client";

import React from "react";
import { GlassCard } from "@/components/atoms/GlassCard";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { AlertCircle } from "lucide-react";

interface ThemedPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string | null;
  alertVariant?: "default" | "destructive";
}

export function ThemedPageLayout({
  title,
  description,
  children,
  icon,
  error,
  alertVariant = "destructive",
}: ThemedPageLayoutProps) {
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant={alertVariant}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {description && <CardDescription className="text-base">{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </GlassCard>
    </div>
  );
}
