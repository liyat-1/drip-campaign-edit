import { useState } from "react";
import { Check, X, Search, Sun, Moon, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ScaledEmail } from "./ScaledEmail";
import { EMAIL_TEMPLATES } from "@/lib/templates";
import type { Campaign } from "@/lib/campaign";

/**
 * Full-screen picker for saved email designs. Each thumbnail shows both a
 * light and dark rendering so users know what to expect. "Edit design" opens
 * the picked template in the full structured builder — separate from the
 * campaign wizard, where only the content is editable.
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
  const [scheme, setScheme] = useState<"light" | "dark">("light");
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
              The design sets the shell — logo, hero, colours and footer are locked when you edit
              the campaign. Only body copy, buttons and details change.
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
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search designs…"
                  aria-label="Search designs"
                  className="h-10 w-full rounded-lg border border-zinc-200 pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-zinc-900"
                />
              </div>
              <div className="flex rounded-lg bg-zinc-100 p-0.5">
                {(
                  [
                    { id: "light" as const, Icon: Sun, label: "Light" },
                    { id: "dark" as const, Icon: Moon, label: "Dark" },
                  ]
                ).map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setScheme(id)}
                    aria-pressed={scheme === id}
                    title={`${label} preview`}
                    className={`flex items-center gap-1.5 rounded-md px-3 text-[12px] font-medium transition-colors ${
                      scheme === id
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {list.map((t) => {
                const selected = t.id === highlight;
                const campaign = t.build();
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
                    <div
                      className="relative flex justify-center p-3"
                      style={{ background: scheme === "dark" ? "#141518" : "#f4f4f5" }}
                    >
                      <ScaledEmail
                        campaign={scheme === "dark" ? toDark(campaign) : campaign}
                        width={220}
                        height={150}
                      />
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
                <p className="text-[13px] text-zinc-500">No designs match "{query}".</p>
              )}
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col border-l border-zinc-100 bg-zinc-50 md:flex">
            <div className="shrink-0 border-b border-zinc-100 px-5 py-3">
              <p className="text-[13px] font-semibold">{active.name}</p>
              <p className="text-[11.5px] text-zinc-500">
                {scheme === "dark" ? "Dark mode preview" : "Full preview"}
              </p>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto p-4"
              style={{ background: scheme === "dark" ? "#141518" : undefined }}
            >
              <ScaledEmail
                campaign={scheme === "dark" ? toDark(preview) : preview}
                width={288}
                height={720}
              />
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-t border-zinc-100 px-6 py-4">
          <Link
            to="/structured"
            target="_blank"
            className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ExternalLink size={13} /> Edit design in template studio
          </Link>
          <div className="flex items-center gap-2.5">
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
          </div>
        </footer>
      </div>
    </div>
  );
}

/** Lightweight dark-mode transform for template thumbnails. */
function toDark(c: Campaign): Campaign {
  const d: Campaign = JSON.parse(JSON.stringify(c));
  d.theme.pageBg = "#141518";
  d.theme.cardBg = "#1b1c1f";
  d.theme.text = "#e5e7eb";
  d.theme.muted = "#a1a1aa";
  d.header.bg = "#1b1c1f";
  d.body.headingColor = "#f4f4f5";
  d.body.textColor = "#c8cbd1";
  d.footer.bg = "#1b1c1f";
  d.footer.text = "#a1a1aa";
  return d;
}
