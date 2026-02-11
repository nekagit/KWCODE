"use client";

import { Play, Square } from "lucide-react";
import Link from "next/link";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { StartButton } from "@/components/atoms/buttons/StartButton";
import { StopButton } from "@/components/atoms/buttons/StopButton";
import { PageFooterText } from "@/components/molecules/Navigation/PageFooterText";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("ControlsAndButtons/RunControls.tsx");

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
    <div className={classes[0]} data-testid="run-page-controls">
      <ButtonGroup alignment="left">
        <StartButton onClick={handleStart} disabled={!canStart} />
        <StopButton onClick={handleStop} disabled={!running} />
        {!canStart && (
          <span className={classes[1]}>
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
