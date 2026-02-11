import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { Zap } from "lucide-react";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/QuickActionCard.tsx");

interface QuickActionCardProps {
  children: ReactNode;
}

export function QuickActionCard({ children }: QuickActionCardProps) {
  return (
    <Card
      title={<TitleWithIcon icon={Zap} title="Quick actions" className={classes[0]} iconClassName="text-warning/90" />}
      subtitle="Shortcuts to common tasks"
    >
      {children}
    </Card>
  );
}
