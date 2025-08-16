#!/usr/bin/env zsh
# zsh 版: macOS デフォルトの zsh で動作するように書き換え
# - mapfile を使用せず while/read で配列に格納
# - bash 専用構文を排除
# - 日本語コメントで手順を明記

set -e
set -u
set -o pipefail

# 走査対象のルートとレイヤ
ROOT="src"  # 必要ならプロジェクトに合わせて変更
LAYERS=("entities" "features" "widgets" "pages" "shared" "app") # 走査対象

# 集計用カウンタ（スクリプト全体）
typeset -i TOTAL_ONLY=0
typeset -i TOTAL_USED=0

# 色（ONLY を赤字表示）
RED=$'\033[31m'
RESET=$'\033[0m'

# 文字列トリム（前後の空白除去）
trim() { awk '{$1=$1;print}'; }

# シンボル列をカンマで分解し、rename(as)対応・default as対応を処理
# 入力例: "Foo as Bar, default as Baz, Qux"
# 出力例: Bar\nBaz\nQux
normalize_symbols() {
  sed 's/[{}]//g' \
  | tr ',' '\n' \
  | while read -r line; do
      sym="$(echo "$line" | trim)"
      [ -z "$sym" ] && continue
      # "default as Name" → Name
      if echo "$sym" | rg -q '^\s*default\s+as\s+'; then
        echo "$sym" | awk '{print $3}'
        continue
      fi
      # "Foo as Bar" → Bar（公開名で検索するのが自然）
      if echo "$sym" | rg -q '\bas\b'; then
        echo "$sym" | awk '{print $3}'
        continue
      fi
      # そのまま（Foo）
      echo "$sym" | awk '{print $1}'
    done \
  | rg -v '^\s*$' || true
}

# index.ts から named export を抽出（re-export/local 両方）
# 1) export { A, B } from './...'
# 2) export { A, B }
extract_named_exports() {
  local file="$1"

  # 1) re-export 形式
  rg --no-heading -o \
     -r '$1' \
     -e 'export\s+\{([^}]+)\}\s+from\s+["'\''][^"'\'']+["'\'']\s*;?' \
     "$file" \
     | normalize_symbols || true

  # 2) ローカル export 形式（行末で終わるもののみを対象にし、re-export を誤検出しない）
  rg --no-heading -o \
     -r '$1' \
     -e '^\s*export\s+\{([^}]+)\}\s*;?\s*$' \
     "$file" \
     | normalize_symbols || true
}

# star export の有無を検出（export * from ... / export * as ns from ...）
has_star_exports() {
  local file="$1"
  if rg -q 'export\s+\*\s+from' "$file" || rg -q 'export\s+\*\s+as\s+\w+\s+from' "$file"; then
    return 0
  else
    return 1
  fi
}

# 同スライス外で使われているかをチェック
# 方針: import 文を対象に、公開名でヒットするかを検索（誤検出を減らす）
used_externally() {
  local symbol="$1"
  local slice_dir="$2"

  # import {... symbol ...} from '...'
  if rg --pcre2 --no-heading -n \
        -e "import\\s+[^;]*\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s+from\\s+['\"][^'\"]+['\"]" \
        "$ROOT" \
        --glob "!$slice_dir/**" \
        --glob "!**/*.d.ts" \
        >/dev/null; then
    return 0
  fi

  # default import で同名扱いのケース（低優先・参考）
  # import Symbol from '...'
  if rg --pcre2 --no-heading -n \
        -e "import\\s+\\b${symbol}\\b\\s+from\\s+['\"][^'\"]+['\"]" \
        "$ROOT" \
        --glob "!$slice_dir/**" \
        --glob "!**/*.d.ts" \
        >/dev/null; then
    return 0
  fi

  return 1
}

echo "Scan start..."
echo

# 対象レイヤの index.ts を総なめ
for L in "${LAYERS[@]}"; do
  # fd の結果を 1 行ずつ読み取り
  fd -a 'index.ts' "$ROOT/$L" | while read -r index_file; do
    # fd で何も見つからなかった場合をケア
    [ -z "${index_file:-}" ] && continue

    echo "=== Checking ${index_file} ==="
    slice_dir="$(dirname "$index_file")"

    # named export 抽出（配列に格納）
    symbols=()
    while IFS= read -r sym; do
      [ -z "${sym:-}" ] && continue
      symbols+=("$sym")
    done < <(extract_named_exports "$index_file")

    # 重複除去（re-export とローカル export の両方に同一シンボルがある場合への保険）
    typeset -A __seen
    uniq_symbols=()
    for s in "${symbols[@]}"; do
      if [[ -z "${__seen[$s]-}" ]]; then
        uniq_symbols+=("$s")
        __seen[$s]=1
      fi
    done
    symbols=("${uniq_symbols[@]}")

    # star export の注記
    if has_star_exports "$index_file"; then
      echo "  (note) Star export detected (export * ...). 個別シンボル解析は対象外。"
    fi

    if [ "${#symbols[@]}" -eq 0 ]; then
      echo "  (no named exports detected)"
      echo
      continue
    fi

    # それぞれのシンボルについて、外部使用を判定
    for sym in "${symbols[@]}"; do
      # シンボル名が JS/TS 予約語/無効文字などの場合はスキップ
      if [ -z "$sym" ] || echo "$sym" | rg -q '^[\*\{\}]$'; then
        continue
      fi

      echo "  Symbol: ${sym}"
      if used_externally "$sym" "$slice_dir"; then
        echo "    -> USED externally"
        TOTAL_USED=$(( TOTAL_USED + 1 ))
      else
        printf "    -> ${RED}ONLY internal${RESET}\n"
        TOTAL_ONLY=$(( TOTAL_ONLY + 1 ))
      fi
    done
    echo
  done
done

echo "----------------------------------------"
printf "TOTAL ONLY internal: ${RED}%d${RESET}\n" "$TOTAL_ONLY"
printf "TOTAL USED externally: %d\n" "$TOTAL_USED"
echo "Done."