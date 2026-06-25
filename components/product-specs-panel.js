"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 border-b border-black/8 py-3 sm:flex-row sm:items-start sm:justify-between">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">{label}</dt>
      <dd className="max-w-xl text-sm leading-6 text-black/70">{value}</dd>
    </div>
  );
}

function SizeChartTable({ rows = [] }) {
  if (!rows.length) {
    return null;
  }

  const columns = Object.keys(rows[0]).filter((column) => column !== "Measurements");

  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-black/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-mist text-[11px] uppercase tracking-[0.18em] text-black/45">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.Size || row.Measurements || index}`} className="border-t border-black/8">
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 text-black/70">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccordionSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-black/10">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-black/55">{title}</span>
        <ChevronDown className={cn("h-4 w-4 transition", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen ? <div className="pb-5">{children}</div> : null}
    </div>
  );
}

export default function ProductSpecsPanel({ product }) {
  const details = product.details || {};
  const sizeChart = product.sizeChart || null;

  const hasDetails = Boolean(
    details.fit ||
      details.length ||
      details.sleeveLength ||
      details.neckline ||
      details.material ||
      details.materialComposition ||
      details.wash ||
      details.concept ||
      product.season ||
      product.sku
  );

  if (!hasDetails && !sizeChart) {
    return null;
  }

  return (
    <div className="panel mt-6 p-6 lg:p-8">
      <p className="muted-label mb-2">Product details</p>
      <h2 className="text-3xl font-semibold">Fit, fabric & care</h2>

      {hasDetails ? (
        <AccordionSection title="Specifications" defaultOpen>
          <dl>
            <DetailRow label="SKU" value={product.sku} />
            <DetailRow label="Season" value={product.season} />
            <DetailRow label="Concept" value={details.concept} />
            <DetailRow label="Fit" value={details.fit} />
            <DetailRow label="Length" value={details.length} />
            <DetailRow label="Sleeve" value={details.sleeveLength} />
            <DetailRow label="Neckline" value={details.neckline} />
            <DetailRow label="Material" value={details.material} />
            <DetailRow label="Composition" value={details.materialComposition} />
            <DetailRow label="Care" value={details.wash} />
          </dl>
        </AccordionSection>
      ) : null}

      {sizeChart ? (
        <AccordionSection title="Size chart" defaultOpen={!hasDetails}>
          <SizeChartTable rows={sizeChart} />
        </AccordionSection>
      ) : null}
    </div>
  );
}
