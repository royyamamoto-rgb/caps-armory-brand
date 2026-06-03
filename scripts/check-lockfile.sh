#!/usr/bin/env bash
set -euo pipefail
if grep -E '"\^|"~' package.json; then
  echo "ERROR: package.json contains floating version specifiers"
  exit 1
fi
echo "Lockfile + exact-version check OK"
