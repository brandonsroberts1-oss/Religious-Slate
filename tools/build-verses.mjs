#!/usr/bin/env node
/**
 * Verifies tools/verses.source.mjs against the real biblical text and emits
 * assets/js/verses.js.
 *
 * Two public-domain corpora are used as the source of truth:
 *   KJV  — npm `es-kjv`               (1769 Blayney edition)
 *   WEB  — npm `world-english-bible`  (World English Bible)
 *
 * For every entry the tool:
 *   1. resolves the reference in both translations,
 *   2. asserts the plaque excerpt is a verbatim, contiguous span of the KJV
 *      verse (ignoring the KJV's [supplied-word] brackets and letter case),
 *   3. derives the matching WEB excerpt by aligning the two translations word
 *      by word, so the modern-English variant is taken from the actual WEB
 *      text rather than paraphrased,
 *   4. writes both excerpts plus the full verses into the shipped data file.
 *
 * Any excerpt that cannot be located fails the build. Nothing reaches a
 * customer's plaque on the strength of somebody's memory.
 *
 * Corpora are dev-only (~20 MB) and are not committed. Fetch them with:
 *   npm pack es-kjv && npm pack world-english-bible
 * then extract into tools/.corpora/{kjv,web}/ — or set CORPORA_DIR.
 *
 *   node tools/build-verses.mjs [--report]
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import SOURCE from './verses.source.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CORPORA = process.env.CORPORA_DIR || path.join(ROOT, 'tools', '.corpora');
const REPORT = process.argv.includes('--report');

// es-kjv spells a few books its own way.
const KJV_BOOK_ALIASES = {
  Psalm: 'Psalms',
  'Song of Solomon': "Solomon's Song",
  'Song of Songs': "Solomon's Song",
};

const WEB_FILE_ALIASES = {
  Psalm: 'psalms',
  'Song of Solomon': 'songofsolomon',
  'Song of Songs': 'songofsolomon',
};

const parseRef = (ref) => {
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`unparseable reference: ${ref}`);
  return { book: m[1], chapter: +m[2], from: +m[3], to: m[4] ? +m[4] : +m[3] };
};

/** Collapse whitespace and fold typographic characters to their ASCII form. */
const normalize = (s) =>
  s
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

/** KJV prints words with no Hebrew/Greek equivalent in brackets: "[be]". */
const stripBrackets = (s) => normalize(s.replace(/[[\]]/g, ''));

const words = (s) => normalize(s).split(' ').filter(Boolean);
const bare = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');

async function loadKjv() {
  const file = path.join(CORPORA, 'kjv', 'json', 'verses-1769.js');
  const raw = await readFile(file, 'utf8');
  return JSON.parse(raw.replace(/^export default\s*/, '').trim().replace(/;$/, ''));
}

const webCache = new Map();
async function loadWebBook(book) {
  const name = WEB_FILE_ALIASES[book] || book.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (webCache.has(name)) return webCache.get(name);
  const raw = JSON.parse(await readFile(path.join(CORPORA, 'web', 'json', `${name}.json`), 'utf8'));
  const map = new Map();
  for (const node of raw) {
    if (typeof node.verseNumber !== 'number' || typeof node.value !== 'string') continue;
    const key = `${node.chapterNumber}:${node.verseNumber}`;
    map.set(key, ((map.get(key) || '') + ' ' + node.value).trim());
  }
  webCache.set(name, map);
  return map;
}

function kjvVerse(kjv, { book, chapter, from, to }) {
  const name = KJV_BOOK_ALIASES[book] || book;
  const parts = [];
  for (let v = from; v <= to; v++) {
    const text = kjv[`${name} ${chapter}:${v}`];
    if (!text) throw new Error(`KJV missing ${name} ${chapter}:${v}`);
    parts.push(text);
  }
  return stripBrackets(parts.join(' '));
}

