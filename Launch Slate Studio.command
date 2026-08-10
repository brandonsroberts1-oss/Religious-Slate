#!/usr/bin/env bash
# Double-click this in Finder to open Slate Plaque Studio.
# macOS runs .command files in Terminal; the real work is in launch.sh.
cd "$(dirname "$0")" || exit 1
exec bash ./launch.sh "$@"
