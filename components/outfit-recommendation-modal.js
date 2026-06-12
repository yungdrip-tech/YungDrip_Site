"use client";

import { useState } from "react";
import Button from "@/components/button";
import StyleMeModal from "@/components/style-me-modal";

export default function OutfitRecommendationModal({ product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="muted-label mb-2">Style Assistant</p>
            <h2 className="text-2xl font-semibold">Get outfit ideas for this piece</h2>
          </div>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Style Me
          </Button>
        </div>
      </div>

      <StyleMeModal open={open} onClose={() => setOpen(false)} currentProduct={product} />
    </>
  );
}
