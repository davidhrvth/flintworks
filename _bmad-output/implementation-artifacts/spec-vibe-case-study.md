---
title: 'VIBE Studio Case Study Detail Page'
type: 'feature'
created: '2026-08-05'
status: 'done'
baseline_commit: 'e2ce5593f94a238f000bdb05c50f26851f3011d1'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-vibe-case-study/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-vibe-case-study/implementation.md'
  - '{project-root}/_bmad-output/specs/spec-vibe-case-study/case-study-content.md'
  - '{project-root}/flintworks-next/AGENTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Studio cards dead-end at `/contact`, and there is no case-study surface for VIBE (studio-mobile) before the Aug 17, 2026 launch. Visitors cannot read the bilingual narrative Flintworks needs for launch window marketing.

**Approach:** In `flintworks-next` only, ship a dynamic `/studio/[slug]` case-study page (first slug `vibe`) with typed registry + i18n long-form copy, wire the studio-mobile card via `caseStudyUrl`, support optional App Store + Play Store + asset fields with placeholders now, and omit empty optional sections while showing metrics coming-soon pre-launch.

## Boundaries & Constraints

**Always:**
- Work only under `flintworks-next/` (ignore legacy `flintworks/`).
- All display copy via `react-i18next` `t()` in EN + HU — no hardcoded locale strings in components.
- Sensitive public copy: never say “scraper” / “scraping ticket providers”; prefer catalog ingest, multi-source listings, AI enrichment, flyer inference.
- Never invent metrics; pre-launch + empty metrics → explicit coming-soon block only.
- Reuse `AnimatedSection`, `SectionHeading`, `EmberBadge`, GlowCard/glass/border patterns and Tailwind tokens (`text-heading`/`text-body`/`ember`/`flame`/`border`).
- Visual layout must draw inspiration from 21st.dev Magic patterns (hero density, feature rhythm, challenge callout) adapted to Flintworks ember/flame — not a generic blog layout or purple AI-default look. Use `@21st-dev/magic` MCP when available; if MCP is down, adapt known 21st.dev case-study/feature-section composition patterns by hand.
- Public name is **VIBE**; feature list = five public features only (no ticket-wallet highlight); no quote section until real quote exists.
- Data model supports both `appStoreUrl` and `playStoreUrl` (omit both until real URLs); hero/screenshots use non-broken placeholders until David supplies paths.
- Proceed on current dirty `main` working tree without cleaning unrelated changes.

**Ask First:**
- Changing the public slug away from `vibe` or relocating Studio studies under `/work/[slug]`.
- Publishing real metrics, store URLs, or quote copy (only placeholders/omission until human supplies).
- Broad visual rewrite of Studio index or PortfolioGrid beyond CTA/`caseStudyUrl` wiring.

**Never:**
- CMS/admin UI, MDX content pipeline, or product landing / App Store listing production.
- Shipping live `/work/[slug]` client case studies in this slice (shared `CaseStudyView` only).
- Fabricating social proof, store badges, or analytics numbers.
- Migrating unrelated pages or rewriting PortfolioGrid visuals wholesale.
- Touching the legacy Vite `flintworks/` app for this feature.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Visit `/studio/vibe` with EN or HU | Full section stack: hero → problem → approach → architecture → challenge/solution → features → tech groups → metrics coming-soon → back CTA; all copy from i18n | N/A |
| Unknown slug | `/studio/not-a-study` | 404 via `notFound()` | Next.js not-found UI |
| Pre-launch optionals empty | No store URLs, screenshots paths are placeholders only, no quote, no demo, no metrics | No empty store/quote/demo shells; placeholder hero/gallery acceptable; metrics = coming-soon | N/A |
| Studio card with URL | `studio-mobile` has `caseStudyUrl: /studio/vibe` | Card shows VIBE copy + “View Case Study” → `/studio/vibe` | N/A |
| Studio card without URL | `studio-web` no `caseStudyUrl` | Keep “Follow the Build” → `/contact` | N/A |
| Progressive enrichment | Later add real store URLs + one metric in data/i18n only | Store CTA row + real metrics appear without restructuring components | N/A |
| Language toggle | Switch EN ↔ HU on case study | All section copy switches; keys exist in both locale files | Missing key → i18n fallback (must not ship missing keys) |

</frozen-after-approval>

## Code Map

- `flintworks-next/app/(site)/studio/page.tsx` -- Metadata pattern to mirror for `generateMetadata`
- `flintworks-next/app/(site)/studio/client.tsx` -- Hardcoded `studioProjectMeta`; both CTAs → `/contact`; extend with `caseStudyUrl` + conditional CTA label
- `flintworks-next/app/(site)/studio/[slug]/page.tsx` -- **create**: resolve slug, `generateStaticParams`, `generateMetadata`, `notFound()`
- `flintworks-next/app/(site)/studio/[slug]/client.tsx` -- **create**: client shell composing `CaseStudyView`
- `flintworks-next/components/case-study/CaseStudyView.tsx` -- **create**: shared presentational composition (future `/work/[slug]` reuse)
- `flintworks-next/data/case-studies.ts` -- **create**: typed registry + `getCaseStudyBySlug` / `getCaseStudyById`; VIBE seed `id: studio-mobile`, `slug: vibe`, `status: pre-launch`
- `flintworks-next/data/projects.ts` -- `Project.caseStudyUrl` already typed; wire in PortfolioGrid if cheap (VIBE may not be on Work grid)
- `flintworks-next/components/sections/PortfolioGrid.tsx` -- Prefer `caseStudyUrl` when set; else keep hash link
- `flintworks-next/components/ui/{AnimatedSection,SectionHeading,EmberBadge,GlowCard}.tsx` -- reuse
- `flintworks-next/i18n/locales/{en,hu}/translation.json` -- update `studio.projects.studio-mobile`; add `studio.viewCaseStudy` + full `caseStudy.*` tree
- `flintworks-next/public/` -- placeholder hero/screenshot assets (replace later)
- `_bmad-output/specs/spec-vibe-case-study/{SPEC,implementation,case-study-content}.md` -- canonical content + AC detail

