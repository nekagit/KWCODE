"use client";

import { Play, Square } from "lucide-react";
import Link from "next/link";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { StartButton } from "@/components/atoms/buttons/StartButton";
import { StopButton } from "@/components/atoms/buttons/StopButton";
import { PageFooterText } from "@/components/atoms/displays/PageFooterText";

interface RunControlsProps {
  handleStart: () => Promise<void>;
  handleStop: () => Promise<void>;
  canStart: boolean;
  running: boolean;
}

export function RunControls({
  handleStart,
  handleStop,
  canStart,
  running,
}: RunControlsProps) {
  return (
    <div className="space-y-6">
      <ButtonGroup alignment="left">
        <StartButton onClick={handleStart} disabled={!canStart} />
        <StopButton onClick={handleStop} disabled={!running} />
        {!canStart && (
          <span className="text-sm text-muted-foreground">
            Select at least one prompt and one project to run.
          </span>
        )}
      </ButtonGroup>

      <PageFooterText
        text="Timing (delays between operations) is configured on the"
        linkHref="/configuration"
        linkText="Configuration"
      />
      <PageFooterText
        text="View output in the"
        linkHref="/?tab=log"
        linkText="Log"
      />
    </div>
  );
}
