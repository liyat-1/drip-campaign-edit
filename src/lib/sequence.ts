/**
 * Campaign message sequence. The initial message is the campaign itself;
 * follow-ups are extra messages sent after a delay. Kept deliberately simple
 * so the timeline can later grow branches, A/B tests and per-step channels.
 */

export type DelayUnit = "minutes" | "hours" | "days" | "weeks";

export type SeqStatus = "active" | "inactive" | "draft";

export type FollowUp = {
  id: string;
  name: string;
  status: SeqStatus;
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

export function makeFollowUp(index: number): FollowUp {
  const n = index + 1;
  return {
    id: sid(),
    name: `Follow-up ${n}`,
    status: n === 1 ? "active" : "draft",
    delay: { value: n === 1 ? 2 : 3, unit: "days" },
    message:
      n === 1
        ? "Hi {{first_name}}, just a friendly reminder from {{hotel}} — we have a special offer waiting for you."
        : "Hi {{first_name}}, this is our final reminder from {{hotel}}. We hope to see you soon!",
    subject:
      n === 1 ? "Still thinking about your next stay?" : "Last chance — your offer expires soon",
    heading: n === 1 ? "A reminder from {{hotel}}" : "Final reminder",
    body:
      n === 1
        ? "We saved your rate. Book directly and enjoy your member discount on your next stay."
        : "Your exclusive offer is about to expire. Book now to lock in your rate.",
  };
}
