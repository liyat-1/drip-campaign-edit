import { createCanvasCampaign, createStructuredCampaign, type Campaign } from "./campaign";

export type EmailTemplate = {
  id: string;
  name: string;
  desc: string;
  build: () => Campaign;
};

function editorial(): Campaign {
  const c = createStructuredCampaign();
  c.meta.name = "Editorial feature";
  c.theme.accent = "#0f766e";
  c.theme.pageBg = "#f4f4f5";
  c.header.bg = "#0f766e";
  c.header.logoText = "THE LODGE";
  c.header.align = "left";
  c.hero.height = 320;
  c.body.align = "left";
  c.cta.bg = "#0f766e";
  c.cta.align = "left";
  c.cta.fullWidth = false;
  c.cta.radius = 2;
  c.details.visible = true;
  return c;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "classic",
    name: "Default",
    desc: "Left aligned copy with a full-width button. Safe in every client.",
    build: createCanvasCampaign,
  },
  {
    id: "valley",
    name: "Valley Lodge",
    desc: "Warm centred header, inline button and a guest detail grid.",
    build: createStructuredCampaign,
  },
  {
    id: "editorial",
    name: "Editorial feature",
    desc: "Tall hero, magazine spacing and a left aligned call to action.",
    build: editorial,
  },
];
