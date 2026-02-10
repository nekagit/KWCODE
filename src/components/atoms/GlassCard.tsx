import { Card, CardProps } from "@/components/shadcn/card";
import { cn } from "@/lib/utils";

interface GlassCardProps extends CardProps {}

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn("glasgmorphism", className)}
      {...props}
    />
  );
}
