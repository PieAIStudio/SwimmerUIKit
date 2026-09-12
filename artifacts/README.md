# Evidence, not a generic cache

Owner: SwimmerUIKit maintainers. These are **version-scoped records**, not a
current automated golden-image suite. Keep the original bytes and paths.

| Directory | Producer / consumer found | Decision |
| --- | --- | --- |
| `edge-quality/` | `measure-liquid-edge.mjs`, `metrics.json`, the [1.11.3 edge report](../docs/archive/measurements/liquid-edge-quality-1.11.3.md) and its crops | Preserve reproduction script, measurements and PNGs together. The script writes captures; run in a disposable checkout, not over this evidence. |
| `shadow-cost/` | [2.0.0 shadow-cost report](../docs/archive/measurements/liquid-shadow-cost-2.0.0.md), before/after manual inspection | Preserve; formula-derived and unmeasured results are not promoted to live measurements. |
| `experience-capture/` | Historical merge/Bend/Melt/dissolve/waviness review captures, corresponding source-history commits | Preserve. Human review / external packet links are not fully enumerable; absence of an in-repo image comparator is not deletion authority. |
| `api-audit/` | Compiler-resolved inventory script; `src/publicApi.test.ts` reads the frozen 2.4.0 contract | Live test fixture plus explicit consumer-audit scope, not current consumer usage telemetry. |

No pre-existing PNG under `artifacts/` or `SCRATCH/` is read as a baseline by the
current `src/`, `scripts/` or GitHub workflows found in the 2.5.0 audit. That is
not a claim that no external human or tool uses these images. The manual
measurement path is known and retained. New throwaway captures go under ignored
`.devspace-visual/`; deliberately retained evidence requires an owner and index.
