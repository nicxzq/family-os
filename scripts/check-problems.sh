#!/usr/bin/env bash
# check-problems.sh
# 校验 problems-data.js 的 public 字段不含禁止词。
# 用法：bash scripts/check-problems.sh
# 命中即以非零退出码阻断发布。

FILE="${1:-problems-data.js}"
FAIL=0

check() {
  local word="$1"
  if grep -q "$word" "$FILE" 2>/dev/null; then
    echo "FAIL: found banned word [$word] in $FILE — check public fields for ages or names."
    FAIL=1
  fi
}

check "十二岁"
check "六岁"
check "12岁"
check "6岁"

if [ "$FAIL" -eq 0 ]; then
  echo "OK: $FILE passed — no banned words found."
fi

exit "$FAIL"
