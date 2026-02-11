"use client";

import React from "react";
import { Card } from "@/components/shared/Card";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
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
        <ErrorDisplay
          message={error}
          variant={alertVariant === "destructive" ? "destructive" : "default"}
          icon={<AlertCircle className="h-4 w-4" />}
        />
      )}
      <Card
        title={
          <>
            {icon}
            {title}
          </>
        }
        subtitle={description}
      >
        {children}
      </Card>
    </div>
  );
}