async function webVerse({ book, chapter, from, to }) {
  const map = await loadWebBook(book);
  const parts = [];
  for (let v = from; v <= to; v++) {
    const text = map.get(`${chapter}:${v}`);
    if (!text) throw new Error(`WEB missing ${book} ${chapter}:${v}`);
    parts.push(text);
  }
  return normalize(parts.join(' '));
}

/**
 * Locate `excerpt` inside `verse` as a run of whole words, case-insensitively
 * and ignoring trailing punctuation on the final word (an excerpt legitimately
 * drops the verse's colon or semicolon). Returns the word span, or null.
 */
function findSpan(verseWords, excerptWords) {
  const v = verseWords.map(bare);
  const e = excerptWords.map(bare);
  outer: for (let i = 0; i + e.length <= v.length; i++) {
    for (let j = 0; j < e.length; j++) if (v[i + j] !== e[j]) continue outer;
    return [i, i + e.length];
  }
  return null;
}

/** Longest common subsequence over two word arrays -> index pairs. */
function alignWords(a, b) {
  const A = a.map(bare);
  const B = b.map(bare);
  const dp = Array.from({ length: A.length + 1 }, () => new Uint32Array(B.length + 1));
  for (let i = A.length - 1; i >= 0; i--) {
    for (let j = B.length - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) pairs.push([i++, j++]);
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/** Length of the longest common subsequence of two word arrays. */
function lcsLength(A, B) {
  let prev = new Uint32Array(B.length + 1);
  let cur = new Uint32Array(B.length + 1);
  for (let i = A.length - 1; i >= 0; i--) {
    for (let j = B.length - 1; j >= 0; j--) {
      cur[j] = A[i] === B[j] ? prev[j + 1] + 1 : Math.max(prev[j], cur[j + 1]);
    }
    [prev, cur] = [cur, prev];
    cur.fill(0);
  }
  return prev[0];
}

/**
 * Find the window of WEB text that best corresponds to the KJV excerpt.
 *
 * A whole-verse LCS is not enough on its own: WEB sometimes reorders clauses
 * (Isaiah 30:21 moves the "when you turn" clause to the front), which strands
 * the excerpt outside the alignment. Scoring every plausible window locally is
 * order-independent and the verses are short enough that the cost is trivial.
 */
function bestWebWindow(webWords, excerptWords) {
  const E = excerptWords.map(bare);
  const W = webWords.map(bare);
  const n = E.length;
  const min = Math.max(1, Math.floor(n * 0.5));
  const max = Math.min(W.length, Math.ceil(n * 2));

  let best = null;
  for (let len = min; len <= max; len++) {
    for (let i = 0; i + len <= W.length; i++) {
      const score = lcsLength(E, W.slice(i, i + len)) / Math.max(n, len);
      if (!best || score > best.score) best = { score, span: [i, i + len] };
    }
  }
  return best && best.score >= 0.5 ? best.span : null;
}

/**
 * Project a KJV word span onto the WEB text.
 *
 * The span is bounded by its *neighbours*, not by its own matching words:
 * everything after the last WEB word claimed by the KJV text before the
 * excerpt, up to the first WEB word claimed by the KJV text after it. Scoring
 * the excerpt's own window directly would silently drop exactly the words the
 * two translations render differently — "Charity never faileth" would come back
 * as "Never" once WEB's "Love" failed to match, and "The LORD bless thee" as
 * "Bless you" once "Yahweh" did.
 */
function projectSpan(kjvWords, webWords, [from, to]) {
  const excerpt = kjvWords.slice(from, to);
  const pairs = alignWords(kjvWords, webWords);

  let left = -1;
  let right = webWords.length;
  for (const [k, w] of pairs) {
    if (k < from) left = Math.max(left, w);
    else if (k >= to) { right = Math.min(right, w); break; }
  }

  const anchored = [left + 1, right];
  const length = anchored[1] - anchored[0];
  // Reordered clauses (Isaiah 30:21) can strand the excerpt and blow the span
  // wide open; fall back to a local search when that happens.
  if (length > 0 && length <= Math.max(4, excerpt.length * 2.2)) return anchored;

  return bestWebWindow(webWords, excerpt);
}

/**
 * Trim punctuation that only made sense inside the full verse. Quotation marks
 * and the closing full stop are dropped: a plaque sets the line as a statement,
 * not as a sentence lifted out of a paragraph. Internal punctuation stays.
 */
const tidy = (s) =>
  s
    .replace(/^[\s,;:.!?"'‘’“”]+/, '')
    .replace(/[\s,;:."'‘’“”]+$/, '')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/["“”]/g, '')
    .trim();

/**
 * The right-hand anchor can overshoot into the next sentence when the word
 * following the excerpt aligns loosely (Revelation 21:4 picks up a dangling
 * "Death will"). Consider every prefix that ends on a sentence boundary and
 * keep whichever length sits closest to the KJV excerpt — a trim only, never a
 * stretch, so genuinely multi-sentence excerpts survive intact.
 */
function trimToSentence(webText, targetWords) {
  const len = (s) => words(s).length;
  if (len(webText) <= targetWords * 1.25) return webText;

  const candidates = [webText];
  const re = /[.!?](?=\s)/g;
  let m;
  while ((m = re.exec(webText))) candidates.push(webText.slice(0, m.index + 1));

  return candidates
    .filter((c) => len(c) >= targetWords * 0.7)
    .sort((a, b) => Math.abs(len(a) - targetWords) - Math.abs(len(b) - targetWords))[0] || webText;
}

/**
 * Guard rail on the derived WEB excerpt. Aligning two translations is a
 * heuristic, and its failures are recognisable: a fragment that ends on a
 * conjunction or auxiliary, or a span wildly out of proportion with the KJV
 * excerpt. Anything that trips this must be pinned by hand in the source with
 * a `web:` override rather than shipped on a guess.
 */
// Words that cannot end an English clause. Object pronouns are deliberately
// absent — "he first loved us" and "I will be with you" are correct endings.
const DANGLING = new Set([
  'and', 'or', 'but', 'nor', 'so', 'yet', 'than', 'as', 'that', 'which', 'who', 'whom', 'whose',
  'the', 'a', 'an', 'of', 'to', 'into', 'unto', 'with', 'from', 'by', 'at', 'for', 'upon',
  'will', 'shall', 'would', 'could', 'should', 'may', 'might', 'must',
  "don't", "doesn't", "didn't", "won't", 'let', 'also', 'then', 'when', 'while', 'because',
  'your', 'my', 'his', 'her', 'their', 'our', 'its', 'every', 'this', 'these', 'those',
]);

function suspicious(webText, targetWords) {
  const w = words(webText);
  const last = bare(w[w.length - 1]);
  if (DANGLING.has(last)) return `ends on "${w[w.length - 1]}"`;
  if (w.length > targetWords * 1.35) return `${w.length} words vs ${targetWords}`;
  if (w.length < targetWords * 0.7) return `only ${w.length} words vs ${targetWords}`;
  return null;
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  try {
    await access(path.join(CORPORA, 'kjv', 'json', 'verses-1769.js'));
  } catch {
    console.error(
      `Corpora not found at ${CORPORA}.\n` +
        'Run:  npm pack es-kjv && npm pack world-english-bible\n' +
        `then extract them to ${CORPORA}/kjv and ${CORPORA}/web.`,
    );
    process.exit(2);
  }

  const kjv = await loadKjv();
  const out = [];
  const failures = [];
  const seen = new Set();

  for (const entry of SOURCE) {
    const parsed = parseRef(entry.ref);
    const id = slugify(entry.alias ? `${entry.ref}-${entry.alias}` : entry.ref);
    if (seen.has(id)) failures.push({ ref: entry.ref, why: `duplicate id "${id}" — add an alias` });
    seen.add(id);

    let kjvFull;
    let webFull;
    try {
      kjvFull = kjvVerse(kjv, parsed);
      webFull = await webVerse(parsed);
    } catch (err) {
      failures.push({ ref: entry.ref, why: err.message });
      continue;
    }

    const kjvWords = words(kjvFull);
    const excerptWords = words(entry.text);
    const span = findSpan(kjvWords, excerptWords);

    if (!span) {
      failures.push({ ref: entry.ref, why: 'excerpt is not a verbatim span of the KJV verse', excerpt: entry.text, kjv: kjvFull });
      continue;
    }

    // Re-cut the excerpt from the corpus so its inner punctuation is authentic,
    // while keeping the author's opening capital.
    const cut = tidy(kjvWords.slice(span[0], span[1]).join(' '));
    const kjvText = cut.charAt(0).toUpperCase() + cut.slice(1);

    const webWords = words(webFull);
    const webSpan = projectSpan(kjvWords, webWords, span);
    let webText = null;
    if (entry.web) {
      // Hand-authored WEB excerpt — held to the same standard as the KJV one.
      if (!findSpan(words(webFull), words(entry.web))) {
        failures.push({ ref: entry.ref, why: 'web override is not a verbatim span of the WEB verse', excerpt: entry.web, web: webFull });
      } else {
        webText = tidy(entry.web);
        webText = webText.charAt(0).toUpperCase() + webText.slice(1);
      }
    } else if (webSpan) {
      const w = tidy(trimToSentence(webWords.slice(webSpan[0], webSpan[1]).join(' '), excerptWords.length));
      if (w) webText = w.charAt(0).toUpperCase() + w.slice(1);
    }

    if (!webText) {
      failures.push({ ref: entry.ref, why: 'could not project excerpt onto WEB', kjv: kjvText, web: webFull });
    } else if (!entry.web) {
      const suspect = suspicious(webText, excerptWords.length);
      if (suspect) {
        failures.push({
          ref: entry.ref,
          why: `derived WEB excerpt looks wrong (${suspect}) — add a \`web:\` override`,
          excerpt: `derived: ${webText}`,
          kjv: kjvText,
          web: webFull,
        });
      }
    }

    if (REPORT && webText && bare(webText) !== bare(kjvText)) {
      console.log(`\n${entry.ref}\n  KJV  ${kjvText}\n  WEB  ${webText}`);
    }

    out.push({
      id,
      ref: entry.ref,
      book: parsed.book,
      text: kjvText,
      web: webText,
      word: entry.word,
      alts: entry.alts || [],
      tags: entry.tags || [],
      set: entry.set,
      excerpt: bare(kjvText) !== bare(kjvFull),
      full: { kjv: kjvFull, web: webFull },
    });
  }

  if (failures.length) {
    console.error(`\n${failures.length} verse(s) failed verification:\n`);
    for (const f of failures) {
      console.error(`✗ ${f.ref} — ${f.why}`);
      if (f.excerpt) console.error(`    wanted: ${f.excerpt}`);
      if (f.kjv) console.error(`    KJV:    ${f.kjv}`);
      if (f.web) console.error(`    WEB:    ${f.web}`);
    }
    process.exit(1);
  }

  const banner = `/**
 * Verse library — ${out.length} verses.
 *
 * GENERATED FILE. Edit tools/verses.source.mjs and run:
 *   node tools/build-verses.mjs
 *
 * Every excerpt below was verified as a verbatim span of its source verse.
 * Texts are King James Version (1769) and World English Bible — both public
 * domain worldwide, which is why they are safe to sell engraved on a product.
 * See docs/LICENSING.md before substituting any modern translation.
 */
`;

  await writeFile(
    path.join(ROOT, 'assets', 'js', 'verses.js'),
    `${banner}export const VERSES = ${JSON.stringify(out, null, 2)};\n\nexport default VERSES;\n`,
  );

  const bySet = out.reduce((acc, v) => ((acc[v.set] = (acc[v.set] || 0) + 1), acc), {});
  console.log(`✓ ${out.length} verses verified`);
  console.log(
    Object.entries(bySet)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `    ${k.padEnd(12)} ${n}`)
      .join('\n'),
  );
  console.log(`  differs from KJV in WEB: ${out.filter((v) => bare(v.web) !== bare(v.text)).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
