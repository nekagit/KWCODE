"use client";

import React from "react";
import { Card } from "@/components/shared/Card";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { AlertCircle } from "lucide-react";
import { PageWithHeader } from "@/components/molecules/LayoutAndNavigation/PageWithHeader";

export type SingleContentPageLayout = "simple" | "card";

interface SingleContentPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  backLink?: string;
  layout: SingleContentPageLayout;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

export function SingleContentPage({
  title,
  description,
  icon,
  backLink,
  layout,
  error,
  children,
  className,
}: SingleContentPageProps) {
  if (layout === "simple") {
    return (
      <div className={className ?? "space-y-6"}>
        <PageWithHeader title={title} description={description} icon={icon} backLink={backLink}>
          {children}
        </PageWithHeader>
      </div>
    );
  }

  return (
    <div className={className ?? "space-y-6"}>
      {error && (
        <ErrorDisplay
          message={error}
          variant="destructive"
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
