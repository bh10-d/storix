# Release Guide

## Pre-release Checklist

Before creating a release:

```bash
npm run typecheck
npm run test:run
npm run build
```

Verify:

- All tests pass
- TypeScript compiles
- Package exports work
- Package metadata is correct
- Documentation is updated
- No accidental debug code remains

---

## Build

```bash
npm run build
```

The build should generate the distributable output.

Check:

```text
dist/
├── index.js
├── index.d.ts
└── ...
```

---

## Package

Create a package archive:

```bash
npm pack
```

Example:

```text
storix-0.1.0.tgz
```

---

## Local Package Testing

Create a test project:

```bash
mkdir examples/basic-usage
cd examples/basic-usage
npm init -y
```

Install the local package:

```bash
npm install ../../storix-0.1.0.tgz
```

Then verify:

```ts
import { Storage } from "storix";
```

This validates:

- Package exports
- Type declarations
- ESM resolution
- Runtime files
- Published package contents

---

## Versioning

Use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

Examples:

```text
0.1.0
0.1.1
0.2.0
1.0.0
```

Suggested rules:

- Patch → bug fixes
- Minor → backward-compatible features
- Major → breaking API changes

---

## Release Process

```text
1. Implement feature
2. Add tests
3. Update documentation
4. Run typecheck
5. Run tests
6. Build
7. Review package contents
8. Update version
9. npm pack
10. Publish
```

For the current early-stage project, publishing should only happen after the public API is considered stable enough.
