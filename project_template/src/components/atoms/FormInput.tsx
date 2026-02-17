"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FormInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  className?: string;
}

export function FormInput({ className, ...props }: FormInputProps) {
  return <Input className={cn(className)} {...props} />;
}
