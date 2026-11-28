# Page patterns

What the two existing calculator pages do, so a third does not invent a third way.

---

## 1. The three-layer split

| Layer | Lives in | Rule |
|:---|:---|:---|
| **Math** | `site/src/odds.ts` (or a new sibling) | Pure functions, **no imports**. A `check:*` script asserts against it. |
| **Chrome** | `site/src/components/CalcUi.tsx` | `Panel`, `Select`, `Stat`. Shared by both calculators. |
| **Page** | `site/src/pages/<Name>.tsx` | State, layout, formatting. Calls the math, never restates it. |

The no-imports rule on the math module is not stylistic. `scripts/check-odds.ts` imports
`src/odds.ts` directly under `tsx`; a React or Zod import in there would drag the bundle into a
node script. Keep new math modules equally bare.

## 2. What `src/odds.ts` already gives you

Check this list before writing any odds arithmetic:

| Export | Does |
|:---|:---|
| `OddsFormat`, `FORMAT_LABEL` | `'american' \| 'decimal' \| 'fractional' \| 'implied'` + display labels |
| `americanToDecimal` / `decimalToAmerican` | the pair. `-100` canonicalises to `+100` |
| `decimalToFractional(d, maxDen = 1000)` | returns `[num, den]`, reduced |
| `parseOdds(text, format)` | returns a **decimal** price or `null`. `-50` is rejected, not coerced |
| `formatOdds(d, format)` | the inverse, for display |
| `DevigMethod`, `METHOD_LABEL`, `METHOD_BLURB` | `'multiplicative' \| 'power' \| 'shin'` + the UI copy |
| `devig(decimals[], method)` → `DevigResult` | strips the margin; outputs sum to 1 |
| `parlay(legs[], quotedDecimal?)` → `ParlayResult` | true joint probability vs the book's payout |
| `kellyFraction`, `growthRate`, `drawdownChance`, `simultaneousKelly` (in `src/kelly.ts`) | Kelly sizing for `/kelly`; a bet is `{ p, d }` with `d` decimal |

**Everything is in decimal internally.** Parse at the input edge, format at the output edge, and
keep decimals in between — mixing American into the middle of a calculation is how a sign error
gets in.

## 3. State conventions

- Inputs are held as **strings** and parsed per keystroke with `parseOdds`, which returns `null`
  on anything unusable. Do not store a half-typed `-` as a number.
- A `null` parse renders the field neutral, not an error — the user is mid-type.
- Results derive during render from parsed values. No `useEffect` mirroring input into a second
  state, which is how the two fields get out of sync.

## 4. Adding a new math module

1. Write `site/src/<name>.ts`, pure, no imports.
2. Write `site/scripts/check-<name>.ts` — `node:assert/strict`, a `near()` helper for floats, and
   assertions that fail if the logic breaks. Mirror `check-odds.ts`; it is 91 lines and covers
   round-trips, invariants ("de-vig outputs sum to one") and each method's theoretical behaviour.
3. Add `"check:<name>": "tsx scripts/check-<name>.ts"` to `package.json`.
4. Add `npm run check:<name>` to the `verify` script in `package.json`, before `npm run build`.
   CI runs `verify`, so that is the whole wiring.
5. Note the module in `AGENTS.md`'s layout block, saying which script holds it.

Step 4 is the one people skip. A guard nobody runs is a comment.

## 5. Styling

The page background and text colour come from theme tokens on `body` (`--bg`, `--fg` in
`index.css`), with a Light | Dark switch; pages do not set a background. Borders are `border-zinc-800/60`, secondary text `text-zinc-400`, muted `text-zinc-600`.
Accent colour comes from the tool's `accent` key — use that same colour family on the page so the
tile and the page match.

`Topbar` (with the ⌘K palette) renders on every path, Home included, so a page must **not** add its
own back-link or brand header.
