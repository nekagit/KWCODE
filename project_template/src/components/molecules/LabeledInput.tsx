"use client";

import { FormInput } from "@/components/atoms/FormInput";
import { FormLabel } from "@/components/atoms/FormLabel";
import { cn } from "@/lib/utils";

export interface LabeledInputProps
  extends React.ComponentPropsWithoutRef<typeof FormInput> {
  id: string;
  label: string;
  className?: string;
}

export function LabeledInput({
  id,
  label,
  className,
  ...inputProps
}: LabeledInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormInput id={id} {...inputProps} />
    </div>
  );
}
