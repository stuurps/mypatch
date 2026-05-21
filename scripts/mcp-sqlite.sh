#!/bin/bash
DB=$(find "$HOME/Library/Developer/CoreSimulator/Devices" -name "patch.db" 2>/dev/null | head -1)
if [ -z "$DB" ]; then
  echo "patch.db not found — open the Patch app in a simulator first" >&2
  exit 1
fi
exec npx -y @modelcontextprotocol/server-sqlite "$DB"
