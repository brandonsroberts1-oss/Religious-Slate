#!/usr/bin/env bash
# Subsets the bundled TTFs to the characters a plaque actually engraves:
# Latin-1 + Latin Extended-A, curly quotes, dashes, and the punctuation used by
# scripture references. Cuts the bundle from ~13 MB to ~3 MB without changing a
# single outline we render.
#
# Run after tools/fetch-fonts.mjs. Requires: pip install fonttools
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../assets/fonts" && pwd)"

# U+0020–U+00FF  basic latin + latin-1 supplement
# U+0100–U+017F  latin extended-A (accented names for personalisation)
# U+2010–U+2027  hyphens, dashes, quotes, ellipsis
# U+2030–U+205E  dagger, bullet, prime
# U+20A0–U+20BF  currency
# U+2122 ™  U+00A9 ©  U+2020 †  U+271D ✝
UNICODES="U+0020-00FF,U+0100-017F,U+02BC,U+2010-2027,U+2030-205E,U+20A0-20BF,U+2122,U+2212,U+271D,U+2020-2021"

total_before=0
total_after=0

for f in "$DIR"/*.ttf; do
  before=$(stat -c%s "$f")
  pyftsubset "$f" \
    --unicodes="$UNICODES" \
    --layout-features='kern,liga,calt,onum,lnum,smcp,c2sc,frac,dlig' \
    --no-hinting \
    --desubroutinize \
    --name-IDs='*' \
    --output-file="$f.subset" 2>/dev/null
  mv "$f.subset" "$f"
  after=$(stat -c%s "$f")
  total_before=$((total_before + before))
  total_after=$((total_after + after))
  printf '%-34s %6s KB -> %5s KB\n' "$(basename "$f")" "$((before/1024))" "$((after/1024))"
done

printf '\nBundle: %s MB -> %s MB\n' \
  "$(echo "scale=1; $total_before/1048576" | bc)" \
  "$(echo "scale=1; $total_after/1048576" | bc)"
