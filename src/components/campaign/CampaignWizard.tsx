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
  Users,
  Gift,
  Coins,
  Clock,
  CalendarCheck2,
  Pencil,
  LayoutTemplate,
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  Trash2,
  BadgePercent,
  Repeat,
  Split,
  Lock,
  Moon,
  Inbox as InboxIcon,
  FileText,
} from "lucide-react";
import { EmailPreview, type BlockId } from "../editor/EmailPreview";
import { BLOCK_LABELS } from "../editor/BlockForms";
import { PhoneMockup } from "../editor/PhoneMockup";
import { SmsPreview } from "../editor/SmsPreview";
import { InboxPreview } from "../editor/InboxPreview";
import { RailSection } from "../editor/RailSection";
import { FloatingCard, useAnchorRect } from "../editor/FloatingEditor";
import { ContentBlockForm } from "./ContentBlockForm";
import { Select } from "../editor/Select";
import { Field, TextArea, TextInput, ToggleRow } from "../editor/controls";
import { ScaledEmail } from "./ScaledEmail";
import { TemplatePicker } from "./TemplatePicker";
import { TagTextArea, type TagDef } from "./TagTextArea";
import { SequenceTimeline } from "./SequenceTimeline";
import { FollowUpEditor } from "./FollowUpEditor";
import { INITIAL_STEP_ID, makeFollowUp, type FollowUp } from "@/lib/sequence";
import { useCampaign } from "@/lib/useCampaign";
import { createCanvasCampaign } from "@/lib/campaign";
import { getTemplate } from "@/lib/templateStore";
import { stripHtml } from "@/lib/richtext";
import heroAmalfi from "@/assets/hero-amalfi.jpg";
import heroValley from "@/assets/hero-valley.jpg";

type Channel = "text" | "email" | "both" | "text_fallback";
const hasText = (c: Channel | null) => c === "text" || c === "both" || c === "text_fallback";
const hasEmail = (c: Channel | null) => c === "email" || c === "both" || c === "text_fallback";

const AUDIENCES = [
  { value: "everyone", label: "Everyone", hint: "All contactable past guests" },
  { value: "past_90", label: "Stayed in last 90 days", hint: "Recent check-outs" },
  { value: "loyalty", label: "Loyalty members", hint: "Silver tier and above" },
  { value: "lapsed", label: "Lapsed guests", hint: "No stay in 12 months" },
];

/** In the campaign editor, only content-side blocks are user-editable.
 * Header, hero and footer are considered part of the template design. */
const EDITABLE_BLOCKS: BlockId[] = ["body", "cta", "details"];
const LOCKED_BLOCKS: BlockId[] = ["header", "hero", "footer"];

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

