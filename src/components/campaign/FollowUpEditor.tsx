import { Mail, MessageSquare } from "lucide-react";
import { Field, TextArea, TextInput, ToggleRow } from "../editor/controls";
import { Select } from "../editor/Select";
import { TagTextArea, type TagDef } from "./TagTextArea";
import { DELAY_UNITS, type FollowUp } from "@/lib/sequence";

/**
 * Editor for a single follow-up step. Only surfaced when a follow-up is
 * selected in the timeline — the initial message keeps the standard editors.
 */
export function FollowUpEditor({
  step,
  onChange,
  text,
  email,
  tags,
}: {
  step: FollowUp;
  onChange: (patch: Partial<FollowUp>) => void;
  text: boolean;
  email: boolean;
  tags: (TagDef & { chip: string })[];
}) {
  return (
    <div className="space-y-4 p-4">
      <Field label="Step name">
        <TextInput value={step.name} onChange={(v) => onChange({ name: v })} />
      </Field>

      <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-2">
        <Field label="Delay">
          <input
            type="number"
            min={1}
            aria-label="Delay amount"
            value={step.delay.value}
            onChange={(e) =>
              onChange({
                delay: { ...step.delay, value: Math.max(1, Number(e.target.value) || 1) },
              })
            }
            className="h-10 w-full border border-zinc-200 px-2.5 text-[13px] outline-none focus:border-blue-600"
          />
        </Field>
        <Field label="Unit">
          <Select
            value={step.delay.unit}
            options={DELAY_UNITS}
            ariaLabel="Delay unit"
            onChange={(unit) => onChange({ delay: { ...step.delay, unit } })}
          />
        </Field>
      </div>

      <ToggleRow
        label="Step is active"
        hint="Inactive steps stay in the timeline but are never sent."
        checked={step.status === "active"}
        onChange={(v) => onChange({ status: v ? "active" : "inactive" })}
      />

      <div className="h-px bg-zinc-100" />

      {text && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <MessageSquare size={12} /> Text message
          </p>
          <TagTextArea
            value={step.message}
            onChange={(v) => onChange({ message: v })}
            tags={tags}
            minHeight={110}
            placeholder="Write the follow-up text…"
          />
        </div>
      )}

      {email && (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <Mail size={12} /> Email content
          </p>
          <Field label="Subject">
            <TextInput value={step.subject} onChange={(v) => onChange({ subject: v })} />
          </Field>
          <Field label="Heading">
            <TextInput value={step.heading} onChange={(v) => onChange({ heading: v })} />
          </Field>
          <Field label="Body copy">
            <TextArea rows={4} value={step.body} onChange={(v) => onChange({ body: v })} />
          </Field>
        </div>
      )}
    </div>
  );
}
