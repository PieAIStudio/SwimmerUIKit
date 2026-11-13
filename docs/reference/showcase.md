---
id: REF-SHOWCASE
title: Showcase entry
type: reference
status: active
canonical: true
owner: project
created: 2026-11-13
last_reviewed: 2026-11-13
tags:
  - showcase
  - reference
---

# UIKit showcase

The phase-2 showcase is a small, responsive reference page in showcase/. It consumes the six public composition parts from @pieai/swimmer-ui-kit/showcase and its own showcase.css entry. showcase/kit.json is the by-reference manifest used by HQ.

The page keeps the SwimmerParty grey light/dark contract, Baloo 2 display type, Geist body type, native bilingual toggle, and the five-block order: What it is, Try it live, How to plug in, Status, Updates. The page build writes to ignored showcase-dist/; it is not part of the published package files.

Use pnpm build:showcase after pnpm build to generate the static page.