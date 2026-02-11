import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { Zap } from "lucide-react";

interface QuickActionCardProps {
  children: ReactNode;
}

export function QuickActionCard({ children }: QuickActionCardProps) {
  return (
    <Card
      title={<TitleWithIcon icon={Zap} title="Quick actions" className="text-lg" iconClassName="text-warning/90" />}
      subtitle="Shortcuts to common tasks"
    >
      {children}
    </Card>
  );
}
