import { useState } from "react";
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
  Lock,
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
import { createCanvasCampaign, renderTokens, MERGE_TOKENS } from "@/lib/campaign";
import { EMAIL_TEMPLATES } from "@/lib/templates";
import { stripHtml } from "@/lib/richtext";

type Channel = "text" | "email";

const AUDIENCES = [
  { value: "everyone", label: "Everyone", hint: "All contactable past guests" },
  { value: "past_90", label: "Stayed in last 90 days", hint: "Recent check-outs" },
  { value: "loyalty", label: "Loyalty members", hint: "Silver tier and above" },
  { value: "lapsed", label: "Lapsed guests", hint: "No stay in 12 months" },
];

/** Blocks the guest-facing design owns — locked while a saved design is in use. */
const LOCKED_BLOCKS: BlockId[] = ["header", "hero"];
const EDITABLE_BLOCKS: BlockId[] = ["body", "cta", "details", "footer"];

const STEPS = [
  { id: "preferences", label: "Preferences" },
  { id: "content", label: "Content" },
  { id: "promotion", label: "Promotion" },
] as const;
type Step = (typeof STEPS)[number]["id"];

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

  const [message, setMessage] = useState(
    "{{first_name}}! It's been a while since you booked to stay on {{checkout_date}} at {{hotel}}. Find the best hidden rates for your next trip.",
  );
  const [link, setLink] = useState("https://directful.com/r/9f2ab");
  const [promoCode, setPromoCode] = useState("DIRECT15");
  const [discount, setDiscount] = useState("15");
  const [testTo, setTestTo] = useState("");

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
  const isText = channel === "text";
  const isEmail = channel === "email";
  const templateReady = isEmail && templateId !== null;
  const contentReady = isText || templateReady;
  const cost = isText ? (guests * 0.06).toFixed(2) : "0.00";

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
              {channel ? (isText ? "Text only" : "Email only") : "Channel not set"} · minimised
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
                {isText ? <MessageSquare size={12} /> : <Mail size={12} />}
                {isText ? "Text only" : "Email only"}
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
                {s.id === "content" && channel ? (isText ? "Text content" : "Email design") : s.label}
              </button>
            );
          })}
        </nav>

        {/* Body: editor + preview */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[26rem_minmax(0,1fr)]">
          <section className="min-h-0 space-y-6 overflow-y-auto border-r border-zinc-200 bg-white p-5">
            {step === "preferences" && (
              <>
                <div>
                  <p className="text-[13px] font-semibold text-zinc-900">
                    How should this campaign reach guests?
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    Pick one. It decides what you edit and what you preview.
                  </p>
                  <div className="mt-3 grid gap-3">
                    <ChannelCard
                      active={isText}
                      Icon={MessageSquare}
                      title="Text only"
                      body="SMS to guests with a valid mobile number and a compliant relationship."
                      meta="Previewed on iPhone"
                      onClick={() => setChannel("text")}
                    />
                    <ChannelCard
                      active={isEmail}
                      Icon={Mail}
                      title="Email only"
                      body="Email to guests opted in to marketing. Requires a saved email design."
                      meta="Previewed on desktop + mobile"
                      onClick={() => setChannel("email")}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <ToggleRow
                    label="Enable message sequence"
                    hint="Send automatic follow-ups with configurable delays between steps."
                    checked={sequence}
                    onChange={setSequence}
                  />
                </div>

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

                <div className="rounded-xl border border-zinc-200 p-4">
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
                      {isText ? "250 complimentary texts" : "Unlimited emails on your plan"}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Coins size={16} className="text-emerald-600" />${cost} approx. (
                      {isText ? "$0.06 / text" : "$0.00 / email"})
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock size={16} className="text-emerald-600" />
                      Sent around 5pm in each guest&rsquo;s time zone
                    </li>
                  </ul>
                </div>
              </>
            )}

            {step === "content" && isText && (
              <>
                <Field
                  label="Text message"
                  hint={`${renderTokens(message).length + (link ? link.length + 1 : 0)} chars`}
                >
                  <TextArea rows={6} value={message} onChange={setMessage} />
                </Field>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[11.5px] font-medium text-zinc-400">Merge tags</span>
                  {MERGE_TOKENS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setMessage((m) => `${m} ${t}`.trim())}
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                    >
                      {t.replace(/[{}]/g, "").replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
                <Field label="Tracked link" hint="Shortened per guest">
                  <TextInput value={link} onChange={setLink} placeholder="https://…" />
                </Field>
                <div className="rounded-xl border border-zinc-200 p-4">
                  <Field label="Test your text message">
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

            {step === "content" && isEmail && !templateReady && (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200">
                  <LayoutTemplate size={19} />
                </span>
                <p className="mt-3 text-[14px] font-semibold text-zinc-900">
                  Start by choosing an email design
                </p>
                <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-zinc-500">
                  The design provides the logo, hero image, colours and footer. Subject line and
                  content editing unlock once one is selected.
                </p>
                <button
                  onClick={() => setPicker(true)}
                  className="mt-4 h-10 rounded-lg bg-zinc-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  Choose a design
                </button>
              </div>
            )}

            {step === "content" && templateReady && (
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

                <div className="overflow-hidden rounded-xl border border-zinc-200">
                  <p className="border-b border-zinc-100 bg-zinc-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Editable sections
                  </p>
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
                  {LOCKED_BLOCKS.map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/60 px-4 py-3"
                    >
                      <span className="text-[13px] text-zinc-400">{BLOCK_LABELS[id]}</span>
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-zinc-400">
                        <Lock size={12} /> Set by the design
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <Field label="Test your email">
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

            {step === "promotion" && (
              <>
                <Field label="Promo code">
                  <TextInput value={promoCode} onChange={setPromoCode} />
                </Field>
                <Field label="Discount" hint="% off direct bookings">
                  <TextInput value={discount} onChange={setDiscount} />
                </Field>
                <div className="rounded-xl border border-zinc-200 p-4 text-[13px] leading-relaxed text-zinc-600">
                  Guests booking direct with{" "}
                  <strong className="text-zinc-900">{promoCode}</strong> get{" "}
                  <strong className="text-zinc-900">{discount}% off</strong> plus free late checkout
                  on select dates.
                </div>
              </>
            )}
          </section>

          {/* Preview */}
          <section className="relative hidden min-h-0 flex-col overflow-hidden bg-zinc-100 lg:flex">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/70 px-4 py-2 backdrop-blur">
              <p className="text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
                Preview
              </p>
              {isEmail && templateReady && (
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
              {!channel && (
                <EmptyPreview
                  title="Pick a channel to see the preview"
                  body="Text campaigns preview on a phone. Email campaigns preview on desktop and mobile."
                />
              )}

              {isText && (
                <div className="flex justify-center">
                  <SmsPreview message={message} link={link} scale={0.8} />
                </div>
              )}

              {isEmail && !templateReady && (
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

              {templateReady &&
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
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3">
          <p className="truncate text-[12px] text-zinc-500">
            {step === "preferences" && !channel
              ? "Select text only or email only to continue."
              : step === "content" && isEmail && !templateReady
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

function ChannelCard({
  active,
  Icon,
  title,
  body,
  meta,
  onClick,
}: {
  active: boolean;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border p-4 text-left transition-all ${
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
        <span className="block text-[13.5px] font-semibold text-zinc-900">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500">{body}</span>
        <span className="mt-1.5 block text-[11px] font-medium text-zinc-400">{meta}</span>
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
