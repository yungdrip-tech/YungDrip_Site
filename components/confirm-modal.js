"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/button";
import { cn } from "@/lib/utils";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, isLoading]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close confirmation dialog"
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-2xl">
              <h2 id="confirm-modal-title" className="text-2xl font-semibold">
                {title}
              </h2>
              {description ? <p className="mt-3 text-sm text-black/60">{description}</p> : null}

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                  {cancelLabel}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(variant === "danger" && "bg-red-600 text-white hover:bg-red-700")}
                >
                  {isLoading ? "Working..." : confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
