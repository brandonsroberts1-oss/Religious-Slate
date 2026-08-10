# Licensing

This project is meant to produce goods you sell, so everything bundled was
chosen to be free of restrictions on commercial use. This page records what is
in here and where the real limits are.

None of this is legal advice; it is a record of the licences the assets ship
under so you can check them yourself.

---

## Verse text — public domain

Two translations ship with the app:

| Translation | Status |
|---|---|
| **King James Version (1769 Blayney edition)** | Public domain worldwide |
| **World English Bible (WEB)** | Public domain — explicitly dedicated by its editors |

Both can be engraved, printed, sold, and modified with no permission, no
attribution, and no royalty.

> **The KJV in the United Kingdom.** The KJV is under perpetual Crown copyright
> in the UK, administered by Cambridge University Press under letters patent.
> In practice this is not enforced against ordinary reproduction, and it has no
> effect in the US or most other countries. If you are selling into the UK at
> scale and want certainty, the WEB has no such encumbrance — the translation
> toggle is right there in the toolbar.

### Modern translations are not free

Do not swap in NIV, ESV, NLT, NASB, CSB, MSG or similar. These are commercially
licensed, and the standard fair-use style allowances their publishers grant
("up to 500 verses in non-saleable media") **specifically exclude merchandise**.
Putting an ESV verse on a plaque you sell needs a written licence from Crossway;
NIV needs one from Biblica/Zondervan. Both are obtainable and both cost money.

The verse library is deliberately KJV/WEB-only for this reason. If you add a
licensed translation to `tools/verses.source.mjs`, that is your licence to
obtain and your risk to carry.

### Excerpting

Most plaque texts are excerpts — "Peace be to this house" is the closing clause
of Luke 10:5, not the whole verse. The build tool guarantees each excerpt is a
*verbatim contiguous span* of the source verse, so nothing is paraphrased or
recombined, but an excerpt is still an excerpt. `verses.js` carries an
`excerpt: true` flag and the full verse text for both translations, if you want
to surface that in a listing.

---

## Fonts — OFL 1.1 and Apache 2.0

27 families, 81 static faces, all from Google Fonts.

**SIL Open Font License 1.1** covers all but one family. The OFL permits
commercial use, embedding, modification and redistribution. Its two real
conditions:

- **You may not sell the font files on their own.** Selling engraved products
  made with them is fine; selling a font bundle is not.
- **A Reserved Font Name may not be reused on a modified version.** The subset
  in `assets/fonts` is a subset, not a modification of the outlines, and keeps
  the original names — which is within the licence. If you were to *redraw*
  glyphs, you would need to rename.

The OFL does **not** require you to credit the fonts in your listings or on the
product.

**Apache 2.0** covers Archivo Black, Inter, Roboto Mono and IBM Plex Mono
(Plex is OFL as of its Google Fonts release; both licences permit commercial use
without attribution on the product).

### The bundled families

*Serif* — EB Garamond, Cormorant Garamond, Cormorant Infant, Playfair Display,
Libre Baskerville, Lora, Crimson Pro, Spectral, Cardo
*Inscriptional* — Cinzel, Cinzel Decorative, Marcellus, Forum
*Sans* — Montserrat, Inter, Archivo Black, Anton, Oswald, Bebas Neue,
Barlow Condensed, League Spartan
*Mono* — JetBrains Mono, Roboto Mono, Space Mono, IBM Plex Mono
*Script* — Great Vibes, Parisienne

Each family's full licence text is available from its Google Fonts page. If you
redistribute this repository, keeping the upstream `OFL.txt` alongside the font
files is the courteous and safest thing to do.

> **Forum** is included as a free stand-in for Trajan-style lettering. Trajan
> itself is an Adobe font and is *not* licensed for this kind of use without a
> suitable Adobe plan — do not substitute it because it looks closer.

---

## Code

| Component | Licence |
|---|---|
| `vendor/opentype.min.js` | MIT — see `vendor/opentype.js-LICENSE.txt` |
| `es-kjv`, `world-english-bible` | MIT (the packaging; the text itself is public domain). Dev-only — used by the verse build, never shipped |
| This project's own code | Yours |

---

## What you are actually selling

The output of this app is your own typographic arrangement of public-domain
text, set in fonts you are licensed to use commercially. You own the
arrangement. Nobody has a claim on the plaques you make.

Two things worth keeping straight:

- **The images in `marketing/` are renderings, not photographs.** They are
  generated from the same geometry the laser receives, so they are accurate
  representations of the product — but they are synthetic. Marketplaces
  increasingly require that listing images show the actual item. Use these for
  design proofs, social posts and mockups, and photograph real stock for the
  primary listing image.

- **Personalisation is customer content.** A name or date a buyer supplies is
  theirs. If you feature a personalised piece in your own marketing, get their
  say-so first. The names in the sample renders are invented.
