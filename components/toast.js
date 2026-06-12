"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ message, onClose }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-2xl bg-ink px-5 py-4 text-sm text-white shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <span className="flex-1">{message}</span>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 transition hover:text-white"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
