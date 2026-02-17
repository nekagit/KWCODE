"use client";

import { FormCard } from "@/components/shared/FormCard";
import { LabeledInput } from "@/components/molecules/LabeledInput";
import { SubmitButton } from "@/components/molecules/SubmitButton";

export function SettingsForm() {
  return (
    <FormCard
      title="Profile"
      description="Update your profile information."
    >
      <LabeledInput
        id="name"
        label="Name"
        placeholder="Your name"
      />
      <LabeledInput
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />
      <SubmitButton />
    </FormCard>
  );
}
