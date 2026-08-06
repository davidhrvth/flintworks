---
title: 'Research Pricing — Goal List + Early-Stage Discount (Phase 1)'
type: 'feature'
created: '2026-08-06'
status: 'done'
baseline_commit: '6d448e8974e41a30d3f1673ad1b1c9cbef75e7b0'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/research/market-flintworks-digital-agency-budapest-eu-marketing-research-2026-08-06.md'
  - '{project-root}/_bmad-output/planning-artifacts/research/market-flintworks-early-stage-volume-acquisition-penetration-pricing-budapest-research-2026-08-06.md'
  - '{project-root}/flintworks-next/AGENTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Package prices on `/pricing` are placeholders. Research defined mature goal/list bands and early-stage sale bands, but the UI shows neither and has no visible early-client discount.

**Approach:** In `flintworks-next` only, update **existing** web/mobile tiers so goal prices are the struck list anchor and early-stage (Starter low-end; Growth/Mobile/Scale at the same Starter EUR/HUF ratios) are the live “from” price — with a 21st.dev-CLI-inspired discount treatment (strikethrough list + bold sale + early-client cue).

## Boundaries & Constraints

**Always:**
- Work only under `flintworks-next/` (ignore legacy `flintworks/`).
- EN + HU via `t()` — no hardcoded locale price/copy in components.
- List = Budapest goal card (doc 1). Sale for Starter = early-stage low end (doc 2: €800 / 300 000 Ft). Sale for Growth/Mobile/Scale/custom-mobile = list × Starter ratio (EUR `800/3900`, HUF `300000/1500000`), EUR rounded to nearest €10.
- Visible discount on every priced tier: muted strikethrough list, dominant sale, short early-client framing; CurrencyToggle switches both currencies.
- Reuse existing card shell (`glass`, `ember`, `EmberBadge`, `AnimatedSection`).

**Ask First:**
- Installing a full 21st.dev component via `21st add` that pulls foreign Card/shadcn deps (prefer pattern-inspire, adapt in-place).

**Never:**
- Add Refresh / Landing / Discovery SKUs or change marketing price UI this phase (deferred — see `deferred-work.md`).
- Race template floors (15–90k Ft) or imply a fixed FX rate.
- Edit research markdown or legacy `flintworks/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| EUR Starter | Currency=EUR | List `€3,900` struck; sale `€800`; early-client cue | N/A |
| HUF Starter | Currency=HUF | List `1 500 000 Ft` struck; sale `300 000 Ft` | N/A |
| Proportional Growth | Growth EUR/HUF | List `€18,000` / `7 000 000 Ft` struck; sale `€3,690` / `1 400 000 Ft` | N/A |
| Custom floor | Scale / custom-mobile | List `from €40,000+` struck; sale `from €8,210+` (HUF `15M+`→`3M+`); custom CTA | N/A |
| Toggle | EUR ↔ HUF | Both list and sale strings switch; no leftover wrong currency | N/A |

</frozen-after-approval>

## Code Map

- `flintworks-next/data/pricing.ts` — existing tier IDs/flags only this phase
- `flintworks-next/components/sections/PricingCards.tsx` — list+sale row + early cue
- `flintworks-next/app/(site)/pricing/client.tsx` — page composition; early-packaging note if needed
- `flintworks-next/i18n/locales/en/translation.json` — sale + listPrice keys, early-client copy
- `flintworks-next/i18n/locales/hu/translation.json` — HU parity (thin-space numbers)

## Tasks & Acceptance

**Execution:**
- [x] `flintworks-next/i18n/locales/en/translation.json` + `hu/translation.json` -- Set `price`/`priceHUF` (sale) + `listPrice`/`listPriceHUF` (goal); early-client/save strings for existing tiers -- amount source of truth
- [x] `flintworks-next/components/sections/PricingCards.tsx` -- Strikethrough list + bold sale + cue; custom tiers use “from …+” -- visible discount
- [x] `flintworks-next/data/pricing.ts` -- Only if needed: flag `custom` floors already present; no new SKUs -- keep structure honest
- [x] `flintworks-next/app/(site)/pricing/client.tsx` -- Optional one-line early-packaging note near currency toggle -- frame as capacity/early client, not cheap agency
- [x] Optional: `21st search`/`21st get` for pattern reference only — adapt; do not wholesale-install unless Ask First cleared -- 21st CLI inspiration

**Canonical amounts (existing tiers only):**

| Tier | List EUR | Sale EUR | List HUF | Sale HUF |
|------|----------|----------|----------|----------|
| starter | €3,900 | €800 | 1 500 000 | 300 000 |
| growth | €18,000 | €3,690 | 7 000 000 | 1 400 000 |
| scale | €40,000+ | €8,210+ | 15 000 000+ | 3 000 000+ |
| mobile-mvp | €22,000 | €4,510 | 8 500 000 | 1 700 000 |
| custom-mobile | €40,000+ | €8,210+ | 15 000 000+ | 3 000 000+ |

**Acceptance Criteria:**
- Given `/pricing` in EUR, when viewing Starter, then list €3,900 is struck and sale €800 is primary with early-client framing.
- Given currency toggle to HUF, when viewing the same cards, then both list and sale use the HUF column.
- Given Growth/Mobile/Scale/custom-mobile, when rendered, then sale matches the proportional table (not undiscounted goal-only).
- Given EN and HU, when switching language, then all new pricing keys resolve with no missing-key leftovers for these tiers.
- Given this phase, when shipping, then Refresh/Landing/Discovery and marketing price changes are absent (deferred).

## Spec Change Log

## Design Notes

**21st CLI inspiration:** From `21st search "pricing"` / `21st get` — price hierarchy and save/period cue. Map to Flintworks: struck muted list, large sale, mono/ember early-client cue. Adapt `PricingCards`; do not fork a foreign SaaS card stack.

**Phase 2 (deferred):** Refresh/Landing/Discovery SKUs; marketing list→sale while coming soon — see `deferred-work.md`.

## Verification

**Commands:**
- `cd flintworks-next && npx tsc --noEmit` -- expected: no type errors from pricing changes
- Grep EN/HU for `listPrice` on starter/growth/scale/mobile-mvp/custom-mobile -- expected: both locales present

**Manual checks:**
- `/pricing` EUR→HUF: existing cards show strikethrough + sale; Scale/custom-mobile show from+/from+ discount
- Spot-check HU thin-space formatting matches existing locale style

## Suggested Review Order

**Discount UI**

- Guarded list→sale render with early-client cue (21st-inspired hierarchy)
  [`PricingCards.tsx:41`](../../flintworks-next/components/sections/PricingCards.tsx#L41)

- Strike + sale + surface badge only when list ≠ sale
  [`PricingCards.tsx:70`](../../flintworks-next/components/sections/PricingCards.tsx#L70)

- Screen-reader explanation of list vs early price
  [`PricingCards.tsx:83`](../../flintworks-next/components/sections/PricingCards.tsx#L83)

**Copy & amounts**

- Early-packaging framing near currency toggle
  [`client.tsx:88`](../../flintworks-next/app/pricing/client.tsx#L88)

- Canonical EN list/sale strings (Starter through custom-mobile)
  [`en/translation.json:256`](../../flintworks-next/i18n/locales/en/translation.json#L256)

- HU parity (thin spaces + ~80% save cue)
  [`hu/translation.json:257`](../../flintworks-next/i18n/locales/hu/translation.json#L257)
