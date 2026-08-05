# Deferred Work

- source_spec: `_bmad-output/implementation-artifacts/spec-vibe-case-study.md`
  summary: Work portfolio cards link to `/work#${id}` without matching `id` attributes on articles, so hash navigation does not scroll.
  evidence: Pre-existing PortfolioGrid pattern; only `caseStudyUrl` preference was added in this story. Edge Case Hunter EC-001.

- source_spec: `_bmad-output/implementation-artifacts/spec-vibe-case-study.md`
  summary: EN footer copyright year is 2025 while HU was updated to 2026 amid unrelated locale churn on the dirty tree.
  evidence: Pre-existing dirty-tree locale inconsistency surfaced by Blind Hunter BH-02; not introduced by case-study keys.