const MERGE_TAGS: (TagDef & { chip: string })[] = [
  {
    token: "{{first_name}}",
    label: "firstName",
    tone: "indigo",
    chip: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  },
  {
    token: "{{last_name}}",
    label: "lastName",
    tone: "sky",
    chip: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  },
  {
    token: "{{checkout_date}}",
    label: "checkoutDate",
    tone: "amber",
    chip: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
  {
    token: "{{hotel}}",
    label: "hotelName",
    tone: "emerald",
    chip: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  {
    token: "{{loyalty_tier}}",
    label: "loyaltyTier",
    tone: "violet",
    chip: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  },
];

type EmailMode = "desktop" | "mobile" | "inbox" | "dark";
const EMAIL_MODES: {
  id: EmailMode;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}[] = [
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "mobile", label: "Mobile", Icon: Smartphone },
  { id: "inbox", label: "Inbox", Icon: InboxIcon },
  { id: "dark", label: "Dark", Icon: Moon },
];

const RECENT_FILES = [
  { name: "hero-amalfi.jpg", url: heroAmalfi },
  { name: "hero-valley.jpg", url: heroValley },
];

/** New campaigns open immediately — no naming gate. The auto title is
 * editable inline from the header, Figma style. */
function newDraftCampaign() {
  const c = createCanvasCampaign();
  c.meta.name = "Untitled campaign";
  return c;
}

export function CampaignWizard() {
  const { campaign, update } = useCampaign(newDraftCampaign);

  const [nameFocused, setNameFocused] = useState(false);

  const [step, setStep] = useState<Step>("preferences");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sequence, setSequence] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [selectedStep, setSelectedStep] = useState<string>(INITIAL_STEP_ID);
  const [audience, setAudience] = useState("everyone");
  const [startDate, setStartDate] = useState("2026-07-29");
  const [cutOff, setCutOff] = useState(false);
  const [cutOffDate, setCutOffDate] = useState("2026-08-30");

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [openBlock, setOpenBlock] = useState<BlockId | null>("body");
  const [openRail, setOpenRail] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const toggleRail = (i: number) => setOpenRail((s) => ({ ...s, [i]: !s[i] }));

  const [contentTab, setContentTab] = useState<"text" | "email">("text");

  const [message, setMessage] = useState(
    "{{first_name}}! It's been a while since you booked to stay on {{checkout_date}} at {{hotel}}. Find the best hidden rates for your next trip.",
  );
  const [link, setLink] = useState("https://directful.com/r/9f2ab");
  const [useCustomLink, setUseCustomLink] = useState(true);
  const [textMedia, setTextMedia] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");

  const [promoOn, setPromoOn] = useState(true);
  const [promoCode, setPromoCode] = useState("DIRECT15");
  const [discount, setDiscount] = useState("15");
  const [minNights, setMinNights] = useState("1");
  const [tagline, setTagline] = useState("The best rate 15% 🎉");
  const [validRange, setValidRange] = useState(true);
  const [validFrom, setValidFrom] = useState("2026-07-29");
  const [validTo, setValidTo] = useState("2026-08-13");

  const [emailMode, setEmailMode] = useState<EmailMode>("desktop");
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const guests =
    audience === "everyone"
      ? 1840
      : audience === "past_90"
        ? 412
        : audience === "loyalty"
          ? 268
          : 733;
  const templateReady = hasEmail(channel) && templateId !== null;
  const contentReady = hasText(channel)
    ? hasEmail(channel)
      ? templateReady
      : true
    : templateReady;
  const cost = hasText(channel) ? (guests * 0.06).toFixed(2) : "0.00";

  const activeTab: "text" | "email" =
    channel === "text" ? "text" : channel === "email" ? "email" : contentTab;

  const activeFollowUp =
    sequence && selectedStep !== INITIAL_STEP_ID
      ? (followUps.find((f) => f.id === selectedStep) ?? null)
      : null;

  const addFollowUp = () => {
    const next = makeFollowUp(followUps.length);
    setFollowUps((s2) => [...s2, next]);
    setSelectedStep(next.id);
  };
  const patchFollowUp = (id: string, patch: Partial<FollowUp>) =>
    setFollowUps((s2) => s2.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeFollowUp = (id: string) => {
    setFollowUps((s2) => s2.filter((f) => f.id !== id));
    setSelectedStep((cur) => (cur === id ? INITIAL_STEP_ID : cur));
  };

  /** Preview always reflects the selected timeline step. */
  const previewCampaign = activeFollowUp
    ? {
        ...campaign,
        meta: { ...campaign.meta, subject: activeFollowUp.subject },
        body: {
          ...campaign.body,
          heading: activeFollowUp.heading,
          paragraphs: [{ id: "fu-body", text: activeFollowUp.body }],
        },
      }
    : campaign;

  /* Selecting a content block in the email preview opens a floating editor
   * anchored to it — same mechanic as the template studio. */
  const emailEditing =
    step === "content" &&
    activeTab === "email" &&
    templateReady &&
    emailMode !== "inbox" &&
    !activeFollowUp;
  const floatingBlock =
    emailEditing && openBlock && EDITABLE_BLOCKS.includes(openBlock) ? openBlock : null;
  const anchor = useAnchorRect(floatingBlock, !!floatingBlock, [
    campaign,
    emailMode,
    step,
    expanded,
  ]);

  /* ---------------- Minimised chip ---------------- */
  if (minimized) {
    return (
      <div className="grid min-h-dvh place-items-end bg-zinc-900/70 p-4 font-sans">
        <div className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white px-4 py-3 shadow-2xl">
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
            className="grid size-9 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  const chromeBtn =
    "grid size-8 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30";

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const canLeavePreferences = channel !== null;
  const showPreview = channel !== null; // Preview appears the moment a channel is chosen.

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
          expanded ? "" : "md:rounded-md md:border md:border-zinc-300"
        }`}
      >
        {/* Chrome */}
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <label className="group flex min-w-0 items-center gap-1.5 border border-transparent px-1 transition-colors hover:border-zinc-200 focus-within:border-blue-600">
              <input
                value={campaign.meta.name}
                aria-label="Campaign name — click to rename"
                title="Click to rename this campaign"
                placeholder="Untitled campaign"
                onFocus={(e) => {
                  setNameFocused(true);
                  e.currentTarget.select();
                }}
                onBlur={(e) => {
                  setNameFocused(false);
                  if (!e.target.value.trim())
                    update((d) => void (d.meta.name = "Untitled campaign"));
                }}
                onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
                className="min-w-0 max-w-[20rem] flex-1 truncate bg-transparent px-1 py-1.5 text-[14px] font-semibold outline-none"
              />
              <Pencil
                size={13}
                aria-hidden
                className={`shrink-0 transition-opacity ${
                  nameFocused ? "text-blue-600" : "text-zinc-400 opacity-60 group-hover:opacity-100"
                }`}
              />
            </label>
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
              className="mr-1 hidden h-8 items-center rounded-md border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:flex"
            >
              Save changes
            </button>
            <button
              className={chromeBtn}
              onClick={() => setMinimized(true)}
              aria-label="Minimise"
              title="Minimise"
            >
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

        {/* Step rail — connected progress track */}
        <nav
          aria-label="Campaign steps"
          className="shrink-0 border-b border-zinc-200 bg-white px-3 pb-3 pt-1 sm:px-4"
        >
          <ol className="flex items-stretch gap-0">
            {STEPS.map((s, i) => {
              const locked = s.id !== "preferences" && !canLeavePreferences;
              const done = i < stepIndex;
              const current = step === s.id;
              return (
                <li key={s.id} className="flex min-w-0 flex-1 items-center">
                  <button
                    disabled={locked}
                    onClick={() => setStep(s.id)}
                    aria-current={current ? "step" : undefined}
                    className="group flex min-w-0 flex-1 flex-col gap-2 text-left disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`grid size-[22px] shrink-0 place-items-center text-[11px] font-semibold transition-colors ${
                          current
                            ? "bg-blue-600 text-white"
                            : done
                              ? "bg-blue-100 text-blue-700"
                              : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {done ? <Check size={12} /> : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-[12.5px] font-semibold ${
                            current ? "text-zinc-900" : "text-zinc-500"
                          }`}
                        >
                          {s.label}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`h-[3px] w-full transition-colors ${
                        current ? "bg-blue-600" : done ? "bg-blue-200" : "bg-zinc-200"
                      }`}
                    />
                  </button>
                  {i < STEPS.length - 1 && <span className="w-2 shrink-0" />}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Body: editor rail + preview */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[26rem_minmax(0,1fr)]">
          {/* Left rail — structured-builder rhythm */}
          <aside className="flex min-h-0 flex-col overflow-hidden border-r border-zinc-200 bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {step === "preferences"
                  ? "Preferences"
                  : step === "content"
                    ? "Content"
                    : "Promotion"}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {step === "preferences" && (
                <PreferencesRail
                  channel={channel}
                  setChannel={setChannel}
                  openRail={openRail}
                  toggle={toggleRail}
                />
              )}

              {step === "content" && (
                <ContentRail
                  channel={channel}
                  activeTab={activeTab}
                  setContentTab={setContentTab}
                  message={message}
                  setMessage={setMessage}
                  link={link}
                  setLink={setLink}
                  useCustomLink={useCustomLink}
                  setUseCustomLink={setUseCustomLink}
                  textMedia={textMedia}
                  setTextMedia={setTextMedia}
                  testTo={testTo}
                  setTestTo={setTestTo}
                  templateId={templateId}
                  openPicker={() => setPicker(true)}
                  campaign={campaign}
                  update={update}
                  openBlock={openBlock}
                  setOpenBlock={setOpenBlock}
                  openRail={openRail}
                  toggle={toggleRail}
                  sequence={sequence}
                  setSequence={(v) => {
                    setSequence(v);
                    if (!v) setSelectedStep(INITIAL_STEP_ID);
                  }}
                  followUps={followUps}
                  selectedStep={selectedStep}
                  setSelectedStep={setSelectedStep}
                  addFollowUp={addFollowUp}
                  patchFollowUp={patchFollowUp}
                  removeFollowUp={removeFollowUp}
                  mergeTags={MERGE_TAGS}
                  onTest={(kind) => notify(`Test ${kind} sent`)}
                />
              )}

              {step === "promotion" && (
                <PromotionRail
                  promoOn={promoOn}
                  setPromoOn={setPromoOn}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  minNights={minNights}
                  setMinNights={setMinNights}
                  discount={discount}
                  setDiscount={setDiscount}
                  tagline={tagline}
                  setTagline={setTagline}
                  validRange={validRange}
                  setValidRange={setValidRange}
                  validFrom={validFrom}
                  setValidFrom={setValidFrom}
                  validTo={validTo}
                  setValidTo={setValidTo}
                  audience={audience}
                  setAudience={setAudience}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  cutOff={cutOff}
                  setCutOff={setCutOff}
                  cutOffDate={cutOffDate}
                  setCutOffDate={setCutOffDate}
                  guests={guests}
                  cost={cost}
                  channel={channel}
                  openRail={openRail}
                  toggle={toggleRail}
                />
              )}
            </div>
          </aside>

          {/* Right preview column */}
          <section className="relative hidden min-h-0 flex-col overflow-hidden bg-zinc-100 lg:flex">
            <PreviewHeader
              step={step}
              activeTab={activeTab}
              channel={channel}
              templateReady={templateReady}
              emailMode={emailMode}
              setEmailMode={setEmailMode}
            />

            <div
              className="min-h-0 flex-1 overflow-y-auto p-6"
              style={{
                background:
                  step === "content" && activeTab === "email" && emailMode === "dark"
                    ? "#141518"
                    : undefined,
              }}
            >
              {/* Preferences preview */}
              {step === "preferences" && (
                <PreferencesPreview
                  channel={channel}
                  message={message}
                  link={link}
                  textMedia={textMedia}
                  campaign={campaign}
                  templateReady={templateReady}
                  onChooseDesign={() => setPicker(true)}
                />
              )}

              {/* Content · Text */}
              {step === "content" && activeTab === "text" && hasText(channel) && (
                <div className="flex justify-center">
                  <SmsPreview
                    message={activeFollowUp ? activeFollowUp.message : message}
                    link={!activeFollowUp && useCustomLink ? link : undefined}
                    imageUrl={activeFollowUp ? null : textMedia}
                    sender={campaign.footer.company || campaign.header.logoText}
                    scale={0.8}
                  />
                </div>
              )}

              {/* Content · Email */}
              {step === "content" &&
                activeTab === "email" &&
                hasEmail(channel) &&
                !templateReady && (
                  <NoTemplatePreview onChoose={() => setPicker(true)} campaign={campaign} />
                )}

              {step === "content" &&
                activeTab === "email" &&
                templateReady &&
                (emailMode === "inbox" ? (
                  <InboxPreview campaign={previewCampaign} />
                ) : emailMode === "mobile" ? (
                  <div className="flex justify-center">
                    <PhoneMockup scale={0.78}>
                      <EmailPreview
                        campaign={previewCampaign}
                        interactive={!activeFollowUp}
                        inlineEdit={!activeFollowUp}
                        update={update}
                        selected={openBlock}
                        onSelect={setOpenBlock}
                        lockedBlocks={LOCKED_BLOCKS}
                        width={373}
                      />
                    </PhoneMockup>
                  </div>
                ) : (
                  <EmailPreview
                    campaign={previewCampaign}
                    interactive={!activeFollowUp}
                    inlineEdit={!activeFollowUp}
                    update={update}
                    selected={openBlock}
                    onSelect={setOpenBlock}
                    lockedBlocks={LOCKED_BLOCKS}
                    width={600}
                    dark={emailMode === "dark"}
                  />
                ))}

              {/* Promotion preview — a plain, larger card (no device frame) */}
              {step === "promotion" && (
                <div className="flex justify-center">
                  <div className="w-full max-w-lg">
                    <PromoPreviewCard
                      accent={campaign.theme.accent}
                      hotel={campaign.footer.company || campaign.header.logoText}
                      firstName="Liyat"
                      tagline={tagline}
                      discount={discount}
                      enabled={promoOn}
                    />
                  </div>
                </div>
              )}
              {!showPreview && <NoChannelPreview />}
            </div>
          </section>
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
                className="h-10 rounded-md border border-zinc-200 px-5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
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
              className="h-10 rounded-md bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stepIndex === STEPS.length - 1 ? "Schedule campaign" : "Next"}
            </button>
          </div>
        </footer>
      </div>

      {floatingBlock && (
        <FloatingCard
          anchor={anchor}
          title={`Editing · ${BLOCK_LABELS[floatingBlock]}`}
          subtitle="Campaign content — the template shell stays locked"
          onClose={() => setOpenBlock(null)}
        >
          <ContentBlockForm id={floatingBlock} campaign={campaign} update={update} />
        </FloatingCard>
      )}

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
          setOpenBlock("body");
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

/* ===================== Preferences rail ===================== */

function PreferencesRail(props: {
  channel: Channel | null;
  setChannel: (c: Channel) => void;
  openRail: Record<number, boolean>;
  toggle: (i: number) => void;
}) {
  const { channel, setChannel, openRail, toggle } = props;
  return (
    <>
      <RailSection
        index={1}
        title="Channel strategy"
        hint="Decides what you edit and how it's previewed"
        open={!!openRail[1]}
        onToggle={() => toggle(1)}
      >
        <div className="grid gap-2.5 p-4 sm:grid-cols-2">
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
      </RailSection>
    </>
  );
}

/* ===================== Content rail ===================== */

function ContentRail(props: {
  channel: Channel | null;
  activeTab: "text" | "email";
  setContentTab: (t: "text" | "email") => void;
  message: string;
  setMessage: (v: string) => void;
  link: string;
  setLink: (v: string) => void;
  useCustomLink: boolean;
  setUseCustomLink: (v: boolean) => void;
  textMedia: string | null;
  setTextMedia: (v: string | null) => void;
  testTo: string;
  setTestTo: (v: string) => void;
  templateId: string | null;
  openPicker: () => void;
  campaign: ReturnType<typeof useCampaign>["campaign"];
  update: ReturnType<typeof useCampaign>["update"];
  openBlock: BlockId | null;
  setOpenBlock: (b: BlockId | null) => void;
  openRail: Record<number, boolean>;
  toggle: (i: number) => void;
  sequence: boolean;
  setSequence: (v: boolean) => void;
  followUps: FollowUp[];
  selectedStep: string;
  setSelectedStep: (id: string) => void;
  addFollowUp: () => void;
  patchFollowUp: (id: string, patch: Partial<FollowUp>) => void;
  removeFollowUp: (id: string) => void;
  mergeTags: (TagDef & { chip: string })[];
  onTest: (kind: "email" | "text") => void;
}) {
  const {
    channel,
    activeTab,
    setContentTab,
    campaign,
    update,
    templateId,
    openPicker,
    openBlock,
    setOpenBlock,
    openRail,
    toggle,
  } = props;

  const fu = props.followUps.find((f) => f.id === props.selectedStep) ?? null;
  const showTabs = channel === "both" || channel === "text_fallback";
  const textRef = useRef<HTMLDivElement | null>(null);
  const insertToken = (token: string) => {
    const fn = (textRef.current as any)?.__insertToken as ((t: string) => void) | undefined;
    if (fn) fn(token);
    else props.setMessage(`${props.message} ${token}`.trim());
  };

  return (
    <>
      {showTabs && (
        <div className="border-b border-zinc-100 p-3">
          <div className="flex rounded-md bg-zinc-100 p-1">
            {[
              { id: "text" as const, Icon: MessageSquare, label: "Text content" },
              { id: "email" as const, Icon: Mail, label: "Email design" },
            ].map((t) => (
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
        </div>
      )}

      {!fu && activeTab === "text" && hasText(channel) && (
        <>
          <RailSection
            index={1}
            title="Message"
            hint="Type your text — tags stay as chips"
            open={!!openRail[1]}
            onToggle={() => toggle(1)}
          >
            <div className="space-y-3 p-4">
              <Field
                label="Text message"
                hint={`${props.message.length + (props.useCustomLink && props.link ? props.link.length + 1 : 0)} chars`}
              >
                <TagTextArea
                  value={props.message}
                  onChange={props.setMessage}
                  tags={MERGE_TAGS}
                  minHeight={130}
                  inputRef={textRef}
                  placeholder="Write your text message…"
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
                      onClick={() => insertToken(t.token)}
                      className={`px-2 py-1 text-[11.5px] font-semibold transition-colors ${t.chip}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-zinc-100" />
              <ToggleRow
                label="Use a custom invite link"
                hint="Appended after your message, shortened per guest."
                checked={props.useCustomLink}
                onChange={props.setUseCustomLink}
              />
              {props.useCustomLink && (
                <Field label="Tracked link">
                  <TextInput value={props.link} onChange={props.setLink} placeholder="https://…" />
                </Field>
              )}
            </div>
          </RailSection>

          <RailSection
            index={2}
            title="Media"
            hint="MMS previews get 2× engagement"
            open={!!openRail[2]}
            onToggle={() => toggle(2)}
          >
            <div className="p-4">
              <MediaUploader value={props.textMedia} onChange={props.setTextMedia} />
            </div>
          </RailSection>

          <RailSection
            index={3}
            title="Send test"
            hint="Preview it on your phone"
            open={!!openRail[3]}
            onToggle={() => toggle(3)}
          >
            <div className="p-4">
              <Field label="Send a test text">
                <div className="flex gap-2">
                  <TextInput
                    value={props.testTo}
                    onChange={props.setTestTo}
                    placeholder="+30 690 000 0000"
                  />
                  <button
                    onClick={() => props.onTest("text")}
                    className="h-10 shrink-0 rounded-md border border-zinc-200 px-4 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                  >
                    Send test
                  </button>
                </div>
              </Field>
            </div>
          </RailSection>
        </>
      )}

      {!fu && activeTab === "email" && hasEmail(channel) && templateId === null && (
        <div className="p-4">
          <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200">
              <LayoutTemplate size={19} />
            </span>
            <p className="mt-3 text-[14px] font-semibold text-zinc-900">
              Start by choosing an email design
            </p>
            <p className="mx-auto mt-1 max-w-xs text-[12.5px] leading-relaxed text-zinc-500">
              The design locks in your header, hero and footer. You edit the body, buttons and
              details for this campaign.
            </p>
            <button
              onClick={openPicker}
              className="mt-4 h-10 rounded-md bg-blue-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Choose a design
            </button>
          </div>
        </div>
      )}

      {!fu && activeTab === "email" && hasEmail(channel) && templateId !== null && (
        <>
          <RailSection
            index={1}
            title="Template"
            hint="Subject, preheader & design"
            open={!!openRail[1]}
            onToggle={() => toggle(1)}
          >
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3 rounded-md border border-zinc-200 p-3">
                <ScaledEmail campaign={campaign} width={92} height={66} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-900">
                    {getTemplate(templateId)?.name ?? "Selected design"}
                  </p>
                  <p className="text-[11.5px] text-zinc-500">Selected design</p>
                </div>
                <button
                  onClick={openPicker}
                  className="flex h-9 shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
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
            </div>
          </RailSection>

          <RailSection
            index={2}
            title="Content sections"
            hint="Pick one — or click it in the preview"
            open={!!openRail[2]}
            onToggle={() => toggle(2)}
          >
            <div className="space-y-1 p-3">
              {EDITABLE_BLOCKS.map((id) => {
                const active = openBlock === id;
                return (
                  <button
                    key={id}
                    onClick={() => setOpenBlock(active ? null : id)}
                    aria-pressed={active}
                    className={`flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-blue-600 bg-blue-50/70"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Pencil size={13} className={active ? "text-blue-600" : "text-zinc-400"} />
                      <span
                        className={`text-[13px] font-medium ${
                          active ? "text-blue-700" : "text-zinc-700"
                        }`}
                      >
                        {BLOCK_LABELS[id]}
                      </span>
                    </span>
                    <span className="text-[11px] text-zinc-400">{active ? "Editing" : "Edit"}</span>
                  </button>
                );
              })}
              <p className="px-1 pt-1.5 text-[11.5px] leading-relaxed text-zinc-400">
                The editor opens next to the section in the preview, just like the template studio.
              </p>
            </div>
          </RailSection>

          <RailSection
            index={3}
            title="Design shell"
            hint="Locked — set by the template"
            open={!!openRail[3]}
            onToggle={() => toggle(3)}
          >
            <div className="space-y-1 p-3">
              {LOCKED_BLOCKS.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-md border border-dashed border-zinc-200 bg-zinc-50/60 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2.5">
                    <Lock size={13} className="text-zinc-400" />
                    <span className="text-[13px] font-medium text-zinc-600">
                      {BLOCK_LABELS[id]}
                    </span>
                  </span>
                  <span className="text-[11px] text-zinc-400">Template</span>
                </div>
              ))}
              <p className="px-1 pt-1.5 text-[11.5px] leading-relaxed text-zinc-400">
                To change these, edit the template in the studio and re-apply it.
              </p>
            </div>
          </RailSection>

          <RailSection
            index={4}
            title="Send test"
            hint="Send yourself a preview"
            open={!!openRail[4]}
            onToggle={() => toggle(4)}
          >
            <div className="p-4">
              <Field label="Send a test email">
                <div className="flex gap-2">
                  <TextInput
                    value={props.testTo}
                    onChange={props.setTestTo}
                    placeholder="you@hotel.com"
                  />
                  <button
                    onClick={() => props.onTest("email")}
                    className="h-10 shrink-0 rounded-md border border-zinc-200 px-4 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                  >
                    Send test
                  </button>
                </div>
              </Field>
            </div>
          </RailSection>
        </>
      )}

      {((activeTab === "text" && hasText(channel)) ||
        (activeTab === "email" && hasEmail(channel) && templateId !== null)) && (
        <>
          {fu && (
            <RailSection
              index="★"
              title={`Editing · ${fu.name}`}
              hint="Follow-up message — preview updates live"
              open
              onToggle={() => props.setSelectedStep(INITIAL_STEP_ID)}
            >
              <FollowUpEditor
                step={fu}
                onChange={(patch) => props.patchFollowUp(fu.id, patch)}
                text={hasText(channel)}
                email={hasEmail(channel) && templateId !== null}
                tags={props.mergeTags}
              />
            </RailSection>
          )}

          <RailSection
            index={activeTab === "text" ? 4 : 5}
            title="Follow-up sequence"
            hint="Automatic reminders after this message"
            open={!!openRail[6]}
            onToggle={() => toggle(6)}
          >
            <div className="p-4 pb-0">
              <ToggleRow
                label="Enable follow-up sequence"
                hint="Automatically send reminder messages after the initial message."
                checked={props.sequence}
                onChange={props.setSequence}
              />
            </div>
            {props.sequence && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <SequenceTimeline
                  steps={props.followUps}
                  selectedId={props.selectedStep}
                  onSelect={props.setSelectedStep}
                  onAdd={props.addFollowUp}
                  onDelete={props.removeFollowUp}
                  onDelay={(id, delay) => props.patchFollowUp(id, { delay })}
                  initialExcerpt={
                    activeTab === "text" ? props.message : stripHtml(campaign.meta.subject)
                  }
                  text={hasText(channel)}
                  email={hasEmail(channel) && templateId !== null}
                />
              </div>
            )}
          </RailSection>
        </>
      )}
    </>
  );
}

/* ===================== Promotion rail ===================== */

function PromotionRail(props: {
  promoOn: boolean;
  setPromoOn: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  minNights: string;
  setMinNights: (v: string) => void;
  discount: string;
  setDiscount: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  validRange: boolean;
  setValidRange: (v: boolean) => void;
  validFrom: string;
  setValidFrom: (v: string) => void;
  validTo: string;
  setValidTo: (v: string) => void;
  audience: string;
  setAudience: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  cutOff: boolean;
  setCutOff: (v: boolean) => void;
  cutOffDate: string;
  setCutOffDate: (v: string) => void;
  guests: number;
  cost: string;
  channel: Channel | null;
  openRail: Record<number, boolean>;
  toggle: (i: number) => void;
}) {
  const { openRail, toggle, channel } = props;
  return (
    <>
      <RailSection
        index={1}
        title="Promotion"
        hint="Personalised discount for every channel"
        open={!!openRail[1]}
        onToggle={() => toggle(1)}
      >
        <div className="p-4">
          <ToggleRow
            label="Use promotion"
            hint="Turn off to send the campaign without a discount."
            checked={props.promoOn}
            onChange={props.setPromoOn}
          />
        </div>
      </RailSection>

      {props.promoOn && (
        <>
          <RailSection
            index={2}
            title="Offer details"
            hint="Code, discount & tagline"
            open={!!openRail[2]}
            onToggle={() => toggle(2)}
          >
            <div className="space-y-4 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Offer promo code">
                  <TextInput value={props.promoCode} onChange={props.setPromoCode} />
                </Field>
                <Field label="Minimum nights">
                  <Select
                    ariaLabel="Minimum nights"
                    value={props.minNights}
                    options={MIN_NIGHTS}
                    onChange={props.setMinNights}
                  />
                </Field>
              </div>
              <Field label="Discount percentage" hint="% off direct bookings">
                <TextInput value={props.discount} onChange={props.setDiscount} />
              </Field>
              <Field label="Offer tagline" hint="Shown on the promo card">
                <TextInput
                  value={props.tagline}
                  onChange={props.setTagline}
                  placeholder="The best rate 50% 🎉"
                />
              </Field>
            </div>
          </RailSection>

          <RailSection
            index={3}
            title="Validity"
            hint="Optional date window"
            open={!!openRail[3]}
            onToggle={() => toggle(3)}
          >
            <div className="space-y-4 p-4">
              <ToggleRow
                label="Offer is valid between specific dates"
                checked={props.validRange}
                onChange={props.setValidRange}
              />
              {props.validRange && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Valid from">
                    <TextInput type="date" value={props.validFrom} onChange={props.setValidFrom} />
                  </Field>
                  <Field label="Valid to">
                    <TextInput type="date" value={props.validTo} onChange={props.setValidTo} />
                  </Field>
                </div>
              )}
            </div>
          </RailSection>
        </>
      )}

      <RailSection
        index={props.promoOn ? 4 : 2}
        title="Audience & schedule"
        hint="Who receives it and when"
        open={!!openRail[4]}
        onToggle={() => toggle(4)}
      >
        <div className="space-y-4 p-4">
          <div>
            <p className="text-[13px] font-semibold text-zinc-900">Select your audience</p>
            <p className="mt-0.5 text-[11.5px] text-zinc-500">
              Choose who will receive this campaign.
            </p>
          </div>
          <Field label="Audience" hint={`Approx. ${props.guests.toLocaleString()} guests`}>
            <Select
              ariaLabel="Audience"
              value={props.audience}
              options={AUDIENCES}
              onChange={props.setAudience}
            />
          </Field>
          <div className="h-px bg-zinc-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start sending on">
              <TextInput type="date" value={props.startDate} onChange={props.setStartDate} />
            </Field>
            {props.cutOff && (
              <Field label="Stop sending on">
                <TextInput type="date" value={props.cutOffDate} onChange={props.setCutOffDate} />
              </Field>
            )}
          </div>
          <ToggleRow
            label="Add cut-off date"
            hint="Stop sending automatically at a certain date."
            checked={props.cutOff}
            onChange={props.setCutOff}
          />
        </div>
      </RailSection>

      <RailSection
        index={props.promoOn ? 5 : 3}
        title="Summary"
        hint="Estimated impact"
        open={!!openRail[5]}
        onToggle={() => toggle(5)}
      >
        <div className="p-4">
          <div className="rounded-md border border-emerald-100 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-3">
              <CalendarCheck2 size={22} className="text-emerald-600" />
              <div>
                <p className="text-[12px] font-medium text-emerald-800/70">Estimated end date</p>
                <p className="text-[16px] font-semibold text-emerald-900">
                  {props.cutOff ? "Aug 30, 2026" : "Jul 30, 2026"}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-emerald-900/90">
              <li className="flex items-center gap-2.5">
                <Users size={16} className="text-emerald-600" />
                {props.guests.toLocaleString()} guests will be reached
              </li>
              <li className="flex items-center gap-2.5">
                <Gift size={16} className="text-emerald-600" />
                {hasText(channel) ? "250 complimentary texts" : "Unlimited emails on your plan"}
              </li>
              <li className="flex items-center gap-2.5">
                <Coins size={16} className="text-emerald-600" />${props.cost} approx. (
                {hasText(channel) ? "$0.06 / text" : "$0.00 / email"})
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={16} className="text-emerald-600" />
                Sent around 5pm in each guest&rsquo;s time zone
              </li>
            </ul>
          </div>
        </div>
      </RailSection>
    </>
  );
}

/* ===================== Preview column header + previews ===================== */

function PreviewHeader({
  step,
  activeTab,
  channel,
  templateReady,
  emailMode,
  setEmailMode,
}: {
  step: Step;
  activeTab: "text" | "email";
  channel: Channel | null;
  templateReady: boolean;
  emailMode: EmailMode;
  setEmailMode: (m: EmailMode) => void;
}) {
  const showEmailModes = step === "content" && activeTab === "email" && templateReady;
  const label =
    step === "preferences"
      ? channel
        ? `Preview · ${CHANNEL_LABELS[channel]}`
        : "Preview"
      : step === "content"
        ? activeTab === "text"
          ? "Preview · Text on iPhone"
          : templateReady
            ? "Preview · Email"
            : "Preview · Email"
        : "Preview · Promo card";
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/70 px-4 py-2 backdrop-blur">
      <p className="flex min-w-0 items-center gap-2 truncate text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
        <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
        {label}
        {showEmailModes && (
          <span className="hidden normal-case tracking-normal text-zinc-400 xl:inline">
            · click a highlighted section to edit — greyed areas are locked by the template
          </span>
        )}
      </p>
      {showEmailModes && (
        <div className="flex rounded-md bg-zinc-100 p-0.5">
          {EMAIL_MODES.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setEmailMode(id)}
              aria-pressed={emailMode === id}
              title={label}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                emailMode === id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PreferencesPreview({
  channel,
  message,
  link,
  textMedia,
  campaign,
  templateReady,
  onChooseDesign,
}: {
  channel: Channel | null;
  message: string;
  link: string;
  textMedia: string | null;
  campaign: ReturnType<typeof useCampaign>["campaign"];
  templateReady: boolean;
  onChooseDesign: () => void;
}) {
  if (channel === "text") {
    return (
      <div className="flex justify-center">
        <SmsPreview
          message={message}
          link={link}
          imageUrl={textMedia}
          sender={campaign.footer.company || campaign.header.logoText}
          scale={0.8}
        />
      </div>
    );
  }
  if (channel === "email") {
    return templateReady ? (
      <EmailPreview campaign={campaign} interactive={false} width={600} />
    ) : (
      <NoTemplatePreview onChoose={onChooseDesign} campaign={campaign} />
    );
  }
  if (channel === "both" || channel === "text_fallback") {
    // Show phone + tiny email hint stacked.
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex justify-center">
          <SmsPreview
            message={message}
            link={link}
            imageUrl={textMedia}
            sender={campaign.footer.company || campaign.header.logoText}
            scale={0.62}
          />
        </div>
        <div className="min-w-0">
          {templateReady ? (
            <EmailPreview campaign={campaign} interactive={false} width={420} />
          ) : (
            <NoTemplatePreview onChoose={onChooseDesign} campaign={campaign} compact />
          )}
        </div>
      </div>
    );
  }
  return null;
}

function NoTemplatePreview({
  onChoose,
  campaign,
  compact = false,
}: {
  onChoose: () => void;
  campaign: ReturnType<typeof useCampaign>["campaign"];
  compact?: boolean;
}) {
  return (
    <div className={`relative mx-auto ${compact ? "max-w-[420px]" : "max-w-[620px]"}`}>
      <div className="pointer-events-none select-none opacity-30 blur-[2px] grayscale">
        <EmailPreview campaign={campaign} interactive={false} width={compact ? 420 : 600} />
      </div>
      <div className="absolute inset-0 grid place-items-start justify-center pt-24">
        <div className="rounded-md border border-zinc-200 bg-white/95 px-6 py-5 text-center shadow-xl backdrop-blur">
          <span className="mx-auto grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-500">
            <FileText size={18} />
          </span>
          <p className="mt-3 text-[14px] font-semibold text-zinc-900">
            No email design selected yet
          </p>
          <p className="mt-1 max-w-xs text-[12.5px] text-zinc-500">
            Please select a template to preview and edit your email.
          </p>
          <button
            onClick={onChoose}
            className="mt-3 h-9 rounded-md bg-blue-600 px-4 text-[12.5px] font-semibold text-white hover:bg-blue-700"
          >
            Select a template
          </button>
        </div>
      </div>
    </div>
  );
}

/** Shown in the preview column before a channel strategy is picked. */
function NoChannelPreview() {
  return (
    <div className="grid h-full place-items-center px-6">
      <div className="max-w-sm border border-dashed border-zinc-300 bg-white px-8 py-10 text-center">
        <span className="mx-auto grid size-10 place-items-center bg-blue-50 text-blue-600">
          <FileText size={18} />
        </span>
        <p className="mt-3 text-[14px] font-semibold text-zinc-900">
          Please select a channel strategy to preview
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">
          Choose Text only, Email only, or a combined strategy on the left and the matching preview
          appears here instantly.
        </p>
      </div>
    </div>
  );
}

/* ===================== Shared bits ===================== */

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
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-md border p-3.5 text-left transition-all ${
        active
          ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600/20"
          : "border-zinc-200 hover:border-zinc-400"
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-md ${
          active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500"
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
          active ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300"
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
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-[12px] leading-relaxed text-amber-900">
          Adding an image is <strong>strongly recommended</strong> — MMS previews get much higher
          engagement. Max 500 KB.
        </p>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-md border border-zinc-200">
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
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
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
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700">
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

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Select from recent files
        </p>
        <div className="flex flex-wrap gap-2">
          {RECENT_FILES.map((f) => {
            const active = value === f.url;
            return (
              <button
                key={f.name}
                onClick={() => onChange(f.url)}
                aria-pressed={active}
                title={f.name}
                className={`group relative overflow-hidden rounded-md border transition-all ${
                  active
                    ? "border-blue-600 ring-1 ring-blue-600/25"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <img src={f.url} alt={f.name} className="block h-16 w-24 object-cover" />
                {active && (
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-blue-600 text-white">
                    <Check size={11} />
                  </span>
                )}
              </button>
            );
          })}
          {/* Placeholder file tiles */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="grid h-16 w-24 place-items-center rounded-md border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400"
            >
              <FileText size={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromoPreviewCard({
  accent,
  hotel,
  firstName,
  tagline,
  discount,
  enabled,
  compact = false,
}: {
  accent: string;
  hotel: string;
  firstName: string;
  tagline: string;
  discount: string;
  enabled: boolean;
  compact?: boolean;
}) {
  if (!enabled) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
        <BadgePercent size={20} className="mx-auto mb-2 text-zinc-400" />
        <p className="text-[13px] font-medium">Promotion is turned off</p>
        <p className="mt-1 text-[11.5px]">Toggle it on to preview the promo card.</p>
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden rounded-md text-white shadow-lg ${
        compact ? "p-4" : "p-6"
      }`}
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, color-mix(in oklab, ${accent} 55%, #0f172a) 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`font-semibold uppercase tracking-[0.18em] text-white/70 ${compact ? "text-[9px]" : "text-[10.5px]"}`}
          >
            Exclusive offer
          </p>
          <p className={`mt-1 font-semibold ${compact ? "text-[13px]" : "text-[15px]"}`}>
            {hotel || "Your hotel"}
          </p>
        </div>
        <span
          className={`grid place-items-center rounded-full bg-white/15 backdrop-blur ${
            compact ? "size-8" : "size-10"
          }`}
        >
          <BadgePercent size={compact ? 15 : 18} />
        </span>
      </div>

      <div className={compact ? "mt-6" : "mt-8"}>
        <div
          className={`inline-block rounded-md bg-white font-bold uppercase tracking-widest text-zinc-900 shadow-md ${
            compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
          }`}
        >
          {firstName.toUpperCase()}, you unlocked
        </div>
        <div
          className={`mt-2 -rotate-1 rounded-md bg-black/25 shadow-lg ring-1 ring-white/10 backdrop-blur ${
            compact ? "px-3 py-2" : "px-4 py-3"
          }`}
        >
          <p
            className={`font-black uppercase tracking-wide ${
              compact ? "text-[17px]" : "text-[22px]"
            }`}
          >
            {tagline || `The best rate ${discount}%`}
          </p>
        </div>
      </div>

      <p className={`mt-6 text-white/70 ${compact ? "text-[10.5px]" : "text-[11.5px]"}`}>
        {discount}% off direct bookings · promo card previewed as the guest sees it.
      </p>
    </div>
  );
}
