import { useSyncExternalStore } from "react";
import heroAmalfi from "../assets/hero-amalfi.jpg";
import heroValley from "../assets/hero-valley.jpg";

/* ------------------------------------------------------------------ types */

export type Strategy = "text" | "text_email" | "text_fallback";

export const STRATEGIES: { value: Strategy; label: string; hint: string }[] = [
  { value: "text", label: "Text only", hint: "Text is the only channel used." },
  { value: "text_email", label: "Text + Email", hint: "Both text and email are sent." },
  {
    value: "text_fallback",
    label: "Text with Email fallback",
    hint: "Text is primary. Email is only used if the text cannot be delivered.",
  },
];

export const STRATEGY_LABEL: Record<Strategy, string> = {
  text: "Text only",
  text_email: "Text + Email",
  text_fallback: "Text with Email fallback",
};

export const strategyHasEmail = (s: Strategy) => s !== "text";

export type AudienceKey = "direct" | "ota";
export const AUDIENCE_LABEL: Record<AudienceKey, string> = {
  direct: "Direct guests",
  ota: "OTA guests",
};

export type EmailLayout = "image_first" | "text_first" | "split" | "full_width";
export const LAYOUTS: { value: EmailLayout; label: string }[] = [
  { value: "image_first", label: "Image first" },
  { value: "text_first", label: "Text first" },
  { value: "split", label: "Split" },
  { value: "full_width", label: "Full width" },
];

export type MediaType = "image" | "video" | "document";

export type MediaItem = {
  id: string;
  name: string;
  type: MediaType;
  folder: string;
  size: string;
  dims?: string;
  url?: string;
  addedAt: number;
};

export type EmailTemplate = {
  id: string;
  name: string;
  desc: string;
  category: string;
  accent: string;
  heading: string;
  body: string;
  ctaLabel: string;
  layout: EmailLayout;
};

