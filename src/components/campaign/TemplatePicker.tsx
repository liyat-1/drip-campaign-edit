import { useState } from "react";
import { Check, X, Search, Sun, Moon, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ScaledEmail } from "./ScaledEmail";
import { EMAIL_TEMPLATES } from "@/lib/templates";
import type { Campaign } from "@/lib/campaign";

/**
 * Full-screen picker for saved email designs. Two tabs: browse the saved
 * layouts, or open "Edit & test" to jump into the template studio and send a
 * test send before applying. The right column always previews the highlighted
 * design (light or dark).
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
  const [tab, setTab] = useState<"templates" | "edit">("templates");
  const [testEmail, setTestEmail] = useState("");
  const [sent, setSent] = useState(false);
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
        className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white shadow-2xl"
      >
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-6 pb-0 pt-5">
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold tracking-tight">Choose email design</h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-zinc-600">
              Pick a saved email design for this campaign. This updates the email shell (logo, hero,
              colors, footer). Message content is not changed.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close template picker"
            className="grid size-8 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="flex min-h-0 flex-col overflow-hidden px-6">
            {/* Tabs */}
            <div className="mt-4 flex shrink-0 gap-6 border-b border-zinc-200">
              {(
                [
                  { id: "templates" as const, label: "Templates" },
                  { id: "edit" as const, label: "Edit & test" },
                ]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-selected={tab === t.id}
                  role="tab"
                  className={`-mb-px border-b-2 pb-2.5 text-[14px] font-semibold transition-colors ${
                    tab === t.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-5">
              {tab === "templates" ? (
                <>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search designs…"
                        aria-label="Search designs"
                        className="h-10 w-full rounded-md border border-zinc-200 pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-blue-600"
                      />
                    </div>
                    <div className="flex rounded-md bg-zinc-100 p-0.5">
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
                          className={`group overflow-hidden rounded-md border text-left transition-all ${
                            selected
                              ? "border-blue-600 ring-2 ring-blue-600/15"
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
                              <span className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-blue-600 text-white">
                                <Check size={13} />
                              </span>
                            )}
                          </div>
                          <div className="border-t border-zinc-100 p-3">
                            <p className="text-[13px] font-semibold text-zinc-900">{t.name}</p>
                            <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-500">
                              {t.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    {list.length === 0 && (
                      <p className="text-[13px] text-zinc-500">No designs match "{query}".</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <section className="rounded-md border border-zinc-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                          Selected layout
                        </p>
                        <p className="mt-1.5 text-[18px] font-semibold tracking-tight text-zinc-900">
                          {active.name}
                        </p>
                      </div>
                      <Link
                        to="/structured"
                        target="_blank"
                        className="flex h-11 shrink-0 items-center gap-1.5 rounded-md border border-zinc-300 px-5 text-[14px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
                      >
                        Edit design <ExternalLink size={13} />
                      </Link>
                    </div>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-zinc-600">
                      Open the editor to change logo, hero, colors, buttons, or footer. Message text
                      on this campaign is not changed when you apply.
                    </p>
                  </section>

                  <section className="rounded-md border border-zinc-200 p-5">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                      Send test email
                    </p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-600">
                      Send a test before applying. Guests will receive the same images, buttons, and
                      text you see in your inbox.
                    </p>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => {
                        setTestEmail(e.target.value);
                        setSent(false);
                      }}
                      placeholder="you@hotel.com"
                      aria-label="Test email address"
                      className="mt-3 h-11 w-full rounded-md border border-zinc-300 px-3.5 text-[14px] outline-none transition-colors focus:border-blue-600"
                    />
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        disabled={!testEmail.includes("@")}
                        onClick={() => setSent(true)}
                        className="h-10 rounded-md bg-zinc-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                      >
                        Send test
                      </button>
                      {sent && (
                        <span className="text-[12.5px] font-medium text-emerald-600">
                          Test queued to {testEmail}
                        </span>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          <aside className="hidden min-h-0 flex-col border-l border-zinc-200 md:flex">
            <div className="shrink-0 border-b border-zinc-200 px-5 py-3.5">
              <p className="text-[15px] font-semibold tracking-tight">{active.name}</p>
              <p className="mt-0.5 text-[12.5px] text-zinc-500">
                {scheme === "dark" ? "Dark mode preview" : active.desc}
              </p>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 p-4"
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

        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button
            onClick={onClose}
            className="h-11 rounded-md border border-zinc-300 px-6 text-[14px] font-medium text-zinc-800 transition-colors hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(active.id, active.build())}
            className="h-11 rounded-md bg-blue-600 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Apply design
          </button>
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
