import { Plus, Flag, Pencil, GitBranch, Trash2, Play, Mail, MessageSquare } from "lucide-react";
import { delayLabel, ruleSentence, type FollowUp, type Rule } from "@/lib/sequence";

/**
 * The workflow is the visual story of the campaign — never an editor.
 * Cards show a short excerpt of the message; clicking one opens the overlay.
 */

function Rail({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1.5">
      <span className="h-4 w-px bg-zinc-300" />
      {label && (
        <span className="my-1 border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-500">
          {label}
        </span>
      )}
      <span className="h-4 w-px bg-zinc-300" />
    </div>
  );
}

function Excerpt({ text }: { text: string }) {
  return (
    <div className="relative mt-2.5 max-h-[4.6rem] overflow-hidden">
      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-zinc-600">{text}</p>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

function ChannelBadges({ text, email }: { text: boolean; email: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {text && (
        <span className="grid size-5 place-items-center bg-zinc-100 text-zinc-500" title="Text">
          <MessageSquare size={11} />
        </span>
      )}
      {email && (
        <span className="grid size-5 place-items-center bg-zinc-100 text-zinc-500" title="Email">
          <Mail size={11} />
        </span>
      )}
    </span>
  );
}

export function WorkflowCanvas({
  initialExcerpt,
  followUps,
  rules,
  text,
  email,
  onOpen,
  onToggleInclude,
  onAddFollowUp,
  onAddRule,
  onRemoveRule,
}: {
  initialExcerpt: string;
  followUps: FollowUp[];
  rules: Rule[];
  text: boolean;
  email: boolean;
  onOpen: (id: string) => void;
  onToggleInclude: (id: string, v: boolean) => void;
  onAddFollowUp: () => void;
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        <Play size={12} /> Campaign starts
      </div>

      <Rail />

      {/* Initial message */}
      <button
        onClick={() => onOpen("initial")}
        className="group block w-full border border-zinc-300 bg-white p-4 text-left transition-all hover:border-blue-600 hover:shadow-[0_8px_24px_-12px_rgba(37,99,235,0.45)]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[13.5px] font-semibold text-zinc-900">Initial message</span>
            <span className="bg-emerald-50 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-emerald-700">
              Always sent
            </span>
          </span>
          <ChannelBadges text={text} email={email} />
        </div>
        <Excerpt text={initialExcerpt || "Write your first message…"} />
        <span className="mt-2 flex items-center gap-1.5 border-t border-zinc-100 pt-2.5 text-[11.5px] font-medium text-zinc-400 transition-colors group-hover:text-blue-600">
          <Pencil size={12} /> Click to edit this message
        </span>
      </button>

      {followUps.map((f) => (
        <div key={f.id}>
          <Rail label={delayLabel(f.delay)} />
          <div
            className={`border bg-white transition-all ${
              f.included ? "border-zinc-300" : "border-dashed border-zinc-300 bg-zinc-50/60"
            }`}
          >
            <button
              onClick={() => onOpen(f.id)}
              className="group block w-full p-4 text-left transition-colors hover:bg-blue-50/30"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className={`size-1.5 rounded-full ${f.included ? "bg-blue-600" : "bg-zinc-300"}`}
                  />
                  <span
                    className={`text-[13.5px] font-semibold ${
                      f.included ? "text-zinc-900" : "text-zinc-500"
                    }`}
                  >
                    {f.name}
                  </span>
                  {!f.included && (
                    <span className="bg-zinc-100 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-zinc-500">
                      Optional
                    </span>
                  )}
                </span>
                <ChannelBadges text={text} email={email} />
              </div>
              <Excerpt text={text && !email ? f.message : f.body} />
              <span className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-zinc-400 transition-colors group-hover:text-blue-600">
                <Pencil size={12} /> Click to edit this message
              </span>
            </button>
            <label className="flex cursor-pointer items-center gap-2.5 border-t border-zinc-100 px-4 py-2.5">
              <input
                type="checkbox"
                checked={f.included}
                onChange={(e) => onToggleInclude(f.id, e.target.checked)}
                className="size-4 accent-blue-600"
              />
              <span
                className={`text-[12.5px] font-medium ${
                  f.included ? "text-zinc-800" : "text-zinc-500"
                }`}
              >
                Include this follow-up
              </span>
            </label>
          </div>
        </div>
      ))}

      <Rail />

      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={onAddFollowUp}
          className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3.5 py-2 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
        >
          <Plus size={14} /> Add follow-up
        </button>
        <button
          onClick={onAddRule}
          className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3.5 py-2 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
        >
          <GitBranch size={14} /> Add rule
        </button>
      </div>

      {rules.length > 0 && (
        <div className="mt-5 space-y-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 border border-blue-200 bg-blue-50/60 px-3.5 py-2.5"
            >
              <span className="text-[12.5px] font-medium text-blue-900">{ruleSentence(r)}</span>
              <button
                onClick={() => onRemoveRule(r.id)}
                aria-label="Remove rule"
                className="grid size-7 place-items-center text-blue-500 transition-colors hover:bg-white hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Rail />

      <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        <Flag size={12} /> Campaign ends
      </div>
    </div>
  );
}
