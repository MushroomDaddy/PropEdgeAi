# Convex Generated Files

This directory contains auto-generated files produced by the Convex CLI.

**DO NOT manually edit files in this directory.**

## Regenerate

```bash
# During development (watches for changes):
npx convex dev

# One-time codegen:
npx convex codegen

# Production deployment:
npx convex deploy
```

All files (`api.d.ts`, `api.js`, `dataModel.d.ts`, `server.d.ts`, `server.js`)
are generated from your schema and function definitions in the `convex/` directory.
