# Product line

How the eight collections, four sizes and 232 verses combine into something
sellable — and, more usefully, how to keep that from becoming an unmanageable
catalogue.

---

## The shape of the range

Eight collections × 232 verses × five sizes is roughly 9,000 combinations. That
is a made-to-order catalogue, not a product line. The line is the **eight
collections**; the verse is a choice the buyer makes inside one.

Structure listings that way:

- One listing per **collection × size**, priced by size — around 30 live
  listings rather than thousands.
- The verse is a dropdown on the listing, with the collection's curated set as
  the options.
- Personalisation (name, date, footer) is a text field with a small upcharge.

That keeps photography, copy and SEO manageable, and it means adding a verse is
a dropdown entry rather than a new listing.

---

## Collections

| id | Collection | Occasion | Verses | Lead sizes |
|---|---|---|---|---|
| `household` | The Household Collection | Housewarming, entryway, family | 24 | 8 × 11.75″, 6 × 8″ |
| `covenant` | The Covenant Collection | Wedding, anniversary, engagement | 23 | 5 × 7″, 6 × 8″ |
| `sentinel` | The Sentinel Collection | Courage, service, recovery | 28 | 6 × 8″, 8 × 11.75″ |
| `grace` | The Grace Collection | Sympathy, memorial, comfort | 55 | 5 × 7″, 6 × 8″ |
| `cornerstone` | The Cornerstone Collection | Office, workshop, corporate | 27 | 6 × 8″, 8 × 8″ |
| `table` | The Table Collection | Kitchen, dining, hospitality | 21 | 12 × 8″, coaster |
| `nursery` | The Nursery Collection | Birth, baptism, dedication | 13 | 5 × 7″, 4 × 6″ |
| `pilgrim` | The Pilgrim Collection | Faith, guidance, graduation | 41 | 8 × 11.75″, 12 × 16″ |

Each collection's typographic recipe lives in `assets/js/presets.js`; the blurb
there is written to be usable as listing copy.

### Why they are distinct

The collections are not colour swaps. They differ in the things a buyer
notices before they read anything: **Sentinel** is condensed capitals with a
2.4 mm border and reads across a room; **Grace** has no box at all, because a
heavy border is wrong on a sympathy gift; **Cornerstone** frames the whole
board, which is what makes it read as signage rather than décor; **Pilgrim** is
Roman inscriptional capitals and is slow to read on purpose.

If a collection cannot be told apart from another in a thumbnail, it should not
be a separate line.

---

## Sizes and price ladder

Slate blanks are cheap and engraving time barely moves with size — the price
ladder is about perceived value and shelf position, not cost.

| SKU size | mm | Position | Suggested retail |
|---|---|---|---|
| 4 × 4″ | 101.6 × 101.6 | Coaster, add-on, set of four | $12–18 (or $38–48 / set of 4) |
| 4 × 6″ | 101.6 × 152.4 | Small gift, nursery | $22–28 |
| 5 × 7″ | 127 × 177.8 | The gift size — wedding, sympathy | $28–38 |
| 6 × 8″ | 152.4 × 203.2 | Mid | $38–48 |
| 8 × 11.75″ | 203.2 × 298.45 | **Signature** — the reference plaque | $52–68 |
| 8 × 8″ | 203.2 × 203.2 | Square, office | $45–55 |
| 12 × 8″ | 304.8 × 203.2 | Landscape, kitchen | $58–72 |
| 12 × 16″ | 304.8 × 406.4 | Statement, commission | $95–130 |
| 4 × 12″ | 101.6 × 304.8 | Address bar, door panel | $34–44 |

Add roughly $8–12 for personalisation (the eyebrow or footer line) and $10–15
for a stand or easel.

The 5 × 7″ is likely the volume seller — it is the price point people reach for
without deliberating when they need a wedding or sympathy gift. The 8 × 11.75″
is the one that makes the brand look serious in photographs.

### SKU scheme

The exporter already names files this way:

```
Luke-10-5_PEACE_203x298mm.svg
└ reference  └ subject  └ board
```

A retail SKU that mirrors it stays legible on a packing slip:

```
SPS-HOU-0811-LUK1005-PEACE
    │   │    │        └ subject word
    │   │    └ reference
    │   └ size code
    └ collection
```

---

## Verse selection, by what actually sells

The library is weighted towards the occasions people buy gifts for, not towards
theological coverage:

- **Sympathy and comfort** is the largest set (55). It is the occasion where
  someone needs a gift on a deadline and cares most about getting the words
  right.
- **Weddings** (23) carry the highest personalisation attach rate — names and
  dates — which is where the margin is.
- **Housewarming** (24) is the seasonal spike: spring and late summer.
- **Corporate and workshop** (27) is the highest-value channel. A run of thirty
  Cornerstone plaques for a company's service awards is one conversation, one
  batch export, and one afternoon at the machine.

Every verse carries alternative subject words. The same Joshua 24:15 plaque
sells as HOUSEHOLD, SERVE, CHOSEN or OUR HOUSE — four listings' worth of visual
variety from one design and one dropdown.

---

## Production

For an order of more than a few pieces, work in batches rather than one at a
time:

1. Set the collection, board size and any house adjustments once.
2. `Batch…` → choose the collection or the current filter → **Auto-fit** on.
3. One `.zip`, one SVG per verse, each filename carrying reference, subject and
   size.
4. Import the whole folder into xTool Creative Space as separate projects.

Auto-fit matters here: a batch spanning "God is love" and "Come unto me, all ye
that labour and are heavy laden" cannot share a font size, and without it the
long ones quietly run past the margins.

**Proof before the first cut of a new design.** Switch on `Flat view` and check
the hairlines; anything under about 0.4 mm may not survive on slate. Then run
one board before committing the batch.

---

## Photography

The renders in `marketing/` are accurate — they are generated from the same
geometry the laser receives — but they are renderings, and most marketplaces
require the primary listing image to show the actual item.

Use them for design proofs, the dropdown thumbnails that show a verse in
context, social posts, and the collection line-up graphic. Photograph real
stock for the hero image. Slate photographs best with soft side light at a
shallow angle: the engraving is a texture, not a colour, and flat frontal light
makes it disappear.

To regenerate the renders after a styling change:

```bash
node tools/serve.mjs &
node tools/render-marketing.mjs
```

The renderer refuses to write an image for any plaque the app would flag with a
layout warning, so the marketing folder cannot drift out of sync with what the
product can actually do.
