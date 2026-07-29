import { useState } from "react";
import { Check, X, Search } from "lucide-react";
import { ScaledEmail } from "./ScaledEmail";
import { EMAIL_TEMPLATES } from "@/lib/templates";
import type { Campaign } from "@/lib/campaign";

/**
 * Full-screen picker for saved email designs. Shows a live render of every
 * template plus a large preview of the highlighted one.
 */
export function TemplatePicker({
  open,
  currentId,
  onClose,
  onApply,
}: {
  open: boolean;
  currentId: string | null;
  onClose: () => void;
  onApply: (id: string, campaign: Campaign) => void;
}) {
  const [highlight, setHighlight] = useState(currentId ?? EMAIL_TEMPLATES[0].id);
  const [query, setQuery] = useState("");
  if (!open) return null;

  const list = EMAIL_TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const active = EMAIL_TEMPLATES.find((t) => t.id === highlight) ?? EMAIL_TEMPLATES[0];
  const preview = active.build();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-900/60 p-3 backdrop-blur-sm">
      <div
        role="dialog"
        aria-label="Choose email design"
        className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-zinc-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold tracking-tight">Choose an email design</h2>
            <p className="mt-0.5 text-[12.5px] text-zinc-500">
              The design sets the shell — logo, hero, colours and footer. Your message content is
              kept.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close template picker"
            className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={17} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-h-0 overflow-y-auto p-6">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search designs…"
                aria-label="Search designs"
                className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-zinc-900"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {list.map((t) => {
                const selected = t.id === highlight;
                return (
                  <button
                    key={t.id}
                    onClick={() => setHighlight(t.id)}
                    aria-pressed={selected}
                    className={`group overflow-hidden rounded-xl border text-left transition-all ${
                      selected
                        ? "border-zinc-900 ring-2 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <div className="relative flex justify-center bg-zinc-50 p-3">
                      <ScaledEmail campaign={t.build()} width={220} height={150} />
                      {selected && (
                        <span className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-zinc-900 text-white">
                          <Check size={13} />
                        </span>
                      )}
                    </div>
                    <div className="border-t border-zinc-100 p-3">
                      <p className="text-[13px] font-semibold text-zinc-900">{t.name}</p>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-500">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
              {list.length === 0 && (
                <p className="text-[13px] text-zinc-500">No designs match “{query}”.</p>
              )}
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col border-l border-zinc-100 bg-zinc-50 md:flex">
            <div className="shrink-0 border-b border-zinc-100 px-5 py-3">
              <p className="text-[13px] font-semibold">{active.name}</p>
              <p className="text-[11.5px] text-zinc-500">Full preview</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <ScaledEmail campaign={preview} width={288} height={720} />
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-zinc-100 px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-zinc-200 px-5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(active.id, active.build())}
            className="h-10 rounded-lg bg-zinc-900 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Use this design
          </button>
        </footer>
      </div>
    </div>
  );
}
