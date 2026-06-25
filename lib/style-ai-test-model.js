// Test assets for the Style.AI mannequin assembly system.
export const STYLE_AI_BODY_MODEL_URL = "/3d-models/male.glb";
export const STYLE_AI_TSHIRT_MODEL_URL = "/3d-models/tshirt.glb";
export const STYLE_AI_JEANS_MODEL_URL = "/3d-models/jeans.glb";
export const STYLE_AI_SINGLE_MODEL_URL = "/3d-models/patchwork-denim.glb";
export const STYLE_AI_FULL_MODEL_URL = "/3d-models/full.glb";

export const STYLE_AI_DEMO_MODES = {
  full: "full",
  single: "single",
  outfit: "outfit",
};

// These GLBs are full-body T-pose meshes (not isolated shirt/pants pieces).
// Fit uses non-uniform scale per axis + region anchoring on the body bbox.
export const GARMENT_FIT = {
  tshirt: {
    widthRatio: 1.0,
    heightRatio: 0.34, // squash full-body mesh down to torso band
    depthRatio: 1.0,
    anchorYRatio: 0.72, // chest / upper-torso center on body
    depthNudge: 0.04,
  },
  jeans: {
    widthRatio: 0.98,
    heightRatio: 0.56, // squash full-body mesh down to leg band
    depthRatio: 1.0,
    anchorYRatio: 0.28, // hip center on body
    alignBottom: true, // lock pant hem to feet
    depthNudge: 0.02,
  },
};
