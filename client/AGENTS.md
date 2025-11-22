# ミクリエ - フロントエンド開発ガイド

このプロジェクトは「ミクリエ」フロントエンド実装のためのガイドラインです。
AGENTS.md の内容は、AI エージェントや人間開発者が共通の開発ルールを理解し、コードの一貫性と品質を保つことを目的としています。

---

## 技術スタック

- **フレームワーク**: React + TypeScript
- **状態管理**: Zustand,Context
- **スタイリング**: Chakra UI ,細かい部分は Emotion
- **ビルド/開発**: Vite
- **Lint / Format**: ESLint + Prettier
- **テスト**: Vitest + React Testing Library

---

## アーキテクチャ

- **FSD（Feature-Sliced Design）** を採用
  - `src/app` : アプリのエントリーポイントとグローバル設定
  - `src/pages` : ルーティング単位の画面コンポーネント
  - `src/widgets` : 複数の features を組み合わせた UI 部品
  - `src/features` : ユースケース単位の機能
  - `src/entities` : ドメインモデル単位の機能
  - `src/shared` : 複数箇所から利用される汎用部品（UI、lib、config など）

### FSD レイヤー依存ルール（厳守）

以下の依存関係のみ許可します。逆方向・横断は禁止です。

| Layer     | Can use                                               | Can be used by                                     |
| --------- | ----------------------------------------------------- | -------------------------------------------------- |
| app       | shared, entities, features, widgets, pages, processes | -                                                  |
| processes | shared, entities, features, widgets, pages            | app                                                |
| pages     | shared, entities, features, widgets                   | processes, app                                     |
| widgets   | shared, entities, features                            | pages, processes, app                              |
| features  | shared, entities                                      | widgets, pages, processes, app                     |
| entities  | shared                                                | features, widgets, pages, processes, app           |
| shared    | -                                                     | entities, features, widgets, pages, processes, app |

> 依存違反を見つけた場合は即時修正。共通化できるものは `shared` へ寄せ、ドメインに紐づくものは `entities` / `features` へ配置すること（DRY）。

### スライス / セグメント

- **スライス（slice）**: プロダクトやビジネスの意味でグループ化（例: `sound`, `user`, `record-audio`）。
  - `app` / `shared` にスライスは **置かない**。
  - スライス同士は **相互依存しない**。共有が必要なら構造を見直すか `shared` を使う。
- **セグメント（segment）**: 技術的性質でグルーピング。標準は `ui` / `model` / `lib` / `api` の 4 つ。
  - `ui`: UI コンポーネント
  - `model`: ビジネスロジック、ストア、データストレージ操作
  - `lib`: 補助コード・インフラコード
  - `api`: 外部 API/Backend との通信
- **カスタムセグメント**は慎重に。基本は `app` と `shared` のみ許可（例: `app/providers`, `shared/types`）。

### Public API（バレル）

- 各スライス直下に `index.ts` を置き、**公開モジュールだけ**を再エクスポートする。
- ルール：
  - ✅ `import { TodoCreateForm } from "@/features/todo-create-form";`
  - ❌ `import { TodoCreateForm } from "@/features/todo-create-form/ui/TodoCreateForm";` （内部構造への依存）
- 内部構造変更は `index.ts` のみで吸収し、外部呼び出しのパスを不変に保つ。
- 名前衝突は `index.ts` 側でエイリアス再エクスポートで解決：
  - `export { Form as TodoCreateForm } from "./ui/TodoCreateForm";`

### インポート規約 / パスエイリアス

- ルートエイリアスは `@/` を使用：
  - `@/shared/*`, `@/entities/*`, `@/features/*`, `@/widgets/*`, `@/pages/*`, `@/app/*`, `@/processes/*`
- **相対パスでの深い参照は禁止**（Public API 経由に統一）。

#### Deep import 禁止（ESLint による強制）

- すべてのレイヤー・スライスにおいて、`ui/`, `model/`, `lib/`, `api/` など **内部セグメントへの直接 import を禁止** する。
- **外部からの参照は必ず Public API（各スライス直下の `index.ts`）経由** とする。
  - ✅ `import { X } from "@/features/todo";`
  - ❌ `import { X } from "@/features/todo/ui/X";`
- 例外は原則設けない（移行期間のみ個別許可可）。例外を設ける場合は ESLint 設定の `allow` に限定的に追加する。

##### 推奨 ESLint ルール（no-restricted-imports）

次のパターンを禁止して、Public API 経由を強制する（`.eslintrc` に設定）:

```json
{
	"rules": {
		"no-restricted-imports": [
			"error",
			{
				"patterns": [
					"@/app/*/*/(ui|model|lib|api)/**",
					"@/processes/*/*/(ui|model|lib|api)/**",
					"@/pages/*/*/(ui|model|lib|api)/**",
					"@/widgets/*/*/(ui|model|lib|api)/**",
					"@/features/*/*/(ui|model|lib|api)/**",
					"@/entities/*/*/(ui|model|lib|api)/**",
					"@/shared/**/(ui|model|lib|api)/**"
				],
				"message": "Deep import 禁止。各 slice の Public API（index.ts）経由で import してください。"
			}
		]
	}
}
```

