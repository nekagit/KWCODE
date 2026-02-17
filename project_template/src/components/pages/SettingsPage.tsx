"use client";

import { SettingsForm } from "@/components/organisms/SettingsForm";

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
