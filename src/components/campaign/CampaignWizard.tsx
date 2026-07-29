import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  MessageSquare,
  Mail,
  Check,
  ChevronRight,
  ChevronDown,
  Users,
  Gift,
  Coins,
  Clock,
  CalendarCheck2,
  Pencil,
  LayoutTemplate,
  ImageOff,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Trash2,
  User,
  Calendar,
  Building2,
  Sparkles,
  BadgePercent,
  Repeat,
  Split,
} from "lucide-react";
import { EmailPreview, type BlockId } from "../editor/EmailPreview";
import { BLOCK_LABELS, BlockForm } from "../editor/BlockForms";
import { PhoneMockup } from "../editor/PhoneMockup";
import { SmsPreview } from "../editor/SmsPreview";
import { Select } from "../editor/Select";
import { Field, TextArea, TextInput, ToggleRow } from "../editor/controls";
import { ScaledEmail } from "./ScaledEmail";
import { TemplatePicker } from "./TemplatePicker";
import { useCampaign } from "@/lib/useCampaign";
import { createCanvasCampaign, renderTokens } from "@/lib/campaign";
import { EMAIL_TEMPLATES } from "@/lib/templates";
import { stripHtml } from "@/lib/richtext";

type Channel = "text" | "email" | "both" | "text_fallback";
const hasText = (c: Channel | null) => c === "text" || c === "both" || c === "text_fallback";
const hasEmail = (c: Channel | null) => c === "email" || c === "both" || c === "text_fallback";

const AUDIENCES = [
  { value: "everyone", label: "Everyone", hint: "All contactable past guests" },
  { value: "past_90", label: "Stayed in last 90 days", hint: "Recent check-outs" },
  { value: "loyalty", label: "Loyalty members", hint: "Silver tier and above" },
  { value: "lapsed", label: "Lapsed guests", hint: "No stay in 12 months" },
];

/** Every block is editable in the campaign editor — the design provides sensible
 * defaults, but everything (header, hero, body, cta, details, footer) can be
 * tweaked per campaign. */
const EDITABLE_BLOCKS: BlockId[] = ["header", "hero", "body", "cta", "details", "footer"];

const STEPS = [
  { id: "preferences", label: "Preferences" },
  { id: "content", label: "Content" },
  { id: "promotion", label: "Promotion" },
] as const;
type Step = (typeof STEPS)[number]["id"];

const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email Only",
  text: "Text Only",
  both: "Text + Email Together",
  text_fallback: "Text with Email Fallback",
};

const MIN_NIGHTS = [
  { value: "1", label: "1 night" },
  { value: "2", label: "2 nights" },
  { value: "3", label: "3 nights" },
  { value: "5", label: "5 nights" },
  { value: "7", label: "7 nights" },
];

/** Colourful merge-tag chips. */
type MergeTag = {
  token: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: string;
};
const MERGE_TAGS: MergeTag[] = [
  {
    token: "{{first_name}}",
    label: "First name",
    Icon: User,
    tone: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-400",
  },
  {
    token: "{{last_name}}",
    label: "Last name",
    Icon: User,
    tone: "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400",
  },
  {
    token: "{{checkout_date}}",
    label: "Checkout date",
    Icon: Calendar,
    tone: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400",
  },
  {
    token: "{{hotel}}",
    label: "Hotel",
    Icon: Building2,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400",
  },
  {
    token: "{{loyalty_tier}}",
    label: "Loyalty tier",
    Icon: Sparkles,
    tone: "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-400",
  },
];

