import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";

interface PageWithHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  backLink?: string;
  children: React.ReactNode;
}

export function PageWithHeader({
  title,
  description,
  icon,
  backLink,
  children,
}: PageWithHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {backLink && (
          <Button variant="ghost" size="icon" asChild>
            <Link href={backLink}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className={backLink ? "flex-1 min-w-0" : "w-full"}>
          <PageHeader title={title} description={description} icon={icon} />
        </div>
      </div>
      {children}
    </div>
  );
}