export type TextContent = { message: string; mediaId: string | null };
export type EmailContent = {
  templateId: string;
  layout: EmailLayout;
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type Variant = {
  customized: boolean;
  text: TextContent;
  email: EmailContent;
};

export type CampaignGroup = "invites" | "transactional" | "in_property";

export type MarketingCampaign = {
  id: string;
  name: string;
  timing: string;
  group: CampaignGroup;
  enabled: boolean;
  strategy: Strategy;
  variants: Record<AudienceKey, Variant>;
};

export type MarketingState = {
  campaigns: MarketingCampaign[];
  media: MediaItem[];
  folders: string[];
  templates: EmailTemplate[];
};

/* ------------------------------------------------------------------- seed */

export const MERGE_TAGS = [
  { token: "{{first_name}}", label: "firstName", tone: "indigo", chip: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  { token: "{{hotel_name}}", label: "hotelName", tone: "sky", chip: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
  { token: "{{checkin_date}}", label: "checkInDate", tone: "amber", chip: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  { token: "{{checkout_date}}", label: "checkOutDate", tone: "emerald", chip: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  { token: "{{booking_link}}", label: "bookingLink", tone: "violet", chip: "bg-violet-100 text-violet-700 hover:bg-violet-200" },
];

const TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome to Your Stay",
    desc: "A warm welcome message for newly booked guests.",
    category: "Welcome",
    accent: "#2563eb",
    heading: "Welcome to {{hotel_name}}",
    body: "Your reservation is confirmed. We are already getting everything ready for your arrival on {{checkin_date}}.",
    ctaLabel: "View your booking",
    layout: "image_first",
  },
  {
    id: "soon",
    name: "Your Stay Starts Soon",
    desc: "Pre-arrival reminder with check-in details.",
    category: "Pre-arrival",
    accent: "#0f766e",
    heading: "Your stay starts soon",
    body: "Check-in opens at 3pm on {{checkin_date}}. Tell us your arrival time and we will have your room ready.",
    ctaLabel: "Plan my arrival",
    layout: "text_first",
  },
  {
    id: "enhance",
    name: "Enhance Your Stay",
    desc: "Upsell rooms, dining and spa during the stay.",
    category: "During stay",
    accent: "#9333ea",
    heading: "Make it a little more special",
    body: "Late checkout, breakfast in bed or a spa hour — add anything to your room in a couple of taps.",
    ctaLabel: "Browse extras",
    layout: "split",
  },
  {
    id: "thanks",
    name: "Thanks for Staying With Us",
    desc: "Post-stay thank you with a direct booking incentive.",
    category: "Post-stay",
    accent: "#b45309",
    heading: "Thanks for staying with us",
    body: "It was a pleasure hosting you. Book direct next time and enjoy 15% off plus free late checkout.",
    ctaLabel: "Book your next stay",
    layout: "image_first",
  },
  {
    id: "offer",
    name: "Members Only Offer",
    desc: "Promotional layout built around one strong offer.",
    category: "Promotional",
    accent: "#be123c",
    heading: "15% off, just for you",
    body: "Your private rate is live for the next 14 days. Direct bookings only — no fees, free cancellation.",
    ctaLabel: "Claim my rate",
    layout: "full_width",
  },
  {
    id: "review",
    name: "How Did We Do?",
    desc: "Short review request with a single clear action.",
    category: "Review",
    accent: "#111827",
    heading: "How did we do, {{first_name}}?",
    body: "A short word about your stay helps us get better and helps other guests choose well.",
    ctaLabel: "Leave a review",
    layout: "text_first",
  },
];

export const FOLDERS = [
  "Just booked",
  "Before arrival",
  "During stay",
  "Post-checkout",
  "Promotions",
  "Hotel information",
];

const MEDIA: MediaItem[] = [
  { id: "m1", name: "Pool.jpg", type: "image", folder: "Hotel information", size: "1.2 MB", dims: "1600 × 1067", url: heroAmalfi, addedAt: Date.now() - 3600_000 },
  { id: "m2", name: "Lobby.jpg", type: "image", folder: "Hotel information", size: "980 KB", dims: "1440 × 960", url: heroValley, addedAt: Date.now() - 7200_000 },
  { id: "m3", name: "Suite-terrace.jpg", type: "image", folder: "Promotions", size: "1.6 MB", dims: "2000 × 1333", url: heroAmalfi, addedAt: Date.now() - 86_400_000 },
  { id: "m4", name: "Welcome.mp4", type: "video", folder: "Just booked", size: "4.8 MB", addedAt: Date.now() - 2 * 86_400_000 },
  { id: "m5", name: "Arrival-guide.pdf", type: "document", folder: "Before arrival", size: "320 KB", addedAt: Date.now() - 3 * 86_400_000 },
  { id: "m6", name: "Spa-menu.pdf", type: "document", folder: "During stay", size: "410 KB", addedAt: Date.now() - 4 * 86_400_000 },
  { id: "m7", name: "Breakfast.jpg", type: "image", folder: "During stay", size: "870 KB", dims: "1280 × 853", url: heroValley, addedAt: Date.now() - 5 * 86_400_000 },
  { id: "m8", name: "Direct-offer.jpg", type: "image", folder: "Promotions", size: "1.1 MB", dims: "1600 × 900", url: heroAmalfi, addedAt: Date.now() - 6 * 86_400_000 },
];

type Seed = {
  id: string;
  name: string;
  timing: string;
  group: CampaignGroup;
  template: string;
  direct: string;
  ota: string;
  strategy?: Strategy;
  customized?: AudienceKey[];
};

const SEEDS: Seed[] = [
  { id: "just-booked", name: "Just booked", timing: "Immediately after booking", group: "invites", template: "welcome", strategy: "text_email", customized: ["direct"], direct: "Hi {{first_name}}, thanks for booking directly with {{hotel_name}}. Your best rate is locked in — see you on {{checkin_date}}.", ota: "Hi {{first_name}}, your reservation at {{hotel_name}} is confirmed for {{checkin_date}}. We are looking forward to welcoming you." },
  { id: "before-arrival", name: "Before arrival", timing: "1 day before check-in", group: "invites", template: "soon", strategy: "text_email", direct: "Hi {{first_name}}, your stay at {{hotel_name}} starts tomorrow. Reply with your arrival time and we will have everything ready.", ota: "Hi {{first_name}}, check-in at {{hotel_name}} opens tomorrow at 3pm. Anything we can prepare for you?" },
  { id: "during-stay", name: "During stay", timing: "Morning after check-in", group: "invites", template: "enhance", direct: "Good morning {{first_name}} — breakfast runs until 10:30 and late checkout is on us if you would like it.", ota: "Good morning {{first_name}} — breakfast runs until 10:30. Ask us anything, we are one text away." },
  { id: "post-checkout", name: "Post-checkout", timing: "1 day after checkout", group: "invites", template: "thanks", strategy: "text_fallback", customized: ["ota"], direct: "Thanks for staying with us, {{first_name}}. Your direct guest rate is waiting whenever you are: {{booking_link}}", ota: "Thanks for staying with us, {{first_name}}. Book direct next time for 15% off: {{booking_link}}" },
  { id: "after-last-visit", name: "After last visit", timing: "15 days – 3 months since last visit", group: "invites", template: "offer", direct: "Hi {{first_name}}, it has been a while. Your direct rate at {{hotel_name}} is still the best one going.", ota: "Hi {{first_name}}, ready for another stay at {{hotel_name}}? Book direct and skip the fees." },
  { id: "lost-3", name: "Lost 3 months", timing: "3 months since guest's last stay", group: "invites", template: "offer", direct: "Three months already, {{first_name}}. Here is 10% off your next direct booking.", ota: "Three months already, {{first_name}}. Here is 10% off when you book with us directly." },
  { id: "lost-6", name: "Lost 6 months", timing: "6 months since guest's last stay", group: "invites", template: "offer", direct: "We miss you, {{first_name}}. 12% off your next stay at {{hotel_name}}.", ota: "We miss you, {{first_name}}. 12% off when you book direct at {{hotel_name}}." },
  { id: "lost-9", name: "Lost 9 months", timing: "9 months since guest's last stay", group: "invites", template: "offer", direct: "{{first_name}}, your room is still here. 15% off direct bookings this month.", ota: "{{first_name}}, come back to {{hotel_name}} — 15% off direct bookings this month." },
  { id: "lost-12", name: "Lost 12 months", timing: "12 months since guest's last stay", group: "invites", template: "offer", direct: "A year since your last stay, {{first_name}}. Let's fix that — 15% off direct.", ota: "A year since your last stay, {{first_name}}. Book direct and save 15%." },
  { id: "lost-15", name: "Lost 15 months", timing: "15 months since guest's last stay", group: "invites", template: "offer", direct: "{{first_name}}, here is our best direct offer of the year.", ota: "{{first_name}}, here is our best direct offer of the year." },
  { id: "lost-15-plus", name: "Lost 15 months plus", timing: "More than 15 months since last stay", group: "invites", template: "offer", direct: "It has been a long time, {{first_name}}. 20% off to welcome you back.", ota: "It has been a long time, {{first_name}}. 20% off to welcome you back." },

  { id: "cancelled", name: "Cancelled", timing: "When a guest cancels their booking", group: "transactional", template: "thanks", strategy: "text", direct: "Sorry to see the change of plans, {{first_name}}. Your direct rate will be here when you rebook.", ota: "Sorry to see the change of plans, {{first_name}}. We hope to host you another time." },
  { id: "no-show", name: "No show", timing: "When a guest doesn't show up", group: "transactional", template: "thanks", strategy: "text", direct: "We missed you, {{first_name}}. Let us know if you would like to rebook.", ota: "We missed you, {{first_name}}. Let us know if you would like to rebook." },
  { id: "review", name: "Review", timing: "After the stay, review request", group: "transactional", template: "review", strategy: "text_email", direct: "How was your stay at {{hotel_name}}, {{first_name}}? A quick word means a lot.", ota: "How was your stay at {{hotel_name}}, {{first_name}}? A quick word means a lot." },

  { id: "day-before-checkin", name: "Day before check-in", timing: "Stay reminder for booked guests", group: "in_property", template: "soon", strategy: "text", direct: "See you tomorrow, {{first_name}}. Check-in from 3pm at {{hotel_name}}.", ota: "See you tomorrow, {{first_name}}. Check-in from 3pm at {{hotel_name}}." },
  { id: "after-checkin", name: "After check-in", timing: "Welcome message after check-in", group: "in_property", template: "welcome", strategy: "text", direct: "Welcome in, {{first_name}}. Anything you need, just reply to this message.", ota: "Welcome in, {{first_name}}. Anything you need, just reply to this message." },
];

function variantFrom(seed: Seed, key: AudienceKey): Variant {
  const t = TEMPLATES.find((x) => x.id === seed.template) ?? TEMPLATES[0];
  return {
    customized: seed.customized?.includes(key) ?? false,
    text: { message: key === "direct" ? seed.direct : seed.ota, mediaId: null },
    email: {
      templateId: t.id,
      layout: t.layout,
      subject: t.heading,
      preheader: "We're looking forward to welcoming you",
      heading: t.heading,
      body: t.body,
      ctaLabel: t.ctaLabel,
      ctaUrl: "https://directful.com/book",
    },
  };
}

function seedState(): MarketingState {
  return {
    campaigns: SEEDS.map((s) => ({
      id: s.id,
      name: s.name,
      timing: s.timing,
      group: s.group,
      enabled: false,
      strategy: s.strategy ?? "text",
      variants: { direct: variantFrom(s, "direct"), ota: variantFrom(s, "ota") },
    })),
    media: MEDIA,
    folders: FOLDERS,
    templates: TEMPLATES,
  };
}

/* ------------------------------------------------------------------ store */

const KEY = "directful.marketing.v1";
let state: MarketingState = seedState();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MarketingState;
      if (parsed?.campaigns?.length) {
        // media urls come from bundled assets; always take the fresh ones
        state = { ...parsed, media: parsed.media?.length ? parsed.media : MEDIA, templates: TEMPLATES };
      }
    }
  } catch {
    /* ignore */
  }
}