## Tasks & Acceptance

**Execution:**
- [x] `flintworks-next/data/case-studies.ts` -- Add `CaseStudy` types + VIBE registry entry (tech groups, optional store URL fields, placeholder asset paths, `status: pre-launch`) -- single source for structural/meta fields
- [x] `flintworks-next/i18n/locales/en/translation.json` + `hu/translation.json` -- Replace studio-mobile TBD card copy; add `studio.viewCaseStudy`; add full `caseStudy` namespace from content companion (arrays via `returnObjects`) -- bilingual surface
- [x] `flintworks-next/public/` -- Add non-broken placeholder hero (and optional screenshot placeholders) -- ship without empty broken media
- [x] `flintworks-next/components/case-study/CaseStudyView.tsx` -- Build section stack with gated optionals + metrics coming-soon; 21st.dev-inspired composition on Flintworks tokens -- CAP-2/3 UI
- [x] `flintworks-next/app/(site)/studio/[slug]/page.tsx` + `client.tsx` -- Dynamic route, metadata, notFound, compose view -- CAP-1/4
- [x] `flintworks-next/app/(site)/studio/client.tsx` -- Add `caseStudyUrl` on studio-mobile meta; conditional Link label/target; expand tags toward brief subset -- card entry
- [x] `flintworks-next/components/sections/PortfolioGrid.tsx` -- If `project.caseStudyUrl` set, Link there -- forward-compatible Work pattern
- [x] Manual / light check -- Hit `/studio/vibe`, unknown slug 404, EN/HU toggle, studio card CTA, empty-optional omission -- verify I/O matrix

**Acceptance Criteria:**
- Given visitor on `/studio`, when they click the VIBE card CTA, then they land on `/studio/vibe` and see the full bilingual case-study narrative.
- Given `/studio/unknown`, when the page loads, then Next.js returns 404.
- Given `studio-web` has no `caseStudyUrl`, when Studio renders, then its CTA remains Follow the Build → `/contact`.
- Given pre-launch with empty metrics and no store/quote/demo URLs, when the case study renders, then metrics show coming-soon and store/quote/demo sections are absent (placeholders allowed for hero/screenshots only).
- Given page copy, when reviewed, then it never contains scraper/scraping-provider language and never invents metrics.
- Given `/studio/vibe`, when Metadata is inspected, then title/description/OG follow the existing `(site)` pattern with dynamic slug URL.
- Given only data/i18n updates adding `appStoreUrl`/`playStoreUrl` and one metric later, when the page re-renders, then those sections appear without component restructuring.
- Given the five public features in `case-study-content.md`, when the features section renders, then exactly those five appear (no ticket-wallet).

## Spec Change Log

## Design Notes

- **Split of concerns:** structural fields (slug, status, tech group ids, asset/URL paths) in `data/case-studies.ts`; long-form prose in `caseStudy.projects.studio-mobile` i18n — matches existing studio/work split.
- **Studio cards today** are not driven by `data/projects.ts`; prefer extending `studioProjectMeta` with `caseStudyUrl` rather than forcing a premature unify.
- **Store CTAs:** model both App Store and Play Store; omit until URLs provided — row renders 1 or 2 links when present.
- **21st.dev:** Magic MCP may be unavailable; still ship a distinct case-study composition (dense hero, challenge callout, grouped tech, feature rhythm) — not a blog article template.

## Verification

**Commands:**
- `cd flintworks-next && npm run build` -- expected: build succeeds; `/studio/vibe` in static params; unknown slug path not required at build
- `cd flintworks-next && npm run lint` -- expected: no new lint errors in touched files

**Manual checks (if no CLI):**
- `/studio` → VIBE card → `/studio/vibe`; language toggle EN/HU; `/studio/nope` 404; no empty store/quote shells; metrics coming-soon visible

## Suggested Review Order

**Entry & data model**

- Typed registry seeds VIBE (`slug: vibe`, pre-launch, placeholders, dual store fields).
  [`case-studies.ts:32`](../../flintworks-next/data/case-studies.ts#L32)

- Slug lookup drives static params, metadata, and 404.
  [`case-studies.ts:65`](../../flintworks-next/data/case-studies.ts#L65)

**Routing & SEO**

- `dynamicParams = false` + `generateMetadata` for `/studio/vibe`.
  [`page.tsx:20`](../../flintworks-next/app/(site)/studio/[slug]/page.tsx#L20)

**Case study UI**

- Section stack with gated optionals (metrics coming-soon, stores, quote).
  [`CaseStudyView.tsx:26`](../../flintworks-next/components/case-study/CaseStudyView.tsx#L26)

- Metrics/store gates — progressive enrichment without empty shells.
  [`CaseStudyView.tsx:45`](../../flintworks-next/components/case-study/CaseStudyView.tsx#L45)

**Card entry points**

- Studio CTA derives href from registry (no hardcoded `/studio/vibe`).
  [`client.tsx:21`](../../flintworks-next/app/(site)/studio/client.tsx#L21)

- PortfolioGrid prefers `caseStudyUrl` when set.
  [`PortfolioGrid.tsx:64`](../../flintworks-next/components/sections/PortfolioGrid.tsx#L64)

**i18n**

- Card copy + full `caseStudy` EN/HU namespace (arrays via `returnObjects`).
  [`translation.json:419`](../../flintworks-next/i18n/locales/en/translation.json#L419)

