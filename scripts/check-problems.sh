#!/usr/bin/env bash
# check-problems.sh
# 校验公开文件不含禁止词（精确年龄、真实姓名 token）。
# 用法：bash scripts/check-problems.sh
# 命中即以非零退出码阻断发布。

FAIL=0

check_file() {
  local file="$1"
  local word="$2"
  if [ -f "$file" ] && grep -q "$word" "$file" 2>/dev/null; then
    echo "FAIL: found banned word [$word] in $file"
    FAIL=1
  fi
}

TARGETS=("problems-data.js" "api/principles.json" "llms.txt")
BANNED=("十二岁" "六岁" "12岁" "6岁")

for file in "${TARGETS[@]}"; do
  for word in "${BANNED[@]}"; do
    check_file "$file" "$word"
  done
done

if [ "$FAIL" -eq 0 ]; then
  echo "OK: all public files passed — no banned words found."
fi

exit "$FAIL"
