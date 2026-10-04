# npm 12.2.0 registry regression fixtures

Captured from the public npm registry on 2026-10-04 UTC with Node 24.19.0 and an isolated npm 12.2.0 installation. These two stdout files are byte-identical to the retained local query evidence; they contain no credentials.

- `registry.stdout.json`: `npm view @pieai/swimmer-ui-kit version dist-tags versions --json --registry=https://registry.npmjs.org`, exit 0. npm 12 returns a one-element array, not an object.
- `candidate.stdout.json`: the same command with `@pieai/swimmer-ui-kit@3.0.0-rc.1`, exit 1 with the version-specific `E404` error.

Original stdout, stderr, exit status and commands are retained under `.devspace-reports/uikit-3-completion/S14-reauthorized/`. Tests must preserve the actual output shape rather than recreating it from assumptions. After publication these fixtures remain the historical _before_ state; do not refresh them to make absence tests depend on live npm.
