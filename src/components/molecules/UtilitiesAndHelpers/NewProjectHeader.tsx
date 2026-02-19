/** New Project Header component. */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("UtilitiesAndHelpers/NewProjectHeader.tsx");

interface NewProjectHeaderProps {
  title: string;
  description: string;
}

export function NewProjectHeader({ title, description }: NewProjectHeaderProps) {
  return (
    <div className={classes[0]}>
      <div className={classes[1]}>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className={classes[2]} />
          </Link>
        </Button>
        <PageHeader title={title} subtitle={description} />
      </div>
    </div>
  );
}