export function CampaignWizard() {
  const { campaign, update } = useCampaign(createCanvasCampaign);

  const [created, setCreated] = useState(false);
  const [draftName, setDraftName] = useState("Campaign - new");

  const [step, setStep] = useState<Step>("preferences");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sequence, setSequence] = useState(false);
  const [audience, setAudience] = useState("everyone");
  const [startDate, setStartDate] = useState("2026-07-29");
  const [cutOff, setCutOff] = useState(false);
  const [cutOffDate, setCutOffDate] = useState("2026-08-30");

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [openBlock, setOpenBlock] = useState<BlockId | null>("body");

  const [contentTab, setContentTab] = useState<"text" | "email">("text");

  const [message, setMessage] = useState(
    "{{first_name}}! It's been a while since you booked to stay on {{checkout_date}} at {{hotel}}. Find the best hidden rates for your next trip.",
  );
  const [link, setLink] = useState("https://directful.com/r/9f2ab");
  const [textMedia, setTextMedia] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [promoOn, setPromoOn] = useState(true);
  const [promoCode, setPromoCode] = useState("DIRECT15");
  const [discount, setDiscount] = useState("15");
  const [minNights, setMinNights] = useState("1");
  const [tagline, setTagline] = useState("The best rate 15% 🎉");
  const [validRange, setValidRange] = useState(true);
  const [validFrom, setValidFrom] = useState("2026-07-29");
  const [validTo, setValidTo] = useState("2026-08-13");

  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const guests =
    audience === "everyone" ? 1840 : audience === "past_90" ? 412 : audience === "loyalty" ? 268 : 733;
  const templateReady = hasEmail(channel) && templateId !== null;
  const contentReady = hasText(channel)
    ? hasEmail(channel)
      ? templateReady
      : true
    : templateReady;
  const cost = hasText(channel) ? (guests * 0.06).toFixed(2) : "0.00";

  // Keep the visible content tab in sync with the selected channel.
  const ensureTab = (): "text" | "email" => {
    if (channel === "text") return "text";
    if (channel === "email") return "email";
    return contentTab;
  };
  const activeTab = ensureTab();

  const insertMerge = (token: string) => {
    const el = textAreaRef.current;
    if (!el) {
      setMessage((m) => `${m} ${token}`.trim());
      return;
    }
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? message.length;
    const next = message.slice(0, start) + token + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  /* ---------------- Step 0 · name the campaign ---------------- */
  if (!created) {
    return (
      <div className="grid min-h-dvh place-items-center bg-zinc-900/70 p-4 font-sans text-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draftName.trim()) return;
            update((d) => void (d.meta.name = draftName.trim()));
            setCreated(true);
          }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
            <div>
              <h1 className="text-[17px] font-semibold tracking-tight">Create new campaign</h1>
              <p className="mt-0.5 text-[12.5px] text-zinc-500">
                Name it now — you pick the channel on the next screen.
              </p>
            </div>
            <Link
              to="/"
              aria-label="Cancel"
              className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X size={17} />
            </Link>
          </div>
          <div className="border-y border-zinc-100 bg-zinc-50/70 px-6 py-5">
            <Field label="Drip campaign name">
              <TextInput value={draftName} onChange={setDraftName} placeholder="Summer reactivation" />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2.5 px-6 py-4">
            <Link
              to="/"
              className="grid h-10 place-items-center rounded-lg border border-zinc-200 px-5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="h-10 rounded-lg bg-zinc-900 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ---------------- Minimised chip ---------------- */
  if (minimized) {
    return (
      <div className="grid min-h-dvh place-items-end bg-zinc-900/70 p-4 font-sans">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-2xl">
          <Pencil size={15} className="text-zinc-400" />
          <div className="flex flex-col">
            <input
              value={campaign.meta.name}
              aria-label="Campaign name"
              onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
              className="w-56 rounded-md px-1.5 py-0.5 text-[13px] font-semibold text-zinc-900 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
            />
            <span className="px-1.5 text-[11.5px] text-zinc-500">
              {channel ? CHANNEL_LABELS[channel] : "Channel not set"} · minimised
            </span>
          </div>
          <button
            onClick={() => setMinimized(false)}
            aria-label="Resume editor"
            className="grid size-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  const chromeBtn =
    "grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30";

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const canLeavePreferences = channel !== null;
  const showPreviewCol = step !== "promotion";

  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden bg-zinc-900/70 font-sans text-zinc-900 ${
        expanded ? "p-0" : "p-0 md:p-5"
      }`}
    >
      <div
        role="dialog"
        aria-label="Create drip campaign"
        className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100 shadow-2xl ${
          expanded ? "" : "md:rounded-2xl md:border md:border-zinc-300"
        }`}
      >
        {/* Chrome */}
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <input
              value={campaign.meta.name}
              aria-label="Campaign name"
              onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
              className="min-w-0 max-w-[20rem] flex-1 truncate rounded-lg px-2 py-1.5 text-[14px] font-semibold outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
            />
            {channel && (
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 sm:flex">
                {channel === "email" ? (
                  <Mail size={12} />
                ) : channel === "text" ? (
                  <MessageSquare size={12} />
                ) : channel === "both" ? (
                  <Repeat size={12} />
                ) : (
                  <Split size={12} />
                )}
                {CHANNEL_LABELS[channel]}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => notify("Draft saved")}
              className="mr-1 hidden h-8 items-center rounded-lg border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:flex"
            >
              Save changes
            </button>
            <button className={chromeBtn} onClick={() => setMinimized(true)} aria-label="Minimise" title="Minimise">
              <Minus size={16} />
            </button>
            <button
              className={chromeBtn}
              onClick={() => setExpanded((v) => !v)}
              aria-pressed={expanded}
              aria-label={expanded ? "Exit full view" : "Full view"}
              title={expanded ? "Exit full view" : "Full view"}
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <Link to="/" className={chromeBtn} aria-label="Close campaign setup" title="Close">
              <X size={17} />
            </Link>
          </div>
        </header>

        {/* Step nav */}
        <nav
          aria-label="Campaign steps"
          className="flex shrink-0 items-center gap-1 border-b border-zinc-200 bg-white px-3 pb-2 sm:px-4"
        >
          {STEPS.map((s, i) => {
            const locked = s.id !== "preferences" && !canLeavePreferences;
            const done = i < stepIndex;
            return (
              <button
                key={s.id}
                disabled={locked}
                onClick={() => setStep(s.id)}
                aria-current={step === s.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40 ${
                  step === s.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                <span
                  className={`grid size-5 place-items-center rounded-full text-[10.5px] font-semibold ${
                    step === s.id ? "bg-white/20" : done ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100"
                  }`}
                >
                  {done ? <Check size={11} /> : i + 1}
                </span>
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Body: editor + preview */}
        <div
          className={`grid min-h-0 flex-1 grid-cols-1 overflow-hidden ${
            showPreviewCol ? "lg:grid-cols-[28rem_minmax(0,1fr)]" : ""
          }`}
        >
          <section className="min-h-0 space-y-6 overflow-y-auto border-r border-zinc-200 bg-white p-5">
            {step === "preferences" && (
              <>
                <SectionHeader
                  title="Message channel strategy"
                  hint="Decides what you edit and how it's previewed."
                />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <ChannelCard
                    active={channel === "email"}
                    Icon={Mail}
                    title="Email Only"
                    body="Rich, branded email to opted-in guests."
                    onClick={() => setChannel("email")}
                  />
                  <ChannelCard
                    active={channel === "text"}
                    Icon={MessageSquare}
                    title="Text Only"
                    body="Short SMS with a tracked link."
                    onClick={() => setChannel("text")}
                  />
                  <ChannelCard
                    active={channel === "both"}
                    Icon={Repeat}
                    title="Text + Email Together"
                    body="Both channels fire in sequence."
                    onClick={() => setChannel("both")}
                  />
                  <ChannelCard
                    active={channel === "text_fallback"}
                    Icon={Split}
                    title="Text with Email Fallback"
                    body="Try SMS first, email guests without a phone."
                    onClick={() => setChannel("text_fallback")}
                  />
                </div>

                <div className="pt-2">
                  <SectionHeader title="Delivery" />
                </div>
                <div className="space-y-4 rounded-xl border border-zinc-200 p-4">
                  <ToggleRow
                    label="Enable message sequence"
                    hint="Send automatic follow-ups with configurable delays between steps."
                    checked={sequence}
                    onChange={setSequence}
                  />
                  <div className="h-px bg-zinc-100" />
                  <Field label="Audience" hint={`Approx. ${guests.toLocaleString()} guests`}>
                    <Select ariaLabel="Audience" value={audience} options={AUDIENCES} onChange={setAudience} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start sending on">
                      <TextInput type="date" value={startDate} onChange={setStartDate} />
                    </Field>
                    {cutOff && (
                      <Field label="Stop sending on">
                        <TextInput type="date" value={cutOffDate} onChange={setCutOffDate} />
                      </Field>
                    )}
                  </div>
                  <div className="h-px bg-zinc-100" />
                  <ToggleRow
                    label="Add cut-off date"
                    hint="Stop sending automatically at a certain date."
                    checked={cutOff}
                    onChange={setCutOff}
                  />
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <CalendarCheck2 size={22} className="text-emerald-600" />
                    <div>
                      <p className="text-[12px] font-medium text-emerald-800/70">Estimated end date</p>
                      <p className="text-[16px] font-semibold text-emerald-900">
                        {cutOff ? "Aug 30, 2026" : "Jul 30, 2026"}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2.5 text-[13px] text-emerald-900/90">
                    <li className="flex items-center gap-2.5">
                      <Users size={16} className="text-emerald-600" />
                      {guests.toLocaleString()} guests will be reached
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Gift size={16} className="text-emerald-600" />
                      {hasText(channel) ? "250 complimentary texts" : "Unlimited emails on your plan"}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Coins size={16} className="text-emerald-600" />${cost} approx. (
                      {hasText(channel) ? "$0.06 / text" : "$0.00 / email"})
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock size={16} className="text-emerald-600" />
                      Sent around 5pm in each guest&rsquo;s time zone
                    </li>
                  </ul>
                </div>
              </>
            )}

            {step === "content" && (
              <>
                {/* Tabs only when the channel has both surfaces */}
                {(channel === "both" || channel === "text_fallback") && (
                  <div className="flex rounded-lg bg-zinc-100 p-1">
                    {(
                      [
                        { id: "text" as const, Icon: MessageSquare, label: "Text content" },
                        { id: "email" as const, Icon: Mail, label: "Email design" },
                      ]
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setContentTab(t.id)}
                        aria-pressed={activeTab === t.id}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-[12.5px] font-medium transition-colors ${
                          activeTab === t.id
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        <t.Icon size={14} /> {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === "text" && hasText(channel) && (
                  <>
                    <SectionHeader title="Message" hint="Keep it under 160 chars for a single SMS." />
                    <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
                      <Field
                        label="Text message"
                        hint={`${renderTokens(message).length + (link ? link.length + 1 : 0)} chars`}
                      >
                        <TextArea
                          rows={5}
                          value={message}
                          onChange={setMessage}
                          inputRef={textAreaRef}
                        />
                      </Field>
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                          Merge tags
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {MERGE_TAGS.map((t) => (
                            <button
                              key={t.token}
                              onClick={() => insertMerge(t.token)}
                              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${t.tone}`}
                            >
                              <t.Icon size={12} /> {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Field label="Tracked link" hint="Shortened per guest">
                        <TextInput value={link} onChange={setLink} placeholder="https://…" />
                      </Field>
                    </div>

                    <SectionHeader title="Media" hint="Adds an image above your message." />
                    <MediaUploader value={textMedia} onChange={setTextMedia} />

                    <div className="rounded-xl border border-zinc-200 p-4">
                      <Field label="Send a test">
                        <div className="flex gap-2">
                          <TextInput value={testTo} onChange={setTestTo} placeholder="+30 690 000 0000" />
                          <button
                            onClick={() => notify("Test text sent")}
                            className="h-10 shrink-0 rounded-lg border border-zinc-200 px-4 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                          >
                            Send test
                          </button>
                        </div>
                      </Field>
                    </div>
                  </>
                )}

                {activeTab === "email" && hasEmail(channel) && !templateReady && (
                  <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                    <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200">
                      <LayoutTemplate size={19} />
                    </span>
                    <p className="mt-3 text-[14px] font-semibold text-zinc-900">
                      Start by choosing an email design
                    </p>
                    <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-zinc-500">
                      Header, hero, body, colours and footer come from the template — you can tweak
                      every section afterwards.
                    </p>
                    <button
                      onClick={() => setPicker(true)}
                      className="mt-4 h-10 rounded-lg bg-zinc-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                      Choose a design
                    </button>
                  </div>
                )}

                {activeTab === "email" && templateReady && (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3">
                      <ScaledEmail campaign={campaign} width={92} height={66} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-zinc-900">
                          {EMAIL_TEMPLATES.find((t) => t.id === templateId)?.name}
                        </p>
                        <p className="text-[11.5px] text-zinc-500">Selected design</p>
                      </div>
                      <button
                        onClick={() => setPicker(true)}
                        className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                      >
                        Change <ChevronRight size={14} />
                      </button>
                    </div>

                    <SectionHeader title="Inbox" />
                    <div className="space-y-4 rounded-xl border border-zinc-200 p-4">
                      <Field label="Email subject" hint={`${stripHtml(campaign.meta.subject).length}/90`}>
                        <TextInput
                          value={campaign.meta.subject}
                          onChange={(v) => update((d) => void (d.meta.subject = v))}
                        />
                      </Field>
                      <Field label="Preheader text">
                        <TextArea
                          rows={2}
                          value={campaign.meta.preheader}
                          onChange={(v) => update((d) => void (d.meta.preheader = v))}
                        />
                      </Field>
                    </div>

                    <SectionHeader
                      title="Design sections"
                      hint="Every block is editable — reset with the template picker."
                    />
                    <div className="overflow-hidden rounded-xl border border-zinc-200">
                      {EDITABLE_BLOCKS.map((id) => (
                        <div key={id} className="border-b border-zinc-100 last:border-b-0">
                          <button
                            onClick={() => setOpenBlock((b) => (b === id ? null : id))}
                            aria-expanded={openBlock === id}
                            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-50"
                          >
                            <span className="text-[13px] font-medium text-zinc-800">
                              {BLOCK_LABELS[id]}
                            </span>
                            <ChevronDown
                              size={15}
                              className={`text-zinc-400 transition-transform ${
                                openBlock === id ? "" : "-rotate-90"
                              }`}
                            />
                          </button>
                          {openBlock === id && (
                            <div className="border-t border-zinc-100 bg-zinc-50/50">
                              <BlockForm id={id} campaign={campaign} update={update} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-zinc-200 p-4">
                      <Field label="Send a test">
                        <div className="flex gap-2">
                          <TextInput value={testTo} onChange={setTestTo} placeholder="you@hotel.com" />
                          <button
                            onClick={() => notify("Test email sent")}
                            className="h-10 shrink-0 rounded-lg border border-zinc-200 px-4 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                          >
                            Send test
                          </button>
                        </div>
                      </Field>
                    </div>
                  </>
                )}
              </>
            )}

            {step === "promotion" && (
              <>
                <SectionHeader
                  title="Promotion"
                  hint="Personalised discount shown across every channel."
                />
                <div className="rounded-xl border border-zinc-200 p-4">
                  <ToggleRow
                    label="Use promotion"
                    hint="Turn off to send the campaign without a discount."
                    checked={promoOn}
                    onChange={setPromoOn}
                  />
                </div>

                {promoOn && (
                  <>
                    <div className="space-y-4 rounded-xl border border-zinc-200 p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Offer promo code">
                          <TextInput value={promoCode} onChange={setPromoCode} />
                        </Field>
                        <Field label="Minimum nights to stay">
                          <Select
                            ariaLabel="Minimum nights"
                            value={minNights}
                            options={MIN_NIGHTS}
                            onChange={setMinNights}
                          />
                        </Field>
                      </div>
                      <Field label="Offer discount percentage" hint="% off direct bookings">
                        <TextInput value={discount} onChange={setDiscount} />
                      </Field>
                      <Field label="Offer tagline" hint="Shown on the promo card">
                        <TextInput value={tagline} onChange={setTagline} placeholder="The best rate 50% 🎉" />
                      </Field>
                    </div>

                    <div className="space-y-4 rounded-xl border border-zinc-200 p-4">
                      <ToggleRow
                        label="Offer is valid between specific dates"
                        checked={validRange}
                        onChange={setValidRange}
                      />
                      {validRange && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Valid from">
                            <TextInput type="date" value={validFrom} onChange={setValidFrom} />
                          </Field>
                          <Field label="Valid to">
                            <TextInput type="date" value={validTo} onChange={setValidTo} />
                          </Field>
                        </div>
                      )}
                    </div>

                    <SectionHeader title="Promo card preview" hint="Shown to the guest." />
                    <PromoPreviewCard
                      accent={campaign.theme.accent}
                      hotel={campaign.footer.company || campaign.header.logoText}
                      firstName="Liyat"
                      tagline={tagline}
                      discount={discount}
                    />
                  </>
                )}
              </>
            )}
          </section>

          {/* Preview column */}
          {showPreviewCol && (
            <section className="relative hidden min-h-0 flex-col overflow-hidden bg-zinc-100 lg:flex">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/70 px-4 py-2 backdrop-blur">
                <p className="text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
                  Preview
                </p>
                {step === "content" && activeTab === "email" && templateReady && (
                  <div className="flex rounded-lg bg-zinc-200/70 p-0.5">
                    {(
                      [
                        { id: "desktop" as const, Icon: Monitor, label: "Desktop" },
                        { id: "mobile" as const, Icon: Smartphone, label: "Mobile" },
                      ]
                    ).map(({ id, Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setDevice(id)}
                        aria-pressed={device === id}
                        title={label}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                          device === id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
                        }`}
                      >
                        <Icon size={13} /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {step === "preferences" && (
                  <EmptyPreview
                    title={
                      channel ? CHANNEL_LABELS[channel] : "Pick a channel to see the preview"
                    }
                    body={
                      channel
                        ? "Move to the Content step to design your message and see it live."
                        : "Text campaigns preview on a phone. Email campaigns preview on desktop and mobile."
                    }
                  />
                )}

                {step === "content" && activeTab === "text" && hasText(channel) && (
                  <div className="flex justify-center">
                    <SmsPreview
                      message={message}
                      link={link}
                      imageUrl={textMedia}
                      sender={campaign.footer.company || campaign.header.logoText}
                      scale={0.8}
                    />
                  </div>
                )}

                {step === "content" && activeTab === "email" && hasEmail(channel) && !templateReady && (
                  <div className="relative mx-auto max-w-[620px]">
                    <div className="pointer-events-none select-none opacity-30 blur-[2px] grayscale">
                      <EmailPreview campaign={campaign} interactive={false} width={600} />
                    </div>
                    <div className="absolute inset-0 grid place-items-start justify-center pt-24">
                      <div className="rounded-2xl border border-zinc-200 bg-white/95 px-6 py-5 text-center shadow-xl backdrop-blur">
                        <span className="mx-auto grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-500">
                          <ImageOff size={18} />
                        </span>
                        <p className="mt-3 text-[14px] font-semibold text-zinc-900">
                          No email design selected yet
                        </p>
                        <p className="mt-1 max-w-xs text-[12.5px] text-zinc-500">
                          Please select a template to preview and edit your email.
                        </p>
                        <button
                          onClick={() => setPicker(true)}
                          className="mt-3 h-9 rounded-lg bg-zinc-900 px-4 text-[12.5px] font-semibold text-white hover:bg-zinc-800"
                        >
                          Select a template
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === "content" && activeTab === "email" && templateReady &&
                  (device === "desktop" ? (
                    <EmailPreview campaign={campaign} interactive={false} width={600} />
                  ) : (
                    <div className="flex justify-center">
                      <PhoneMockup scale={0.78}>
                        <EmailPreview campaign={campaign} interactive={false} width={373} />
                      </PhoneMockup>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3">
          <p className="truncate text-[12px] text-zinc-500">
            {step === "preferences" && !channel
              ? "Select a channel strategy to continue."
              : step === "content" && hasEmail(channel) && !templateReady
                ? "Select an email design to unlock the content editor."
                : `Step ${stepIndex + 1} of ${STEPS.length}`}
          </p>
          <div className="flex items-center gap-2.5">
            {stepIndex > 0 && (
              <button
                onClick={() => setStep(STEPS[stepIndex - 1].id)}
                className="h-10 rounded-lg border border-zinc-200 px-5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Back
              </button>
            )}
            <button
              disabled={
                (step === "preferences" && !canLeavePreferences) ||
                (step === "content" && !contentReady)
              }
              onClick={() => {
                if (stepIndex === STEPS.length - 1) return notify("Campaign scheduled");
                setStep(STEPS[stepIndex + 1].id);
              }}
              className="h-10 rounded-lg bg-zinc-900 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stepIndex === STEPS.length - 1 ? "Schedule campaign" : "Next"}
            </button>
          </div>
        </footer>
      </div>

      <TemplatePicker
        open={picker}
        currentId={templateId}
        onClose={() => setPicker(false)}
        onApply={(id, next) => {
          const name = campaign.meta.name;
          update((d) => {
            Object.assign(d, next);
            d.meta.name = name;
          });
          setTemplateId(id);
          setPicker(false);
          notify("Design applied");
        }}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-[12.5px] font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-zinc-900">{title}</p>
      {hint && <p className="mt-0.5 text-[12px] text-zinc-500">{hint}</p>}
    </div>
  );
}

function ChannelCard({
  active,
  Icon,
  title,
  body,
  onClick,
}: {
  active: boolean;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
        active
          ? "border-zinc-900 bg-zinc-900/[0.03] ring-2 ring-zinc-900/10"
          : "border-zinc-200 hover:border-zinc-400"
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-lg ${
          active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-zinc-900">{title}</span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-zinc-500">{body}</span>
      </span>
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
          active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300"
        }`}
      >
        {active && <Check size={12} />}
      </span>
    </button>
  );
}

function MediaUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    onChange(URL.createObjectURL(f));
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-[12px] leading-relaxed text-amber-900">
          Adding an image is <strong>strongly recommended</strong> — MMS previews get much higher
          engagement. Max 500 KB.
        </p>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-zinc-200">
          <img src={value} alt="" className="block max-h-56 w-full object-cover" />
          <button
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-md ring-1 ring-zinc-200 transition-colors hover:bg-white hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            drag ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 hover:border-zinc-400"
          }`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-500">
            <ImageIcon size={18} />
          </span>
          <div>
            <p className="text-[13px] font-medium text-zinc-800">Drop a file here</p>
            <p className="text-[11.5px] text-zinc-500">or click to browse</p>
          </div>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700">
            <Upload size={12} /> Select file
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

function PromoPreviewCard({
  accent,
  hotel,
  firstName,
  tagline,
  discount,
}: {
  accent: string;
  hotel: string;
  firstName: string;
  tagline: string;
  discount: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, color-mix(in oklab, ${accent} 60%, #0f172a) 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Exclusive offer
          </p>
          <p className="mt-1 text-[15px] font-semibold">{hotel || "Your hotel"}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur">
          <BadgePercent size={18} />
        </span>
      </div>

      <div className="mt-8">
        <div className="inline-block rounded-md bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-zinc-900 shadow-md">
          {firstName.toUpperCase()}, you unlocked
        </div>
        <div className="mt-2 -rotate-1 rounded-lg bg-black/25 px-4 py-3 shadow-lg ring-1 ring-white/10 backdrop-blur">
          <p className="text-[22px] font-black uppercase tracking-wide">
            {tagline || `The best rate ${discount}%`}
          </p>
        </div>
      </div>

      <p className="mt-6 text-[11.5px] text-white/70">
        {discount}% off direct bookings · promo card previewed as the guest sees it.
      </p>
    </div>
  );
}

function EmptyPreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid h-full place-items-center">
      <div className="max-w-xs text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-zinc-400 ring-1 ring-zinc-200">
          <Monitor size={18} />
        </span>
        <p className="mt-3 text-[14px] font-semibold text-zinc-800">{title}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">{body}</p>
      </div>
    </div>
  );
}
