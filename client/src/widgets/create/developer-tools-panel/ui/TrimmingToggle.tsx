"use client";
import { Stack, Field, Switch } from "@chakra-ui/react";

interface TrimmingToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const TrimmingToggle = ({ enabled, onChange }: TrimmingToggleProps) => {
  return (
    <Stack align="flex-start">
      <Field.Root>
        <Switch.Root name="trimming" checked={enabled} onCheckedChange={({ checked }) => onChange(checked)}>
          <Switch.HiddenInput />
          <Field.Label>Trimming</Field.Label>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </Field.Root>
    </Stack>
  );
};
