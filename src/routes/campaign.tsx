import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  X,
  CalendarCheck2,
  Users,
  Gift,
  Coins,
  Clock,
  Info,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Select } from "@/components/editor/Select";
import { SmsPreview } from "@/components/editor/SmsPreview";
import { PhoneMockup } from "@/components/editor/PhoneMockup";
import { Field, TextArea, TextInput, ToggleRow } from "@/components/editor/controls";
import { MERGE_TOKENS, renderTokens } from "@/lib/campaign";

export const Route = createFileRoute("/campaign")({
  head: () => ({
    meta: [
      { title: "Create Campaign · Directful Studio" },
      {
        name: "description",
        content:
          "Set the channel strategy, audience and schedule for a guest reactivation campaign, with a live iPhone preview of the message.",
      },
      { property: "og:title", content: "Create Campaign · Directful Studio" },
      {
        property: "og:description",
        content: "Choose text, email or both, pick an audience and preview the message live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignSetup,
});

type Channel = "text" | "email" | "text_email" | "email_then_text";

const CHANNELS: { value: Channel; label: string; hint: string }[] = [
  {
    value: "text",
    label: "Text only",
    hint: "SMS only, to guests with a valid mobile number and a compliant relationship.",
  },
  {
    value: "email",
    label: "Email only",
    hint: "Email only, to guests who opted in to marketing email.",
  },
  {
    value: "text_email",
    label: "Text and email",
    hint: "Both channels at once for the widest reach on day one.",
  },
  {
    value: "email_then_text",
    label: "Email first, then text",
    hint: "Send email first and follow up by SMS to guests who did not open.",
  },
];

const AUDIENCES = [
  { value: "everyone", label: "Everyone", hint: "All contactable past guests" },
  { value: "past_90", label: "Stayed in last 90 days", hint: "Recent check-outs" },
  { value: "loyalty", label: "Loyalty members", hint: "Silver tier and above" },
  { value: "lapsed", label: "Lapsed guests", hint: "No stay in 12 months" },
];

const TABS = [
  { id: "preferences", label: "Preferences" },
  { id: "content", label: "Text content" },
  { id: "promotion", label: "Promotion" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function CampaignSetup() {
  const [tab, setTab] = useState<Tab>("preferences");
  const [sequence, setSequence] = useState(false);
  const [channel, setChannel] = useState<Channel>("text");
  const [audience, setAudience] = useState("everyone");
  const [startDate, setStartDate] = useState("2026-07-29");
  const [cutOff, setCutOff] = useState(false);
  const [cutOffDate, setCutOffDate] = useState("2026-08-30");
  const [message, setMessage] = useState(
    "{{first_name}}! It's been a while since you booked to stay on {{checkout_date}} at {{hotel}}. Find the best hidden rates for your next trip.",
  );
  const [link, setLink] = useState("https://directful.com/r/9f2ab");
  const [promoCode, setPromoCode] = useState("DIRECT15");
  const [discount, setDiscount] = useState("15");
  const [subject, setSubject] = useState("Your next stay awaits — 15% off direct bookings");

  const guests = audience === "everyone" ? 1840 : audience === "past_90" ? 412 : audience === "loyalty" ? 268 : 733;
  const usesText = channel !== "email";
  const usesEmail = channel !== "text";
  const cost = usesText ? (guests * 0.06).toFixed(2) : "0.00";

  const insertToken = (t: string) => setMessage((m) => `${m} ${t}`.trim());

  return (
    <div className="min-h-dvh bg-zinc-900/70 p-0 font-sans text-zinc-900 md:p-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        {/* Setup modal */}
        <section
          role="dialog"
          aria-label="Create campaign"
          className="flex min-h-dvh flex-col overflow-hidden bg-white shadow-2xl md:min-h-0 md:rounded-2xl"
        >
          <header className="shrink-0 border-b border-zinc-100 bg-zinc-50/80 px-6 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[17px] font-semibold tracking-tight">
                  Guest reactivation
                </h1>
                <p className="mt-0.5 text-[12.5px] text-zinc-500">
                  Draft created Jul 29, 03:27 AM
                </p>
              </div>
              <Link
                to="/"
                aria-label="Close campaign setup"
                className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900"
              >
                <X size={17} />
              </Link>
            </div>
            <nav className="-mb-px mt-4 flex gap-6" aria-label="Campaign setup steps">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id}
                  className={`border-b-2 pb-3 text-[13.5px] font-medium transition-colors ${
                    tab === t.id
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
            {tab === "preferences" && (
              <>
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <ToggleRow
                        label="Enable message sequence"
                        hint="Send automatic follow-up messages with configurable delays between steps."
                        checked={sequence}
                        onChange={setSequence}
                      />
                    </div>
                    <span className="mt-1 flex shrink-0 items-center gap-1 text-[12px] font-medium text-blue-700">
                      Tutorial <Info size={14} />
                    </span>
                  </div>
                </div>

                <Field
                  label="Message channel strategy"
                  hint={usesText && usesEmail ? "Text + email" : usesText ? "SMS" : "Email"}
                >
                  <Select
                    ariaLabel="Message channel strategy"
                    value={channel}
                    options={CHANNELS}
                    onChange={setChannel}
                  />
                  <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
                    {CHANNELS.find((c) => c.value === channel)!.hint}
                  </p>
                </Field>

                <Field label="Audience" hint={`Approx. ${guests.toLocaleString()} guests`}>
                  <Select
                    ariaLabel="Audience"
                    value={audience}
                    options={AUDIENCES}
                    onChange={setAudience}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={usesText ? "Start sending texts on" : "Start sending on"}>
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
                    hint="Enable this to stop sending at a certain date."
                    checked={cutOff}
                    onChange={setCutOff}
                  />
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <CalendarCheck2 size={22} className="text-emerald-600" />
                    <div>
                      <p className="text-[12px] font-medium text-emerald-800/70">
                        Estimated end date
                      </p>
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
                      {usesText ? "250 complimentary texts" : "Unlimited emails on your plan"}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Coins size={16} className="text-emerald-600" />
                      ${cost} approx. ({usesText ? "$0.06 / text" : "$0.00 / email"})
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock size={16} className="text-emerald-600" />
                      Sent around 5pm in each guest&rsquo;s time zone
                    </li>
                  </ul>
                </div>
              </>
            )}

            {tab === "content" && (
              <>
                {usesEmail && (
                  <Field label="Email subject">
                    <TextInput value={subject} onChange={setSubject} />
                  </Field>
                )}
                <Field
                  label={usesText ? "Text message" : "Message"}
                  hint={`${renderTokens(message).length + (link ? link.length + 1 : 0)} chars`}
                >
                  <TextArea rows={5} value={message} onChange={setMessage} />
                </Field>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[11.5px] font-medium text-zinc-400">Merge tags</span>
                  {MERGE_TOKENS.map((t) => (
                    <button
                      key={t}
                      onClick={() => insertToken(t)}
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                    >
                      {t.replace(/[{}]/g, "").replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
                <Field label="Tracked link" hint="Shortened per guest">
                  <TextInput value={link} onChange={setLink} placeholder="https://…" />
                </Field>
                {usesEmail && (
                  <Link
                    to="/structured"
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 text-[13px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                  >
                    <Mail size={15} /> Design the email in the builder
                  </Link>
                )}
              </>
            )}

            {tab === "promotion" && (
              <>
                <Field label="Promo code">
                  <TextInput value={promoCode} onChange={setPromoCode} />
                </Field>
                <Field label="Discount" hint="% off direct bookings">
                  <TextInput value={discount} onChange={setDiscount} />
                </Field>
                <div className="rounded-xl border border-zinc-200 p-4 text-[13px] leading-relaxed text-zinc-600">
                  Guests booking direct with <strong className="text-zinc-900">{promoCode}</strong>{" "}
                  get <strong className="text-zinc-900">{discount}% off</strong> plus free late
                  checkout on select dates.
                </div>
              </>
            )}
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-zinc-100 bg-white px-6 py-4">
            <button className="h-10 rounded-lg border border-zinc-200 px-5 text-[13px] font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50">
              Save changes
            </button>
            <button
              onClick={() => {
                const i = TABS.findIndex((t) => t.id === tab);
                setTab(TABS[Math.min(TABS.length - 1, i + 1)].id);
              }}
              className="h-10 rounded-lg bg-zinc-900 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Next
            </button>
          </footer>
        </section>

        {/* Live device preview */}
        <aside className="hidden justify-center pt-2 lg:flex">
          {usesText ? (
            <SmsPreview message={message} link={link} scale={0.74} />
          ) : (
            <PhoneMockup scale={0.74}>
              <div className="px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Inbox
                </p>
                <div className="mt-3 rounded-xl border border-zinc-200 p-3.5">
                  <p className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
                    <MessageSquare size={13} /> Hellas Gadgets Kallithea
                  </p>
                  <p className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-900">
                    {subject}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug text-zinc-500">
                    {renderTokens(message)}
                  </p>
                </div>
              </div>
            </PhoneMockup>
          )}
        </aside>
      </div>
    </div>
  );
}
