#!/usr/bin/env bash
# Slate Plaque Studio — launcher for macOS and Linux.
#
# Double-click "Launch Slate Studio.command" on a Mac, or run this directly.
# Closing the window stops the studio.

cd "$(dirname "$0")" || exit 1

REQUIRED_MAJOR=18

# A shell started from Finder or a desktop launcher does not always inherit the
# PATH a terminal has, and version managers install well outside the usual
# places — so look before giving up on Node being missing.
find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return
  fi

  local candidate
  for candidate in \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    /usr/bin/node \
    /snap/bin/node \
    "$HOME/.volta/bin/node"
  do
    [ -x "$candidate" ] && { printf '%s\n' "$candidate"; return; }
  done

  # nvm / fnm keep one directory per installed version; take the newest.
  candidate=$(ls -d "$HOME"/.nvm/versions/node/*/bin/node \
                    "$HOME"/.local/share/fnm/node-versions/*/installation/bin/node \
                    2>/dev/null | sort -V | tail -1)
  [ -n "$candidate" ] && [ -x "$candidate" ] && printf '%s\n' "$candidate"
}

NODE=$(find_node)

if [ -z "$NODE" ]; then
  cat <<'MESSAGE'

  Slate Plaque Studio needs Node.js, which does not appear to be installed.

  Install the LTS build from  https://nodejs.org
  then double-click this launcher again.

MESSAGE
  read -r -p "  Press Return to close. " _
  exit 1
fi

MAJOR=$("$NODE" -p "process.versions.node.split('.')[0]" 2>/dev/null)
if [ -z "$MAJOR" ] || [ "$MAJOR" -lt "$REQUIRED_MAJOR" ]; then
  printf '\n  Node.js %s or newer is required (found %s).\n' \
    "$REQUIRED_MAJOR" "$("$NODE" -v 2>/dev/null || echo unknown)"
  printf '  Update it at https://nodejs.org and try again.\n\n'
  read -r -p "  Press Return to close. " _
  exit 1
fi

exec "$NODE" tools/launch.mjs "$@"
