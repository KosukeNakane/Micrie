#!/usr/bin/env zsh
# 死蔵 export を検出（named + default）
# 前提: zsh / ripgrep (rg) / fd がインストール済み
# 対象: src 配下の .ts / .tsx（.d.ts は除外）

set -euo pipefail
set -o pipefail

ROOT="../src"

# 色
RED=$'\033[31m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
RESET=$'\033[0m'

echo "Scan dead exports (named + default) start..."
echo

# ==== ユーティリティ ====

# 前後空白を削る
trim() { awk '{$1=$1;print}'; }

# { A as B, default as C } などを公開名に正規化（named 用）
normalize_symbols() {
  sed 's/[{}]//g' \
  | tr ',' '\n' \
  | while read -r line; do
      sym="$(echo "$line" | trim)"
      [ -z "$sym" ] && continue
      if echo "$sym" | rg -q '^\s*default\s+as\s+'; then
        echo "$sym" | awk '{print $3}'; continue
      fi
      if echo "$sym" | rg -q '\bas\b'; then
        echo "$sym" | awk '{print $3}'; continue
      fi
      echo "$sym" | awk '{print $1}'
    done \
  | rg -v '^\s*$' || true
}

# TypeScript の簡易リゾルバ（import 元 -> 実ファイル）
# - 相対パス: importer のディレクトリ基準
# - エイリアス "@/..." or "@foo/bar" 前提 → "@/" を src/ にマップ
# - 試行順: .ts, .tsx, /index.ts, /index.tsx
# - node_modules など裸モジュールは無視（解決不可）
resolve_module() {
  local importer="$1"   # 読み取り側ファイルの絶対パス
  local source="$2"     # import ソース文字列（quotes 無し想定）

  # 裸モジュール（node_modules）は対象外
  if [[ "$source" != .* && "$source" != /* && "$source" != @* ]]; then
    return 1
  fi

  local base=""
  if [[ "$source" == ./* || "$source" == ../* ]]; then
    local dir="$(dirname "$importer")"
    base="$(realpath "$dir/$source" 2>/dev/null || true)"
  elif [[ "$source" == @*/* ]]; then
    # FSD でよくあるエイリアスをサポート
    # 例: "@/foo/bar", "@app/..", "@entities/..." など
    local pfx rest
    pfx="${source%%/*}"        # 先頭の@xxx 部分（例: @app, @entities, @shared, @）
    rest="${source#*/}"        # スラッシュ以降

    case "$pfx" in
      @)           base="$(realpath "$ROOT/$rest" 2>/dev/null || true)" ;;
      @app)        base="$(realpath "$ROOT/app/$rest" 2>/dev/null || true)" ;;
      @entities)   base="$(realpath "$ROOT/entities/$rest" 2>/dev/null || true)" ;;
      @features)   base="$(realpath "$ROOT/features/$rest" 2>/dev/null || true)" ;;
      @pages)      base="$(realpath "$ROOT/pages/$rest" 2>/dev/null || true)" ;;
      @widgets)    base="$(realpath "$ROOT/widgets/$rest" 2>/dev/null || true)" ;;
      @shared)     base="$(realpath "$ROOT/shared/$rest" 2>/dev/null || true)" ;;
      *)           return 1 ;;  # 未知の @alias は対象外
    esac
  else
    # それ以外の絶対パスなどは対象外
    return 1
  fi

  [[ -z "${base:-}" ]] && return 1

  local candidates=(
    "$base.ts"
    "$base.tsx"
    "$base/index.ts"
    "$base/index.tsx"
  )

  for c in "${candidates[@]}"; do
    if [[ -f "$c" ]]; then
      echo "$c"
      return 0
    fi
  done

  return 1
}

# ==== 1) named import（利用側）収集 ====
typeset -A USED_NAMED   # USED_NAMED[Symbol]=1

