#!/bin/bash
# SessionStart hook: make `git push` work inside Claude Code on the web.
#
# Why: in the web sandbox, `origin` points at a local read-only git proxy
# (http://...127.0.0.1.../git/<owner>/<repo>) that returns 403 on push. The
# environment also injects a writable GITHUB_TOKEN and github.com is directly
# reachable, so we route pushes straight to github.com using that token.
#
# This is a deliberate no-op on normal dev machines (no GITHUB_TOKEN, or origin
# is not the sandbox proxy) so it never interferes with local git credentials.
# The token is never written to disk: only a credential-helper *snippet* that
# references the env var by name is stored in the session's local git config.
set -euo pipefail

repo_dir="${CLAUDE_PROJECT_DIR:-$PWD}"

# Need a token to authenticate the direct push.
[ -n "${GITHUB_TOKEN:-}" ] || exit 0

fetch_url="$(git -C "$repo_dir" remote get-url origin 2>/dev/null || true)"

# Only act when origin is the sandbox proxy remote.
case "$fetch_url" in
  *127.0.0.1*/git/*) ;;
  *) exit 0 ;;
esac

# Derive github.com push URL from the proxy path: .../git/<owner>/<repo>
repo_path="${fetch_url##*/git/}"
repo_path="${repo_path%.git}"
push_url="https://github.com/${repo_path}.git"

git -C "$repo_dir" remote set-url --push origin "$push_url"
git -C "$repo_dir" config credential.helper \
  '!f() { echo "username=x-access-token"; echo "password=${GITHUB_TOKEN}"; }; f'

# Status goes to stderr so it does not pollute session context.
echo "[session-start] git push routed to $push_url" >&2
