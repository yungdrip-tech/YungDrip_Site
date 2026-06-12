# Kolors Virtual Try-On Integration Notes

## Source

Vendored from:

- `https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On`

Staged in this repository under:

- [external/kolors-virtual-try-on](/private/tmp/YungDrip_Site/external/kolors-virtual-try-on)

## Important Technical Finding

The Hugging Face repository is **not** a self-contained inference service.

It is a Gradio frontend/client that forwards requests to an external backend using environment variables:

- `tryon_url`
- `token`
- `Cookie`
- `referer`

Those values are not included in the public repo.

## What This Means

This branch contains:

- the original Kolors UI/client source
- its assets
- dependency references
- documentation for future integration

This branch does **not** yet provide a production-ready in-app virtual try-on inside YungDrip because the upstream service credentials/backend are required.

## Upstream Runtime Dependencies

From the source `requirements.txt`:

- `accelerate`
- `diffusers`
- `invisible_watermark`
- `torch`
- `transformers`
- `xformers`
- `opencv-python`
- `requests`
- `audioop-lts`
- `pydub`
- `huggingface-hub==0.25.1`

## Recommended Integration Architecture For YungDrip

Instead of embedding the Gradio app directly into the Next.js runtime, the clean long-term setup is:

1. Run a dedicated Python service for virtual try-on
2. Keep Next.js as the storefront and orchestration layer
3. Expose a secure internal API from the Python service
4. Call that service from a YungDrip server route
5. Return generated assets/results to the frontend

## Minimum Requirements To Make This Functional

You need one of the following:

1. Access to the original Kolors backend credentials used by the Hugging Face client
2. A self-hosted Kolors-compatible inference backend
3. A replacement try-on provider with stable API access

## Branch Purpose

This branch exists to:

- preserve the upstream code inside the startup repository
- let the team review the source
- prepare a safe future integration
- keep try-on work isolated from the core ecommerce branch
