# Deferred Work

- source_spec: `_bmad-output/implementation-artifacts/spec-vibe-case-study.md`
  summary: Work portfolio cards link to `/work#${id}` without matching `id` attributes on articles, so hash navigation does not scroll.
  evidence: Pre-existing PortfolioGrid pattern; only `caseStudyUrl` preference was added in this story. Edge Case Hunter EC-001.

- source_spec: `_bmad-output/implementation-artifacts/spec-vibe-case-study.md`
  summary: EN footer copyright year is 2025 while HU was updated to 2026 amid unrelated locale churn on the dirty tree.
  evidence: Pre-existing dirty-tree locale inconsistency surfaced by Blind Hunter BH-02; not introduced by case-study keys.

- source_spec: `_bmad-output/implementation-artifacts/spec-research-pricing-early-stage-discount.md`
  summary: Phase 2 — add Refresh, Landing, and Discovery pricing SKUs with derived list→sale treatment.
  evidence: Split from research-pricing spec to stay within token budget; phase 1 covers existing web/mobile tiers only.

- source_spec: `_bmad-output/implementation-artifacts/spec-research-pricing-early-stage-discount.md`
  summary: Phase 2 — show marketing retainer list→sale prices (Launch/Growth/Scale) while keeping coming-soon + notify.
  evidence: Split from research-pricing spec; marketing price UI is independently shippable after core discount cards land.

- source_spec: `_bmad-output/implementation-artifacts/spec-research-pricing-early-stage-discount.md`
  summary: Contact form budget options still start at “Under €5,000” while Starter early sale is €800 — ranges no longer match the offer ladder.
  evidence: Blind Hunter finding; ContactForm budgets pre-existed and were not in Phase 1 scope.

- source_spec: `_bmad-output/implementation-artifacts/spec-research-pricing-phase-2.md`
  summary: Pricing FAQ still steers to “Starter or Growth” and never mentions Refresh, Landing, or Discovery.
  evidence: Blind Hunter finding; Phase 2 added volume SKUs but FAQ copy was out of scope and still describes the old ladder.
