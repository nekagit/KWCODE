/** Description Tooltip component. */
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Display/DescriptionTooltip.tsx");

type DescriptionTooltipProps = {
  description: string;
  maxLength?: number;
};

export function DescriptionTooltip({
  description,
  maxLength = 60,
}: DescriptionTooltipProps) {
  if (!description) return <span className={classes[0]}>—</span>;

  const truncated = description.length > maxLength ? description.slice(0, maxLength) + "…" : description;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={classes[1]}>
          {truncated}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className={classes[2]}>
        <p className={classes[3]}>{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
