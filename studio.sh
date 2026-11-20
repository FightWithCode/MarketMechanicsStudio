#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null; then
  export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
fi
if ! command -v node >/dev/null; then
  echo "Install Node.js 22 or later." >&2
  exit 1
fi
if [[ ! -d node_modules ]]; then
  echo "Run npm ci to install the studio dependencies." >&2
  exit 1
fi
env_options=()
if [[ -f .env ]]; then env_options+=(--env-file=.env); fi
if [[ "${1:-}" == serve || $# -eq 0 ]]; then
  exec node "${env_options[@]}" node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173
fi
exec node "${env_options[@]}" studio/cli.mjs "$@"