##### 補足

- `@/` エイリアスは `tsconfig.json` で `"paths": { "@/*": ["src/*"] }` を設定して使用する。
- deep import を検出するため、`import/order` などのスタイルルールと併用すると可読性がさらに向上する。

### DRY 徹底

- 重複検出時の優先順位：
  1. ビジネス非依存 → `shared`
  2. 特定ドメインのスケルトン/型/CRUD → `entities`
  3. ユースケース固有のインタラクション → `features`
- UI とロジックは分離（`ui` と `model`）。UI から `api` を直接呼ばず、`model` を経由。

---

## コーディング規約

- **DRY 原則**を厳守
  - 重複コードは `src/shared` または適切なレイヤーに共通化
- **命名規則**
  - コンポーネント: `PascalCase`（例: `MicVisualizer.tsx`）
  - フック: `useCamelCase`（例: `useAudioEngine.ts`）
  - ファイル名は機能単位で意味を持たせる
- **型定義**
  - 可能な限り `type` より `interface` を使用（拡張性のため）
  - API レスポンス型は `entities` 層で定義し、features 層で利用
- **UI 設計**
  - 状態と UI を分離し、テスト可能な構造に
  - 1 コンポーネントの責務を限定する（Single Responsibility Principle）

---

## 状態管理

- グローバル状態は Zustand を使用
- ローカル状態は可能な限り React の `useState` / `useReducer` で管理
- 不必要に状態をグローバル化しない

---

## Pattern 統一アーキテクチャ（音源データモデル）

ミクリエの音源データ構造は すべて “Pattern” を基本単位 として統一する。
この設計は、録音・編集・保存・アレンジ・再生までの全フローを一貫したデータ構造で扱うことで、
ドメインの複雑性を大幅に削減し、機能拡張にも柔軟に対応できることを目的とする。

### Pattern の 3 レイヤー（唯一のドメインモデル）

ミクリエでは音源データを次の 3 つのレイヤーで管理する：

1. Pattern（保存済み音源）
   • メロディ区間（melodySegments）
   • リズム区間（rhythmSegments）
   • コード進行（bars, chordsPerBar, slots）
   • メタ情報（id, name など）
2. EditingPattern（UI で編集中のパターン）
   • Pattern の deep clone
   • 編集操作により更新される唯一の作業用パターン
   • SegmentContext や一時的な録音状態はここに統合
3. ArrangedPattern（アレンジメント内のパターン）
   • 再生順序に配置された Pattern（旧 queue）
   • Arrangement は ArrangedPattern のリストとして構成

### 設計上の判断基準

• segment という概念は完全に廃止する
• chordStore と SegmentContext を統合し、「editingPatternStore」 として再構築する
• 保存されたパターンは patternPresetsStore に集約
• アレンジメント（旧 queue）は arrangementStore に統一
• 各 store は Zustand の combine() を用いて構築し、状態（state）と操作（actions）を分離した読みやすい構造にする

### Pattern の目的

ミクリエの音源データは以下の目的を満たす：
• 「録音 → 解析 → 編集 → 保存 → 配置 → 再生」が一つのデータモデルで繋がる
• UI とビジネスロジックの境界が明確になる
• Pattern の保存・読込・複製・差し替えが容易になる
• segment / chord / arrangement の分裂を解消し、
全フローで Pattern を中心に据える統一アーキテクチャ となる

---

## ディレクトリ構成例

```
src/
  app/
    providers/
      index.ts
    index.tsx
  processes/
    onboarding/
      ui/
      model/
  pages/
    RecorderPage/
      ui/
      model/
      index.ts
  widgets/
    AudioWaveform/
      ui/
      model/
      index.ts
  features/
    record-audio/
      ui/
      model/
      api/
      index.ts
    classify-sound/
      ui/
      model/
      api/
      index.ts
  entities/
    sound/
      ui/
      model/
      lib/
      api/
      index.ts
    user/
      model/
      index.ts
  shared/
    ui/
    lib/
    config/
    api/
    types/
    index.ts
```

**メモ**

- 各スライスの外部公開は `index.ts` 経由に限定（Public API）。
- `entities` はビジネスモデルのスケルトンと CRUD、`features` はユーザーインタラクション、`widgets`/`pages` は構成要素として利用するだけ。
- `pages` は基本的にデータローディングやルーティング調停に専念し、ビジネスロジックは持たない。
- `index.tsx` ファイルはパブリック API のエントリーポイントとして利用でき、ディレクトリ直下の `index` は特別扱いされるため、`import` 文で `/index` を省略可能。これによりパスが簡潔になり、内部構造変更時の影響を抑えられる。

## 言語ルール

