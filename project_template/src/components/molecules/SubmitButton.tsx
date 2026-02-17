"use client";

import { PrimaryButton } from "@/components/atoms/PrimaryButton";

export interface SubmitButtonProps
  extends React.ComponentPropsWithoutRef<typeof PrimaryButton> {
  children?: React.ReactNode;
}

export function SubmitButton({
  children = "Save changes",
  ...props
}: SubmitButtonProps) {
  return <PrimaryButton type="submit" {...props}>{children}</PrimaryButton>;
}
