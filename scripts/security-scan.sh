#!/bin/bash
set -euo pipefail

# Scan only tracked non-doc files for common secret patterns.
PATTERN='AIza[[:alnum:]_-]{20,}|-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----|client_secret|private_key'
FILES=$(git ls-files | grep -Ev '\.md$|\.example$|^scripts/security-scan\.sh$')

if [ -n "$FILES" ] && echo "$FILES" | xargs grep -nE "$PATTERN" 2>/dev/null; then
  echo ""
  echo "Secret scan failed: suspicious values found in tracked files."
  exit 1
fi

echo "Secret scan passed: no high-risk patterns found in tracked files."
