---
title: 'Research Pricing — Refresh/Landing/Discovery + Marketing List→Sale (Phase 2)'
type: 'feature'
created: '2026-08-06'
status: 'done'
baseline_commit: 'c89845aee4fa5782ff1eb1e38ba41bf366e4d17b'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/research/market-flintworks-digital-agency-budapest-eu-marketing-research-2026-08-06.md'
  - '{project-root}/_bmad-output/planning-artifacts/research/market-flintworks-early-stage-volume-acquisition-penetration-pricing-budapest-research-2026-08-06.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-research-pricing-early-stage-discount.md'
  - '{project-root}/flintworks-next/AGENTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/pricing` still lacks volume SKUs (Refresh, Landing, Discovery) from research, and marketing retainers show “—” with “pricing announced at launch” despite known list→sale bands.

**Approach:** In `flintworks-next` only, add the three web SKUs with Phase-1 list→sale treatment, and wire marketing Launch/Growth/Scale (existing IDs) to list→sale while keeping coming-soon + notify — 21st-CLI-inspired hierarchy (struck list, bold sale, early cue), pattern-adapt only.

## Boundaries & Constraints

**Always:**
- Work only under `flintworks-next/` (ignore legacy `flintworks/` and orphan `app/pricing/` if present — live route is `app/(site)/pricing/`).
- EN + HU via `t()` — no hardcoded locale prices in components.
- Web SKUs: append `refresh`, `landing`, `discovery` to `webPricingTiers` (order: refresh → landing → starter → growth → scale → discovery; keep `growth` popular). Reuse `PricingCards` discount UI.
- Amounts from canonical table below. Refresh/Landing: list = early high, sale = early low (doc 2; no doc-1 goal). Discovery: list = doc-1 floor, sale = doc-2 low. Marketing: list = doc-1 Launch/Growth/Scale lows; sale HUF = doc-2 Need 1/2/3 lows; sale EUR = listEUR × (saleHUF/listHUF), nearest €10; Scale keeps `+`.
- Marketing: keep IDs `starter` / `growth` / `full-service`; pass `currency`; struck list + bold sale + early cue; retain coming-soon badge + notify CTA. Update subtext so it no longer says prices are unannounced.
- Show `pricing.savePercent` (~80%) only when sale/list ≈ that band; otherwise early-client badge alone (marketing uses early cue + `/mo`·`/hó` period).
- CurrencyToggle switches list + sale for web and marketing.

**Ask First:**
- Installing via `21st add` / foreign Card stacks (prefer `21st search` inspire + adapt in place — same as Phase 1).