- 応答は、説明文・考察・指示・提案を含め、すべて日本語で行うこと。
- 技術用語やコードは必要に応じて英語を使用してよいが、それ以外の説明や文脈は必ず日本語にすること。
- 翻訳が必要な場合も、日本語を優先して提供すること。

## アーキテクチャリファクタリングモード

このモードは、特定の指示文が入力に含まれる場合にのみ有効化されます。
有効化された場合、以下の方針と作業範囲に従い、既存の仕様や挙動を変更せずにアーキテクチャ構造を最適化します。

### 有効化コマンド

このモードを有効化するには、指示文内に以下のキーワードを含めてください：
`#ar-mode`

このキーワードが含まれている場合、AI エージェントはアーキテクチャ構造の改善のみを行い、機能や UI には一切変更を加えません。

### リファクタリング方針（重要）

- 対象はあくまでアーキテクチャ構造の適用（FSD, Public API バレル化, import ルール統一, エイリアス整備, レイヤー依存制御など）に限定する。
- 既存の機能や UI 挙動の変更は一切行わない。
- 機能の追加や削除、UI デザイン変更、ロジック改変は禁止。
- import パス変更やファイル配置の調整は許可するが、動作や見た目に影響を与えないことを絶対条件とする。

### 作業範囲

1. バレルファイル追加：index.ts を slice 直下に作成し、Public API のみに限定した export を行う。
2. エイリアス統一：@/\* を基本とし、既存エイリアスは移行期間として残す。
3. ファイル配置整理：composition component は適切なレイヤー（例: widgets）に移動。
4. Lint ルール設定：no-restricted-imports などで deep import 禁止・レイヤー境界を強制。
5. DRY 対応（任意）：機能重複部分を共通ライブラリに移動（挙動変更なし）。

### 禁止事項

- 関数やコンポーネントの内部処理の変更
- UI や DOM 構造の変更
- パフォーマンス改善目的でのロジック最適化
- スタイルの変更
- 新規機能追加や仕様変更

### 目的

- プロジェクト全体のアーキテクチャを FSD に準拠させ、保守性と拡張性を高める。
- 機能や UI の安全性を 100%確保しながら、構造面だけを改善する。

### 推奨インボーク文

#ar-mode

以下の内容に従って、**既存の仕様・UI 挙動を一切変えずに**、アーキテクチャ面のみを改善してください。

#### 概要

- FSD に合わせて、slice ごとの Public API バレルを整備し、`@/...` エイリアスを追加、cross-feature import を削減する。
- 複合的な波形 UI を **widgets** に移動し、feature 間の直接依存を排除する。
- DRY・import 階層・レイヤー境界を守るための具体パッチと ESLint 設定を適用する。

#### 既存違反（参考・修正対象）

- Public API を経由しない深い import（例：`@entities/audio/model/RecordingContext`, `@features/tempo/ui/TempoControlButton`）
- `WaveformDisplay` が録音/再生/テンポ/編集を直接 import → **widgets** へ移動して compose する
- Import alias が混在（`@/...` 推奨）
- 再生ループ系 hook の重複（共通スケジューリング処理の抽出候補）

#### リファクタ方針（必須）

- 各 slice 直下に `index.ts` を追加し、公開 UI/Model のみを再 export（Public API バレル）。
- エイリアス統一：`"@/*": ["src/*"]` を追加（既存エイリアスは当面併存可）。
- `WaveformDisplay` を **widgets** 配下へ移動し、pages は widgets から利用。
- ESLint で deep import 禁止とレイヤー境界を強制（`no-restricted-imports`、必要に応じて `eslint-plugin-boundaries`）。
- ループ処理の共通化は **後続** フェーズに限定（現挙動を一切変更しない抽出のみ可）。

#### 作業範囲（やること）

1. `index.ts` バレルの追加・不足分の補完
2. import の **段階的置換**：深いパス → バレル／`@/...`
3. `WaveformDisplay` を widgets へ移設し、参照更新（機能/UI は絶対不変）
4. ESLint 設定の追記（deep import 禁止・レイヤー境界）
5. 型チェックとビルド実行でパス漏れ検出・修正（挙動変更なし）

#### 禁止事項（厳守）

- 関数/コンポーネント内部ロジックの変更、UI/DOM/スタイルの変更、パフォーマンス最適化、新機能追加・仕様変更
- スナップショット・スクショ差分で見た目や挙動が変わる変更

#### 受け入れ条件（Definition of Done）

- すべての深い import がバレル or `@/...` に置換されている
- `WaveformDisplay` は widgets 配下にあり、ビルド/動作/見た目が **完全一致**
- ESLint で deep import とレイヤー違反が検出される設定が有効
- CI/型チェック/ビルドが成功（警告は方針外を除き解消）
- 変更は **リネーム・移動・import 差し替え・設定追加** に限定され、機能/UI 差分ゼロ

#### 出力物

- 追加/更新ファイル一覧と目的
- ESLint 設定の抜粋（有効化方法付き）
- 既知の未対応箇所（あれば）と次アクション
