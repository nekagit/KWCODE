import { Card } from "@/components/shared/Card";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn("glasgmorphism", className)}
      {...props}
    >
      {children}
    </Card>
  );
}