export function useMarketing(): MarketingState {
  hydrate();
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export function mutate(fn: (draft: MarketingState) => void) {
  const next = JSON.parse(JSON.stringify(state)) as MarketingState;
  // assets are not serialisable-safe round trip for bundled urls, but they are
  // plain strings, so the clone is fine.
  fn(next);
  state = next;
  persist();
  emit();
}

/* ------------------------------------------------------------------ utils */

export const uid = () => Math.random().toString(36).slice(2, 9);

export function defaultVariant(campaignId: string, key: AudienceKey): Variant {
  const seed = SEEDS.find((s) => s.id === campaignId);
  if (!seed) throw new Error("unknown campaign");
  const v = variantFrom(seed, key);
  v.customized = false;
  return v;
}

export function customizedCount(c: MarketingCampaign) {
  return (["direct", "ota"] as AudienceKey[]).filter((k) => c.variants[k].customized).length;
}

export function renderPreview(input: string) {
  const values: Record<string, string> = {
    "{{first_name}}": "Sevket",
    "{{hotel_name}}": "Holiday Inn Times Square",
    "{{checkin_date}}": "March 12",
    "{{checkout_date}}": "March 15",
    "{{booking_link}}": "directful.com/book",
  };
  return input.replace(/\{\{[a-z_]+\}\}/g, (m) => values[m] ?? m);
}

export const GROUP_META: Record<CampaignGroup, { title: string; desc: string }> = {
  invites: {
    title: "Automated Invites",
    desc: "Manage automated guest messages across the guest journey.",
  },
  transactional: {
    title: "Automated Transactional",
    desc: "Messages triggered by a change to the booking itself.",
  },
  in_property: {
    title: "In-Property Automated Transactional",
    desc: "Messages sent around arrival and the in-property experience.",
  },
};
