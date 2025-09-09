# UI Icons (SVGR)

React コンポーネントとしてインポートして使う UI 向け SVG アイコンを配置する場所です。

- 置き場所: `client/src/assets/icons`
- 命名例: `close.svg`, `play.svg`, `pause.svg`
- 使い方（Vite + SVGR `?react`）:

```tsx
import CloseIcon from '@/assets/icons/close.svg?react'

export const Example = () => (
  <button aria-label="Close">
    <CloseIcon width={20} height={20} />
  </button>
)
```

スタイルのヒント:
- `fill` や `stroke` を `currentColor` にしておくと、親要素の `color` に追従して色が変わります。
- サイズは `width`/`height` か CSS で制御できます。

補足:
- `public/icons` は静的配信用（`<img src="/icons/*.svg" />`）。
- こちらは React コンポーネント化してロジックやスタイル適用が可能です。
