import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type DescriptionTooltipProps = {
  description: string;
  maxLength?: number;
};

export function DescriptionTooltip({
  description,
  maxLength = 60,
}: DescriptionTooltipProps) {
  if (!description) return <span className="text-muted-foreground text-xs">—</span>;

  const truncated = description.length > maxLength ? description.slice(0, maxLength) + "…" : description;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-muted-foreground text-xs max-w-[240px] truncate block cursor-default">
          {truncated}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm">
        <p className="whitespace-pre-wrap text-xs">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
