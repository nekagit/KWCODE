import { ReactNode } from "react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/TitleWithIcon";
import { Zap } from "lucide-react";

interface QuickActionCardProps {
  children: ReactNode;
}

export function QuickActionCard({ children }: QuickActionCardProps) {
  return (
    <Card
      title={<TitleWithIcon icon={Zap} title="Quick actions" className="text-lg" />}
      subtitle="Shortcuts to common tasks"
    >
      {children}
    </Card>
  );
}
