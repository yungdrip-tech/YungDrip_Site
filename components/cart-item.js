"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <article className="panel flex flex-col gap-5 p-4 sm:flex-row sm:items-center">
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] sm:w-28">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="120px" />
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-semibold">{item.name}</h2>
        <p className="mt-1 text-sm text-black/55">
          {item.size} / {item.color}
        </p>
        <p className="mt-3 font-semibold">{formatCurrency(item.price)}</p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-full border border-black/10 bg-white">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}
            className="p-3 transition hover:bg-black/5"
            aria-label={`Decrease quantity for ${item.name}`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-sm font-semibold">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
            className="p-3 transition hover:bg-black/5"
            aria-label={`Increase quantity for ${item.name}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.cartKey)}
          className="inline-flex items-center gap-2 text-sm text-black/55 transition hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
      </div>
    </article>
  );
}
