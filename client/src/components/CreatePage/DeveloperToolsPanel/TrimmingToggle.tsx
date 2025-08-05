"use client";

// トリミング機能のON/OFFを切り替えるスイッチコンポーネント。
// ユーザーがチェック状態を変更することで、親コンポーネントへ状態を伝える。

import { Stack, Field, Switch } from "@chakra-ui/react";

// コンポーネントのprops型定義
interface TrimmingToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const TrimmingToggle = ({ enabled, onChange }: TrimmingToggleProps) => {
  // スイッチUIのレンダリング（Chakra UIのSwitchとFieldを使用）
  return (
    <Stack align="flex-start">
      <Field.Root>
        {/* スイッチの状態と変更処理をpropsにバインド */}
        <Switch.Root
          name="trimming"
          checked={enabled}
          onCheckedChange={({ checked }) => onChange(checked)}
        >
          <Switch.HiddenInput />
          <Switch.Control />
          <Switch.Label>トリミング</Switch.Label>
        </Switch.Root>
      </Field.Root>
    </Stack>
  );
};