**Never:**
- Change Phase-1 Starter/Growth/Scale/Mobile amounts.
- Race template floors (15–90k Ft) or imply a fixed FX rate.
- Enable marketing launch (leave `ENABLE_MARKETING` / notify flow as-is aside from price UI + copy).
- Contact-form budget ranges (still deferred).
- Edit research markdown or legacy `flintworks/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| EUR Refresh | Currency=EUR | List `€900` struck; sale `€400`; early cue; no false ~80% | N/A |
| HUF Landing | Currency=HUF | List `450 000 Ft` struck; sale `200 000 Ft` | N/A |
| Discovery EUR | Currency=EUR | List `€2,500` struck; sale `€200`; early cue only (not ~80%) | N/A |
| Marketing Launch | EUR + ENABLE_MARKETING | List `€450/mo` struck; sale `€250/mo`; coming-soon + notify | N/A |
| Marketing Scale HUF | HUF | List `600 000+ Ft/hó` struck; sale `285 000+ Ft/hó` | N/A |
| Toggle | EUR ↔ HUF | Web + marketing list/sale switch; no leftover currency | N/A |

</frozen-after-approval>

## Code Map

- `flintworks-next/data/pricing.ts` — append web SKU ids; optional `marketingPricingTiers` export
- `flintworks-next/components/sections/PricingCards.tsx` — gate `savePercent` when discount ≠ ~80%
- `flintworks-next/components/ui/MarketingPricingCard.tsx` — list→sale + currency; keep notify
- `flintworks-next/app/(site)/pricing/client.tsx` — pass currency into marketing cards; use shared tier list if extracted
- `flintworks-next/app/(site)/marketing/client.tsx` — same marketing tier source if extracted
- `flintworks-next/i18n/locales/en/translation.json` — new web tiers + marketing price keys + subtext
- `flintworks-next/i18n/locales/hu/translation.json` — HU parity (thin spaces, `/hó`)

## Tasks & Acceptance

**Execution:**
- [x] `flintworks-next/data/pricing.ts` — Append `refresh`/`landing`/`discovery` in specified order; optionally export marketing tier ids — single source of truth
- [x] `flintworks-next/i18n/locales/en/translation.json` + `hu/translation.json` — Add web tier keys (name/desc/features/cta + list/sale); marketing `price`/`listPrice` (+ HUF) with `/mo`·`/hó`; fix marketing pricing subtext — amount + copy source of truth
- [x] `flintworks-next/components/sections/PricingCards.tsx` — Only show `savePercent` when discount roughly ~80%; keep strike + earlyClient — honest cues
- [x] `flintworks-next/components/ui/MarketingPricingCard.tsx` — Accept `currency`; render Phase-1-style list→sale + early cue; keep coming-soon + notify — visible retainer discount while gated
- [x] `flintworks-next/app/(site)/pricing/client.tsx` (+ marketing client if shared ids) — Wire currency into marketing cards — toggle parity
- [x] Optional: `21st search "pricing"` for hierarchy reference only — do not `21st add` unless Ask First cleared — 21st CLI inspiration

**Canonical amounts:**

| Tier | List EUR | Sale EUR | List HUF | Sale HUF |
|------|----------|----------|----------|----------|
| refresh | €900 | €400 | 350 000 | 150 000 |
| landing | €1,200 | €500 | 450 000 | 200 000 |
| discovery | €2,500 | €200 | 1 000 000 | 80 000 |
| marketing starter | €450/mo | €250/mo | 180 000 Ft/hó | 100 000 Ft/hó |
| marketing growth | €800/mo | €500/mo | 320 000 Ft/hó | 200 000 Ft/hó |
| marketing full-service | €1,500+/mo | €710+/mo | 600 000+ Ft/hó | 285 000+ Ft/hó |

**Acceptance Criteria:**
- Given `/pricing` web section, when rendered, then Refresh/Landing/Discovery cards appear with struck list + sale per table and Starter/Growth/Scale/Mobile amounts unchanged.
- Given currency toggle, when switching EUR↔HUF, then new web SKUs and marketing cards update both list and sale.
- Given ENABLE_MARKETING, when viewing marketing cards, then list→sale shows (not “—”), coming-soon + notify remain, and copy no longer claims prices are unannounced.
- Given EN and HU, when switching language, then all new keys resolve with no missing-key leftovers.
- Given Refresh/Landing/Discovery (and marketing), when discount ≠ ~80%, then UI does not claim `Save ~80%`.

## Spec Change Log

## Design Notes

**21st CLI:** `21st search "pricing"` — tier cards with clear price hierarchy. Map to Flintworks: muted strikethrough list, dominant sale, mono/ember early cue (+ `/mo` on retainers). Adapt existing shells; do not install foreign stacks (`21st get` may be quota-limited — search + Phase-1 UI suffice).

**Amount logic:** Refresh/Landing have no doc-1 goal → early band high/low. Discovery/marketing follow goal-floor list + early (or HUF-ratio) sale, matching Phase-1 Starter spirit without inventing FX.

## Verification

**Commands:**
- `cd flintworks-next && npx tsc --noEmit` -- expected: no type errors from pricing/marketing changes
- Grep EN/HU for `pricing.tiers.refresh|landing|discovery` and `marketing.pricing.tiers.*.(listPrice|price)` -- expected: both locales present

**Manual checks:**
- `/pricing`: six web cards; growth still popular; Discovery deep discount without ~80% claim
- Marketing (flag on): list→sale + notify; EUR↔HUF; HU thin spaces + `/hó`

## Suggested Review Order

**Web SKUs**

- Append Refresh/Landing/Discovery in research order; export shared marketing IDs
  [`pricing.ts:8`](../../flintworks-next/data/pricing.ts#L8)

- Gate ~80% save claim; numeric discount check; price fallback
  [`PricingCards.tsx:65`](../../flintworks-next/components/sections/PricingCards.tsx#L65)

- Canonical EN amounts + features for new volume tiers
  [`en/translation.json:254`](../../flintworks-next/i18n/locales/en/translation.json#L254)

- HU parity (thin spaces) for Refresh/Landing/Discovery
  [`hu/translation.json:251`](../../flintworks-next/i18n/locales/hu/translation.json#L251)

**Marketing list→sale**

- Currency-aware list→sale; keep coming-soon + notify
  [`MarketingPricingCard.tsx:37`](../../flintworks-next/components/ui/MarketingPricingCard.tsx#L37)

- Pass page currency into marketing cards on `/pricing`
  [`client.tsx:147`](../../flintworks-next/app/pricing/client.tsx#L147)

- Marketing page toggle + indicative currency note
  [`client.tsx:106`](../../flintworks-next/app/marketing/client.tsx#L106)

- Retainer list/sale strings + early-client subtext (not “unannounced”)
  [`en/translation.json:710`](../../flintworks-next/i18n/locales/en/translation.json#L710)
