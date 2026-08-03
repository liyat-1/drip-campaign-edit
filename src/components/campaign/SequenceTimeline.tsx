import { Mail, MessageSquare, Plus, Timer, Trash2, Zap } from "lucide-react";
import { Select } from "../editor/Select";
import { DELAY_UNITS, INITIAL_STEP_ID, type FollowUp, type SeqStatus } from "@/lib/sequence";

const STATUS_DOT: Record<SeqStatus | "editing", string> = {
  active: "bg-emerald-500",
  inactive: "bg-zinc-300",
  draft: "bg-amber-400",
  editing: "bg-blue-600",
};

const STATUS_LABEL: Record<SeqStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
};

function ChannelBadges({ text, email }: { text: boolean; email: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {email && (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-medium text-zinc-600">
          <Mail size={10} /> Email
        </span>
      )}
      {text && (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-medium text-zinc-600">
          <MessageSquare size={10} /> SMS
        </span>
      )}
    </span>
  );
}

function Connector() {
  return (
    <div className="flex justify-center">
      <span className="h-3 w-px bg-zinc-200" />
    </div>
  );
}

function StepCard({
  title,
  excerpt,
  status,
  selected,
  meta,
  text,
  email,
  onClick,
  onDelete,
}: {
  title: string;
  excerpt: string;
  status: SeqStatus;
  selected: boolean;
  meta: string;
  text: boolean;
  email: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`group relative border transition-colors duration-200 ${
        selected ? "border-blue-600 bg-blue-50/60" : "border-zinc-200 bg-white hover:border-zinc-400"
      }`}
    >
      <button onClick={onClick} className="block w-full px-3 py-2.5 text-left">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={`size-2 shrink-0 rounded-full ${
              selected ? STATUS_DOT.editing : STATUS_DOT[status]
            }`}
          />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-zinc-900">
            {title}
          </span>
          <span className="shrink-0 text-[11px] font-medium text-zinc-400">
            {selected ? "Editing" : STATUS_LABEL[status]}
          </span>
        </span>
        <span className="mt-1 block truncate pl-4 text-[11.5px] text-zinc-500">{excerpt}</span>
        <span className="mt-2 flex items-center gap-2 pl-4">
          <ChannelBadges text={text} email={email} />
          <span className="truncate text-[10.5px] text-zinc-400">{meta}</span>
        </span>
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label={`Remove ${title}`}
          className="absolute right-1.5 top-1.5 hidden size-7 place-items-center text-zinc-400 transition-colors hover:text-red-600 group-hover:grid"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

function DelayCard({
  step,
  onChange,
}: {
  step: FollowUp;
  onChange: (d: FollowUp["delay"]) => void;
}) {
  return (
    <div className="flex items-center gap-2 border border-dashed border-zinc-200 bg-zinc-50/70 px-3 py-2">
      <Timer size={13} className="shrink-0 text-zinc-400" />
      <span className="flex-1 text-[11.5px] font-medium text-zinc-500">Wait before sending</span>
      <input
        type="number"
        min={1}
        aria-label="Delay amount"
        value={step.delay.value}
        onChange={(e) => onChange({ ...step.delay, value: Math.max(1, Number(e.target.value) || 1) })}
        className="h-8 w-12 border border-zinc-200 bg-white px-1.5 text-center text-[12px] outline-none focus:border-blue-600"
      />
      <div className="w-[6.5rem]">
        <Select
          size="sm"
          ariaLabel="Delay unit"
          value={step.delay.unit}
          options={DELAY_UNITS}
          onChange={(unit) => onChange({ ...step.delay, unit })}
        />
      </div>
    </div>
  );
}

/**
 * Campaign timeline: the initial message plus every follow-up, in send order.
 * Clicking a card swaps the editor and the live preview in place.
 */
export function SequenceTimeline({
  steps,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onDelay,
  initialExcerpt,
  text,
  email,
}: {
  steps: FollowUp[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onDelay: (id: string, d: FollowUp["delay"]) => void;
  initialExcerpt: string;
  text: boolean;
  email: boolean;
}) {
  return (
    <div className="space-y-0 p-4">
      <div className="mb-3 flex items-center gap-3 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" /> Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" /> Draft
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-600" /> Editing
        </span>
      </div>

      <StepCard
        title="Initial message"
        excerpt={initialExcerpt || "Your campaign message"}
        status="active"
        selected={selectedId === INITIAL_STEP_ID}
        meta="Sent immediately"
        text={text}
        email={email}
        onClick={() => onSelect(INITIAL_STEP_ID)}
      />

      {steps.map((s) => (
        <div key={s.id} className="animate-in fade-in duration-200">
          <Connector />
          <DelayCard step={s} onChange={(d) => onDelay(s.id, d)} />
          <Connector />
          <StepCard
            title={s.name}
            excerpt={text ? s.message : s.subject}
            status={s.status}
            selected={selectedId === s.id}
            meta={`After the previous message`}
            text={text}
            email={email}
            onClick={() => onSelect(s.id)}
            onDelete={() => onDelete(s.id)}
          />
        </div>
      ))}

      {steps.length === 0 ? (
        <>
          <Connector />
          <button
            onClick={onAdd}
            className="flex w-full flex-col items-center gap-1 border border-dashed border-zinc-300 bg-zinc-50/60 px-3 py-5 text-center transition-colors hover:border-blue-600 hover:bg-blue-50/50"
          >
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-700">
              <Zap size={14} /> Add your first follow-up
            </span>
            <span className="max-w-[17rem] text-[11.5px] leading-relaxed text-zinc-500">
              Automatically remind guests who didn&apos;t engage with your first message.
            </span>
          </button>
        </>
      ) : (
        <>
          <Connector />
          <button
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-1.5 border border-dashed border-zinc-300 px-3 py-2.5 text-[12.5px] font-semibold text-zinc-600 transition-colors hover:border-blue-600 hover:text-blue-700"
          >
            <Plus size={14} /> Add follow-up
          </button>
        </>
      )}
    </div>
  );
}
