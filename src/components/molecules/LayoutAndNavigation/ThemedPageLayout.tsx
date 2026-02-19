"use client";

/** Themed Page Layout component. */
import React from "react";
import { Card } from "@/components/shared/Card";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { AlertCircle } from "lucide-react";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("LayoutAndNavigation/ThemedPageLayout.tsx");

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
    <div className={classes[0]}>
      {error && (
        <ErrorDisplay
          message={error}
          variant={alertVariant === "destructive" ? "destructive" : "default"}
          icon={<AlertCircle className={classes[1]} />}
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
