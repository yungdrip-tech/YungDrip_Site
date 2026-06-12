# Repository Migration Notes

This repository was originally empty except for a `LICENSE` file on `main`.

The working YungDrip application was migrated from the local source repository into the startup repository on the branch:

- `codex/migrate-yungdrip-core`

## Migration Strategy

- Copied the application codebase into this repository
- Preserved the existing Next.js + MongoDB + Razorpay architecture
- Kept the application on a dedicated feature branch instead of writing to `main`

## Current Branches

- `codex/migrate-yungdrip-core`
  - Full YungDrip application migrated into the startup repo
- `codex/kolors-virtual-try-on`
  - Same migrated application plus the Hugging Face Kolors Virtual Try-On source staged in an isolated integration area

## Recommended Next Step

Open pull requests from these branches into `main` only after:

- team review
- environment variable alignment
- deployment review
- security validation
