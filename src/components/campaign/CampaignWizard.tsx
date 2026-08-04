import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  MessageSquare,
  Mail,
  Check,
  Repeat,
  Split,
  Pencil,
  Workflow,
  BadgePercent,
  SlidersHorizontal,
} from "lucide-react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { StepOverlay, type StepDraft } from "./StepOverlay";
import { RuleDialog } from "./RuleDialog";
import { TemplatePicker } from "./TemplatePicker";
import { type TagDef } from "./TagTextArea";
import {
  ChannelCard,
  CHANNEL_LABELS,
  MediaUploader,
  PromoPreviewCard,
  PromotionRail,
  hasEmail,
  hasText,
  type Channel,
} from "./CampaignParts";
import {
  INITIAL_STEP_ID,
  defaultFollowUps,
  makeFollowUp,
  type FollowUp,
  type Rule,
} from "@/lib/sequence";
import { useCampaign } from "@/lib/useCampaign";
import { createCanvasCampaign, uid } from "@/lib/campaign";
import { getTemplate } from "@/lib/templateStore";
import { stripHtml } from "@/lib/richtext";

const STEPS = [
  { id: "preferences", label: "Preferences", Icon: SlidersHorizontal },
  { id: "sequence", label: "Sequence", Icon: Workflow },
  { id: "promotion", label: "Promotion", Icon: BadgePercent },
] as const;
type Step = (typeof STEPS)[number]["id"];

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

  const [followUps, setFollowUps] = useState<FollowUp[]>(defaultFollowUps);
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleOpen, setRuleOpen] = useState(false);

  const [message, setMessage] = useState(
    "{{first_name}}! It's been a while since you stayed on {{checkout_date}} at {{hotel}}. Find the best hidden rates for your next trip.",
  );
  const [textMedia, setTextMedia] = useState<string | null>(null);

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);

  const [audience, setAudience] = useState("everyone");
  const [startDate, setStartDate] = useState("2026-08-04");
  const [cutOff, setCutOff] = useState(false);
  const [cutOffDate, setCutOffDate] = useState("2026-09-04");

  const [promoOn, setPromoOn] = useState(true);
  const [promoCode, setPromoCode] = useState("DIRECT15");
  const [discount, setDiscount] = useState("15");
  const [minNights, setMinNights] = useState("1");
  const [tagline, setTagline] = useState("The best rate 15% 🎉");
  const [validRange, setValidRange] = useState(true);
  const [validFrom, setValidFrom] = useState("2026-08-04");
  const [validTo, setValidTo] = useState("2026-08-20");

  const [openRail, setOpenRail] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const toggleRail = (i: number) => setOpenRail((s) => ({ ...s, [i]: !s[i] }));

  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  /* ---------------- Overlay editing ---------------- */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StepDraft | null>(null);

  const templateReady = hasEmail(channel) && templateId !== null;
  const guests =
    audience === "everyone"
      ? 1840
      : audience === "past_90"
        ? 412
        : audience === "loyalty"
          ? 268
          : 733;
  const cost = hasText(channel) ? (guests * 0.06).toFixed(2) : "0.00";

  const initialEmailBody = campaign.body.paragraphs.map((p) => stripHtml(p.text)).join("\n\n");

  const openStep = (id: string) => {
    if (id === INITIAL_STEP_ID) {
      setDraft({
        message,
        subject: stripHtml(campaign.meta.subject),
        preheader: campaign.meta.preheader,
        heading: stripHtml(campaign.body.heading),
        body: initialEmailBody,
        ctaLabel: campaign.cta.label,
        ctaUrl: campaign.cta.url,
      });
    } else {
      const f = followUps.find((x) => x.id === id);
      if (!f) return;
      setDraft({
        message: f.message,
        subject: f.subject,
        preheader: campaign.meta.preheader,
        heading: f.heading,
        body: f.body,
        ctaLabel: campaign.cta.label,
        ctaUrl: campaign.cta.url,
        delay: { ...f.delay },
      });
    }
    setEditingId(id);
  };

  const saveStep = () => {
    if (!draft || !editingId) return;
    if (editingId === INITIAL_STEP_ID) {
      setMessage(draft.message);
      update((d) => {
        d.meta.subject = draft.subject;
        d.meta.preheader = draft.preheader;
        d.body.heading = draft.heading;
        d.body.paragraphs = draft.body
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((t) => ({ id: uid(), text: t }));
        d.cta.label = draft.ctaLabel;
        d.cta.url = draft.ctaUrl;
      });
    } else {
      setFollowUps((s) =>
        s.map((f) =>
          f.id === editingId
            ? {
                ...f,
                message: draft.message,
                subject: draft.subject,
                heading: draft.heading,
                body: draft.body,
                delay: draft.delay ?? f.delay,
                included: true,
                status: "active",
              }
            : f,
        ),
      );
    }
    setEditingId(null);
    setDraft(null);
    notify("Saved");
  };

  /** Live preview campaign derived from the open draft. */
  const previewCampaign =
    draft !== null
      ? {
          ...campaign,
          meta: { ...campaign.meta, subject: draft.subject, preheader: draft.preheader },
          body: {
            ...campaign.body,
            heading: draft.heading,
            paragraphs: draft.body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((t, i) => ({ id: `d${i}`, text: t })),
          },
          cta: { ...campaign.cta, label: draft.ctaLabel, url: draft.ctaUrl },
        }
      : campaign;

  const editingTitle =
    editingId === INITIAL_STEP_ID
      ? "Initial message"
      : (followUps.find((f) => f.id === editingId)?.name ?? "");

  /* ---------------- Minimised chip ---------------- */
  if (minimized) {
    return (
      <div className="grid min-h-dvh place-items-end bg-zinc-900/70 p-4 font-sans">
        <div className="flex items-center gap-3 border border-zinc-200 bg-white px-4 py-3 shadow-2xl">
          <Pencil size={15} className="text-zinc-400" />
          <div className="flex flex-col">
            <input
              value={campaign.meta.name}
              aria-label="Campaign name"
              onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
              className="w-56 px-1.5 py-0.5 text-[13px] font-semibold text-zinc-900 outline-none hover:bg-zinc-100 focus:bg-zinc-100"
            />
            <span className="px-1.5 text-[11.5px] text-zinc-500">
              {channel ? CHANNEL_LABELS[channel] : "Channel not set"} · minimised
            </span>
          </div>
          <button
            onClick={() => setMinimized(false)}
            aria-label="Resume editor"
            className="grid size-9 place-items-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  const chromeBtn =
    "grid size-8 place-items-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30";
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
        aria-label="Create campaign"
        className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-100 shadow-2xl ${
          expanded ? "" : "md:border md:border-zinc-300"
        } ${editingId ? "blur-[2px]" : ""}`}
      >
        {/* Chrome */}
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <label className="group flex min-w-0 items-center gap-1.5 border border-transparent px-1 transition-colors focus-within:border-blue-600 hover:border-zinc-200">
              <input
                value={campaign.meta.name}
                aria-label="Campaign name — click to rename"
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
              <span className="hidden shrink-0 items-center gap-1.5 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 sm:flex">
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
              className="mr-1 hidden h-8 items-center border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:flex"
            >
              Save changes
            </button>
            <button className={chromeBtn} onClick={() => setMinimized(true)} aria-label="Minimise">
              <Minus size={16} />
            </button>
            <button
              className={chromeBtn}
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Exit full view" : "Full view"}
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <Link to="/" className={chromeBtn} aria-label="Close campaign setup">
              <X size={17} />
            </Link>
          </div>
        </header>

        {/* Step rail */}
        <nav
          aria-label="Campaign steps"
          className="shrink-0 border-b border-zinc-200 bg-white px-3 pb-3 pt-1 sm:px-4"
        >
          <ol className="mx-auto flex max-w-3xl items-stretch gap-2">
            {STEPS.map((s, i) => {
              const locked = s.id !== "preferences" && !canLeavePreferences;
              const done = i < stepIndex;
              const current = step === s.id;
              return (
                <li key={s.id} className="flex min-w-0 flex-1">
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
                      <span
                        className={`truncate text-[12.5px] font-semibold ${
                          current ? "text-zinc-900" : "text-zinc-500"
                        }`}
                      >
                        {s.label}
                      </span>
                    </span>
                    <span
                      className={`h-[3px] w-full transition-colors ${
                        current ? "bg-blue-600" : done ? "bg-blue-200" : "bg-zinc-200"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ---------------- Step bodies ---------------- */}
        {step === "preferences" && (
          <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-100">
            <div className="mx-auto w-full max-w-3xl px-5 py-10">
              <h1 className="text-[20px] font-semibold tracking-tight">
                How should this campaign reach your guests?
              </h1>
              <p className="mt-1 text-[13px] text-zinc-500">
                Pick one. You can change it later — everything else happens in the next step.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
                  title="SMS Only"
                  body="Short text with a tracked link."
                  onClick={() => setChannel("text")}
                />
                <ChannelCard
                  active={channel === "both"}
                  Icon={Repeat}
                  title="Email + SMS"
                  body="Both channels fire in sequence."
                  onClick={() => setChannel("both")}
                />
                <ChannelCard
                  active={channel === "text_fallback"}
                  Icon={Split}
                  title="SMS with Email Fallback"
                  body="Try SMS first, email guests without a phone."
                  onClick={() => setChannel("text_fallback")}
                />
              </div>
            </div>
          </div>
        )}

        {step === "sequence" && (
          <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-100">
            <WorkflowCanvas
              initialExcerpt={
                hasText(channel) && !hasEmail(channel) ? message : initialEmailBody || message
              }
              followUps={followUps}
              rules={rules}
              text={hasText(channel)}
              email={hasEmail(channel)}
              onOpen={openStep}
              onToggleInclude={(id, v) =>
                setFollowUps((s) => s.map((f) => (f.id === id ? { ...f, included: v } : f)))
              }
              onAddFollowUp={() => setFollowUps((s) => [...s, makeFollowUp(s.length)])}
              onAddRule={() => setRuleOpen(true)}
              onRemoveRule={(id) => setRules((s) => s.filter((r) => r.id !== id))}
            />
          </div>
        )}

        {step === "promotion" && (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[26rem_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col overflow-hidden border-r border-zinc-200 bg-white">
              <div className="shrink-0 border-b border-zinc-100 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Promotion
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
              </div>
            </aside>
            <section className="hidden min-h-0 flex-col overflow-y-auto bg-zinc-100 p-6 lg:flex">
              <div className="mx-auto w-full max-w-lg">
                <PromoPreviewCard
                  accent={campaign.theme.accent}
                  hotel={campaign.footer.company || campaign.header.logoText}
                  firstName="Liyat"
                  tagline={tagline}
                  discount={discount}
                  enabled={promoOn}
                />
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3">
          <p className="truncate text-[12px] text-zinc-500">
            {step === "preferences" && !channel
              ? "Select how the campaign communicates to continue."
              : step === "sequence"
                ? "Click any card to edit it. Tick a follow-up to include it."
                : `Step ${stepIndex + 1} of ${STEPS.length}`}
          </p>
          <div className="flex items-center gap-2.5">
            {stepIndex > 0 && (
              <button
                onClick={() => setStep(STEPS[stepIndex - 1].id)}
                className="h-10 border border-zinc-200 px-5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Back
              </button>
            )}
            <button
              disabled={step === "preferences" && !canLeavePreferences}
              onClick={() => {
                if (stepIndex === STEPS.length - 1) return notify("Campaign scheduled");
                setStep(STEPS[stepIndex + 1].id);
              }}
              className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stepIndex === STEPS.length - 1 ? "Schedule campaign" : "Continue"}
            </button>
          </div>
        </footer>
      </div>

      {editingId && draft && (
        <StepOverlay
          title={editingTitle}
          text={hasText(channel)}
          email={hasEmail(channel)}
          draft={draft}
          onChange={(patch) => setDraft((d) => (d ? { ...d, ...patch } : d))}
          onSave={saveStep}
          onCancel={() => {
            setEditingId(null);
            setDraft(null);
          }}
          previewCampaign={previewCampaign}
          sender={campaign.footer.company || campaign.header.logoText}
          templateName={getTemplate(templateId)?.name ?? null}
          templateReady={templateReady}
          onChooseTemplate={() => setPicker(true)}
          mergeTags={MERGE_TAGS}
          media={textMedia}
          mediaSlot={<MediaUploader value={textMedia} onChange={setTextMedia} />}
        />
      )}

      {ruleOpen && (
        <RuleDialog
          onCancel={() => setRuleOpen(false)}
          onAdd={(r) => {
            setRules((s) => [...s, r]);
            setRuleOpen(false);
            notify("Rule added");
          }}
        />
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
          notify("Design applied");
        }}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 bg-zinc-900 px-4 py-2 text-[12.5px] font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