while read -r f; do
  while read -r name; do
    [[ -z "${name:-}" ]] && continue
    USED_NAMED[$name]=1
  done < <(
    rg --no-heading -No --pcre2 \
       -e '^\s*import\s+(?:type\s*)?\{([^}]+)\}' \
       "$f" \
    | awk -F'{' '{print "{"$2}' \
    | normalize_symbols
  )
done < <(fd -a -e ts -e tsx . "$ROOT" --exclude '*.d.ts')

# ==== 2) default import（利用側）収集 ====
# default import は「import X from 'src'」「import X, {A} from 'src'」の X を
# 具体的なファイルに解決して、そのファイルの default export を使用済みにする。
typeset -A USED_DEFAULT_FILE # USED_DEFAULT_FILE[/abs/path/file.tsx]=1

while read -r f; do
  # import Default from '...';
  while read -r line; do
    defaultName="$(echo "$line" | sed -E 's/^\s*import\s+([A-Za-z0-9_$]+)\s+from\s+"([^"]+)".*$/\1/; s/^\s*import\s+([A-Za-z0-9_$]+)\s+from\s+\x27([^\x27]+)\x27.*$/\1/;')"
    src="$(echo "$line" | sed -E 's/.*from\s+"([^"]+)".*$/\1/; s/.*from\s+\x27([^\x27]+)\x27.*$/\1/;')"
    [[ -z "${src:-}" ]] && continue
    if resolved="$(resolve_module "$f" "$src")"; then
      USED_DEFAULT_FILE["$resolved"]=1
    fi
  done < <(rg --no-heading -No --pcre2 -e "^\s*import\s+([A-Za-z0-9_\$]+)\s+from\s+['\"][^'\"]+['\"]" "$f")

  # import Default, { A } from '...';
  while read -r line; do
    src="$(echo "$line" | sed -E 's/.*from\s+"([^"]+)".*$/\1/; s/.*from\s+\x27([^\x27]+)\x27.*$/\1/;')"
    [[ -z "${src:-}" ]] && continue
    if resolved="$(resolve_module "$f" "$src")"; then
      USED_DEFAULT_FILE["$resolved"]=1
    fi
  done < <(rg --no-heading -No --pcre2 -e "^\s*import\s+([A-Za-z0-9_\$]+)\s*,\s*\{[^}]+\}\s+from\s+['\"][^'\"]+['\"]" "$f")

  # re-export default: export { default as X } from '...'
  while read -r src; do
    [[ -z "${src:-}" ]] && continue
    if resolved="$(resolve_module "$f" "$src")"; then
      USED_DEFAULT_FILE["$resolved"]=1
    fi
  done < <(rg --no-heading -No --pcre2 -e "^\s*export\s*\{\s*default\s+as\s+[A-Za-z0-9_\$]+\s*\}\s*from\s+['\"][^'\"]+['\"]\s*;?" "$f")
done < <(fd -a -e ts -e tsx . "$ROOT" --exclude '*.d.ts')

# ==== 3) named export（提供側）収集 ====
typeset -A EXPORTED_NAMED_BY_FILE  # key: "Name|/abs/path"
typeset -A EXPORTED_NAMED_SEEN     # EXPORTED_NAMED_SEEN[Name]=1

while read -r f; do
  while read -r name; do
    [[ -z "${name:-}" ]] && continue
    key="${name}|${f}"
    EXPORTED_NAMED_BY_FILE[$key]=1
    EXPORTED_NAMED_SEEN[$name]=1
  done < <( rg --no-heading -No -r '$1' -e "export\s+\{([^}]+)\}\s+from\s+['\"][^'\"]+['\"]\s*;?" "$f" | normalize_symbols )

  while read -r name; do
    [[ -z "${name:-}" ]] && continue
    key="${name}|${f}"
    EXPORTED_NAMED_BY_FILE[$key]=1
    EXPORTED_NAMED_SEEN[$name]=1
  done < <( rg --no-heading -No -r '$1' -e '^\s*export\s+\{([^}]+)\}\s*;?\s*$' "$f" | normalize_symbols )

  while read -r name; do
    [[ -z "${name:-}" ]] && continue
    key="${name}|${f}"
    EXPORTED_NAMED_BY_FILE[$key]=1
    EXPORTED_NAMED_SEEN[$name]=1
  done < <( rg --no-heading -No --pcre2 -e '^\s*export\s+(?:declare\s+)?(?:const|let|var|function|class|enum|type|interface)\s+([A-Za-z0-9_]+)' "$f" )
done < <(fd -a -e ts -e tsx . "$ROOT" --exclude '*.d.ts')

# ==== 4) default export（提供側）収集 ====
typeset -A DEFAULT_EXPORT_FILE # DEFAULT_EXPORT_FILE[/abs/path]=1

while read -r f; do
  if rg -q --no-heading --pcre2 '^\s*export\s+default\b' "$f"; then
    DEFAULT_EXPORT_FILE["$f"]=1
  fi
done < <(fd -a -e ts -e tsx . "$ROOT" --exclude '*.d.ts')

# ==== 5) 死蔵 named export 判定 ====
typeset -A DEAD_NAMED_BY_FILE
typeset -i DEAD_NAMED_COUNT=0
typeset -i LIVE_NAMED_COUNT=0

for k in "${(@k)EXPORTED_NAMED_BY_FILE}"; do
  name="${k%%|*}"
  file="${k#*|}"
  if [[ -n "${USED_NAMED[$name]-}" ]]; then
    (( LIVE_NAMED_COUNT++ ))
  else
    DEAD_NAMED_BY_FILE[$file]="${DEAD_NAMED_BY_FILE[$file]:-} ${name}"
    (( DEAD_NAMED_COUNT++ ))
  fi
done

# ==== 6) 死蔵 default export 判定 ====
typeset -i DEAD_DEFAULT_COUNT=0
typeset -i LIVE_DEFAULT_COUNT=0
typeset -A DEAD_DEFAULT_BY_FILE

for f in "${(@k)DEFAULT_EXPORT_FILE}"; do
  if [[ -n "${USED_DEFAULT_FILE[$f]-}" ]]; then
    (( LIVE_DEFAULT_COUNT++ ))
  else
    DEAD_DEFAULT_BY_FILE[$f]=1
    (( DEAD_DEFAULT_COUNT++ ))
  fi
done

# ==== 7) 結果表示 ====
# --- dead named ---
if (( DEAD_NAMED_COUNT == 0 )); then
  echo "${GREEN}No dead named exports found.${RESET}"
else
  echo "${RED}Dead named exports (not imported anywhere):${RESET}"
  echo
  for f in "${(@k)DEAD_NAMED_BY_FILE}"; do
    rel="$(realpath "$f" --relative-to="$ROOT" 2>/dev/null || echo "$f")"
    echo "  $rel"
    for n in ${(z)DEAD_NAMED_BY_FILE[$f]}; do
      printf "    - ${RED}%s${RESET}\n" "$n"
    done
  done
fi

echo

# --- dead default ---
if (( DEAD_DEFAULT_COUNT == 0 )); then
  echo "${GREEN}No dead default exports found.${RESET}"
else
  echo "${RED}Dead default exports (their files have export default but no one imports default from them):${RESET}"
  echo
  for f in "${(@k)DEAD_DEFAULT_BY_FILE}"; do
    rel="$(realpath "$f" --relative-to="$ROOT" 2>/dev/null || echo "$f")"
    printf "  ${RED}%s${RESET}\n" "$rel"
  done
fi

echo
echo "----------------------------------------"
printf "TOTAL Dead named exports:   ${RED}%d${RESET}\n" "$DEAD_NAMED_COUNT"
printf "TOTAL Live named exports:        %d\n" "$LIVE_NAMED_COUNT"
printf "TOTAL Dead default exports: ${RED}%d${RESET}\n" "$DEAD_DEFAULT_COUNT"
printf "TOTAL Live default exports:      %d\n" "$LIVE_DEFAULT_COUNT"
echo "Done."