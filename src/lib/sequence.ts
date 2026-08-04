/**
 * Campaign message sequence. The initial message is the campaign itself;
 * follow-ups are optional steps that already exist in the workflow and are
 * switched on with a checkbox. Kept deliberately simple so the workflow can
 * later grow branches, rules and per-step channels.
 */

export type DelayUnit = "minutes" | "hours" | "days" | "weeks";

export type SeqStatus = "active" | "inactive" | "draft";

export type FollowUp = {
  id: string;
  name: string;
  status: SeqStatus;
  /** Whether this step is actually sent. Content is never deleted. */
  included: boolean;
  delay: { value: number; unit: DelayUnit };
  /** SMS copy for this step. */
  message: string;
  /** Email copy for this step. */
  subject: string;
  heading: string;
  body: string;
};

export const INITIAL_STEP_ID = "initial";

export const DELAY_UNITS: { value: DelayUnit; label: string }[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

const sid = () => `fu_${Math.random().toString(36).slice(2, 9)}`;

export function delayLabel(d: FollowUp["delay"]) {
  const unit = d.value === 1 ? d.unit.replace(/s$/, "") : d.unit;
  return `Wait ${d.value} ${unit}`;
}

const PRESETS = [
  {
    name: "Follow-up 1",
    delay: { value: 2, unit: "days" as DelayUnit },
    message:
      "Just checking in, {{first_name}} — your exclusive rate at {{hotel}} is still available. Reserve today before it expires.",
    subject: "Still thinking about your next stay?",
    heading: "Just checking in",
    body: "We saved your rate at {{hotel}}. Book directly and enjoy your member discount on your next stay.",
  },
  {
    name: "Follow-up 2",
    delay: { value: 3, unit: "days" as DelayUnit },
    message:
      "Last call, {{first_name}} — don't miss your member rate at {{hotel}}. The offer closes soon.",
    subject: "Last call — don't miss your member rate",
    heading: "Last call",
    body: "Your exclusive offer is about to expire. Book now to lock in your rate at {{hotel}}.",
  },
  {
    name: "Follow-up 3",
    delay: { value: 5, unit: "days" as DelayUnit },
    message:
      "One more thing, {{first_name}} — we'd love to welcome you back to {{hotel}} whenever you're ready.",
    subject: "Whenever you're ready, we're here",
    heading: "We'd love to have you back",
    body: "No rush — your guest profile keeps your preferences ready for your next stay at {{hotel}}.",
  },
];

export function makeFollowUp(index: number): FollowUp {
  const p = PRESETS[index % PRESETS.length];
  const n = index + 1;
  return {
    id: sid(),
    name: index < PRESETS.length ? p.name : `Follow-up ${n}`,
    status: "draft",
    included: false,
    delay: { ...p.delay },
    message: p.message,
    subject: p.subject,
    heading: p.heading,
    body: p.body,
  };
}

/** Every new campaign starts with three optional follow-ups already drafted. */
export function defaultFollowUps(): FollowUp[] {
  return [0, 1, 2].map(makeFollowUp);
}

/* ------------------------- Rules ------------------------- */

export type RuleTrigger =
  | "booked"
  | "opened"
  | "not_opened"
  | "clicked"
  | "not_clicked"
  | "replied"
  | "no_booking_days";

export type RuleAction = "stop" | "continue" | "another_followup";

export type Rule = {
  id: string;
  trigger: RuleTrigger;
  action: RuleAction;
  /** Only used by the "no booking after X days" trigger. */
  days: number;
};

export const RULE_TRIGGERS: { value: RuleTrigger; label: string }[] = [
  { value: "booked", label: "Guest booked" },
  { value: "opened", label: "Guest opened the email" },
  { value: "not_opened", label: "Guest didn't open the email" },
  { value: "clicked", label: "Guest clicked the booking button" },
  { value: "not_clicked", label: "Guest didn't click the booking button" },
  { value: "replied", label: "Guest replied" },
  { value: "no_booking_days", label: "No booking after X days" },
];

export const RULE_ACTIONS: { value: RuleAction; label: string; hint: string }[] = [
  { value: "stop", label: "Stop campaign", hint: "No further messages are sent to that guest." },
  { value: "continue", label: "Continue campaign", hint: "The guest keeps the normal schedule." },
  {
    value: "another_followup",
    label: "Send another follow-up",
    hint: "One extra reminder is added for that guest.",
  },
];

export function ruleSentence(r: Rule) {
  const trigger =
    r.trigger === "no_booking_days"
      ? `No booking after ${r.days} days`
      : (RULE_TRIGGERS.find((t) => t.value === r.trigger)?.label ?? "");
  const action = RULE_ACTIONS.find((a) => a.value === r.action)?.label ?? "";
  return `If ${trigger.toLowerCase()} → ${action}`;
}

export function makeRule(): Rule {
  return { id: `rule_${Math.random().toString(36).slice(2, 9)}`, trigger: "booked", action: "stop", days: 3 };
}
