import type { BlockId } from "./EmailPreview";
import { uid, type Campaign } from "@/lib/campaign";
import { RichTextEditor } from "./RichTextEditor";
import { Select } from "./Select";
import {
  ColorField,
  Field,
  Group,
  ImageField,
  SegmentedField,
  SliderField,
  TextArea,
  TextInput,
  ToggleRow,
  inputCls,
} from "./controls";

type Props = {
  campaign: Campaign;
  update: (fn: (d: Campaign) => void) => void;
};

const ALIGN_OPTS = [
  { value: "left" as const, label: "Left" },
  { value: "center" as const, label: "Center" },
  { value: "right" as const, label: "Right" },
];

export const BLOCK_LABELS: Record<BlockId, string> = {
  header: "Header · Logo",
  hero: "Hero · Image",
  body: "Content · Text",
  cta: "Button · CTA",
  details: "Detail grid",
  footer: "Footer · Social",
};

export function BlockForm({ id, campaign, update }: Props & { id: BlockId }) {
  if (id === "header") return <HeaderForm campaign={campaign} update={update} />;
  if (id === "hero") return <HeroForm campaign={campaign} update={update} />;
  if (id === "body") return <BodyForm campaign={campaign} update={update} />;
  if (id === "cta") return <CtaForm campaign={campaign} update={update} />;
  if (id === "details") return <DetailsForm campaign={campaign} update={update} />;
  return <FooterForm campaign={campaign} update={update} />;
}

function VisibilityRow({
  visible,
  onChange,
}: {
  visible: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="border-b border-zinc-100 px-4 py-2.5">
      <ToggleRow
        label="Show this block"
        hint="Hidden blocks are excluded from the send"
        checked={visible}
        onChange={onChange}
      />
    </div>
  );
}

/* --------------------------------- Header --------------------------------- */

function HeaderForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow visible={c.header.visible} onChange={(v) => update((d) => void (d.header.visible = v))} />
      <Group title="Logo">
        <ImageField
          value={c.header.logoUrl ?? ""}
          alt={c.header.logoText}
          onChange={(v) => update((d) => void (d.header.logoUrl = v || null))}
          onAltChange={(v) => update((d) => void (d.header.logoText = v))}
        />
        <Field label="Fallback wordmark" hint="Used when no logo image">
          <TextInput value={c.header.logoText} onChange={(v) => update((d) => void (d.header.logoText = v))} />
        </Field>
      </Group>
      <Group title="Style">
        <ColorField label="Background" value={c.header.bg} onChange={(v) => update((d) => void (d.header.bg = v))} />
        <SliderField
          label="Padding"
          value={c.header.padding}
          min={0}
          max={64}
          onChange={(v) => update((d) => void (d.header.padding = v))}
        />
        <SegmentedField
          label="Alignment"
          value={c.header.align}
          options={ALIGN_OPTS}
          onChange={(v) => update((d) => void (d.header.align = v))}
        />
      </Group>
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function HeroForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow visible={c.hero.visible} onChange={(v) => update((d) => void (d.hero.visible = v))} />
      <Group title="Image">
        <ImageField
          value={c.hero.imageUrl}
          alt={c.hero.alt}
          onChange={(v) => update((d) => void (d.hero.imageUrl = v))}
          onAltChange={(v) => update((d) => void (d.hero.alt = v))}
        />
      </Group>
      <Group title="Style">
        <SliderField label="Height" value={c.hero.height} min={80} max={480} onChange={(v) => update((d) => void (d.hero.height = v))} />
        <SliderField label="Corner radius" value={c.hero.radius} min={0} max={40} onChange={(v) => update((d) => void (d.hero.radius = v))} />
        <ColorField label="Overlay color" value={c.hero.overlayColor} onChange={(v) => update((d) => void (d.hero.overlayColor = v))} />
        <SliderField label="Overlay opacity" unit="%" value={c.hero.overlay} min={0} max={90} onChange={(v) => update((d) => void (d.hero.overlay = v))} />
      </Group>
    </>
  );
}

/* ---------------------------------- Body ---------------------------------- */

function BodyForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow visible={c.body.visible} onChange={(v) => update((d) => void (d.body.visible = v))} />
      <Group title="Heading">
        <RichTextEditor
          label="Heading text"
          minHeight={54}
          value={c.body.heading}
          onChange={(v) => update((d) => void (d.body.heading = v))}
        />
        <SliderField label="Size" value={c.body.headingSize} min={14} max={48} onChange={(v) => update((d) => void (d.body.headingSize = v))} />
        <ColorField label="Color" value={c.body.headingColor} onChange={(v) => update((d) => void (d.body.headingColor = v))} />
      </Group>

      <Group
        title="Paragraphs"
        action={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              update((d) => d.body.paragraphs.push({ id: uid(), text: "New paragraph" }));
            }}
            className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
          >
            + Add
          </span>
        }
      >
        {c.body.paragraphs.map((p, i) => (
          <div key={p.id} className="rounded-md border border-zinc-200 p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Block {i + 1}
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() =>
                    update((d) => {
                      const a = d.body.paragraphs;
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                    })
                  }
                  className="rounded px-1 text-[11px] text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={i === c.body.paragraphs.length - 1}
                  onClick={() =>
                    update((d) => {
                      const a = d.body.paragraphs;
                      [a[i + 1], a[i]] = [a[i], a[i + 1]];
                    })
                  }
                  className="rounded px-1 text-[11px] text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Delete paragraph"
                  onClick={() =>
                    update((d) => {
                      d.body.paragraphs = d.body.paragraphs.filter((x) => x.id !== p.id);
                    })
                  }
                  className="rounded px-1 text-[11px] text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            </div>
            <RichTextEditor
              ariaLabel={`Paragraph ${i + 1}`}
              value={p.text}
              minHeight={80}
              onChange={(v) =>
                update((d) => {
                  const t = d.body.paragraphs.find((x) => x.id === p.id);
                  if (t) t.text = v;
                })
              }
            />
          </div>
        ))}
      </Group>

      <Group title="Body style">
        <SliderField label="Text size" value={c.body.textSize} min={11} max={22} onChange={(v) => update((d) => void (d.body.textSize = v))} />
        <ColorField label="Text color" value={c.body.textColor} onChange={(v) => update((d) => void (d.body.textColor = v))} />
        <SegmentedField label="Alignment" value={c.body.align} options={ALIGN_OPTS} onChange={(v) => update((d) => void (d.body.align = v))} />
      </Group>
    </>
  );
}


/* ----------------------------------- CTA ---------------------------------- */

function CtaForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow visible={c.cta.visible} onChange={(v) => update((d) => void (d.cta.visible = v))} />
      <Group title="Button">
        <Field label="Label">
          <TextInput value={c.cta.label} onChange={(v) => update((d) => void (d.cta.label = v))} />
        </Field>
        <Field label="Destination URL">
          <TextInput value={c.cta.url} onChange={(v) => update((d) => void (d.cta.url = v))} placeholder="https://…" />
        </Field>
      </Group>
      <Group title="Appearance">
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Background" value={c.cta.bg} onChange={(v) => update((d) => void (d.cta.bg = v))} />
          <ColorField label="Text" value={c.cta.color} onChange={(v) => update((d) => void (d.cta.color = v))} />
        </div>
        <SliderField label="Corner radius" value={c.cta.radius} min={0} max={32} onChange={(v) => update((d) => void (d.cta.radius = v))} />
        <div className="grid grid-cols-2 gap-2">
          <SliderField label="Pad Y" value={c.cta.padY} min={6} max={28} onChange={(v) => update((d) => void (d.cta.padY = v))} />
          <SliderField label="Pad X" value={c.cta.padX} min={8} max={60} onChange={(v) => update((d) => void (d.cta.padX = v))} />
        </div>
        <SegmentedField label="Alignment" value={c.cta.align} options={ALIGN_OPTS} onChange={(v) => update((d) => void (d.cta.align = v))} />
        <ToggleRow label="Full width" checked={c.cta.fullWidth} onChange={(v) => update((d) => void (d.cta.fullWidth = v))} />
      </Group>
      <Group title="Tracking">
        <ToggleRow label="Open in new tab" checked={c.cta.newTab} onChange={(v) => update((d) => void (d.cta.newTab = v))} />
        <ToggleRow label="Append UTM parameters" checked={c.cta.utm} onChange={(v) => update((d) => void (d.cta.utm = v))} />
      </Group>
    </>
  );
}

/* --------------------------------- Details -------------------------------- */

function DetailsForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow visible={c.details.visible} onChange={(v) => update((d) => void (d.details.visible = v))} />
      <Group title="Layout">
        <SegmentedField
          label="Columns"
          value={c.details.columns}
          options={[
            { value: 1 as const, label: "1" },
            { value: 2 as const, label: "2" },
            { value: 3 as const, label: "3" },
          ]}
          onChange={(v) => update((d) => void (d.details.columns = v))}
        />
        <SliderField label="Gap" value={c.details.gap} min={4} max={48} onChange={(v) => update((d) => void (d.details.gap = v))} />
      </Group>
      <Group
        title="Items"
        action={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              update((d) => d.details.items.push({ id: uid(), label: "Label", value: "Value" }));
            }}
            className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
          >
            + Add
          </span>
        }
      >
        {c.details.items.map((it) => (
          <div key={it.id} className="space-y-1.5 rounded-md border border-zinc-200 p-2">
            <div className="flex gap-1.5">
              <input
                value={it.label}
                aria-label="Item label"
                onChange={(e) =>
                  update((d) => {
                    const t = d.details.items.find((x) => x.id === it.id);
                    if (t) t.label = e.target.value;
                  })
                }
                className={inputCls}
              />
              <button
                type="button"
                aria-label="Delete item"
                onClick={() =>
                  update((d) => {
                    d.details.items = d.details.items.filter((x) => x.id !== it.id);
                  })
                }
                className="shrink-0 rounded-md border border-zinc-200 px-2 text-[12px] text-zinc-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
            <input
              value={it.value}
              aria-label="Item value"
              onChange={(e) =>
                update((d) => {
                  const t = d.details.items.find((x) => x.id === it.id);
                  if (t) t.value = e.target.value;
                })
              }
              className={inputCls}
            />
          </div>
        ))}
      </Group>
    </>
  );
}

/* --------------------------------- Footer --------------------------------- */

const SOCIAL_LABELS: Record<string, string> = {
  x: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

function FooterForm({ campaign: c, update }: Props) {
  return (
    <>
      <VisibilityRow visible={c.footer.visible} onChange={(v) => update((d) => void (d.footer.visible = v))} />
      <Group title="Business details">
        <Field label="Company">
          <TextInput value={c.footer.company} onChange={(v) => update((d) => void (d.footer.company = v))} />
        </Field>
        <Field label="Address" hint="Required for CAN-SPAM">
          <TextArea rows={2} value={c.footer.address} onChange={(v) => update((d) => void (d.footer.address = v))} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Background" value={c.footer.bg} onChange={(v) => update((d) => void (d.footer.bg = v))} />
          <ColorField label="Text" value={c.footer.text} onChange={(v) => update((d) => void (d.footer.text = v))} />
        </div>
      </Group>
      <Group title="Social links">
        <div className="grid grid-cols-3 gap-2">
          <ColorField label="Icon bg" value={c.footer.socialBg} onChange={(v) => update((d) => void (d.footer.socialBg = v))} />
          <ColorField label="Icon" value={c.footer.socialColor} onChange={(v) => update((d) => void (d.footer.socialColor = v))} />
          <SliderField label="Radius" value={c.footer.socialRadius} min={0} max={20} onChange={(v) => update((d) => void (d.footer.socialRadius = v))} />
        </div>
        {/* Live preview of the social icon styling */}
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          {c.footer.socials
            .filter((s) => s.enabled)
            .slice(0, 5)
            .map((s) => (
              <span
                key={s.key}
                className="grid size-7 place-items-center"
                style={{ background: c.footer.socialBg, borderRadius: c.footer.socialRadius }}
              >
                <SocialIcon skey={s.key} color={c.footer.socialColor} />
              </span>
            ))}
          <span className="ml-auto text-[11px] text-zinc-400">Preview</span>
        </div>
        {c.footer.socials.map((s) => (
          <div key={s.key} className="space-y-1.5 rounded-md border border-zinc-200 p-2">
            <ToggleRow
              label={SOCIAL_LABELS[s.key]}
              checked={s.enabled}
              onChange={(v) =>
                update((d) => {
                  const t = d.footer.socials.find((x) => x.key === s.key);
                  if (t) t.enabled = v;
                })
              }
            />
            {s.enabled && (
              <input
                value={s.url}
                aria-label={`${SOCIAL_LABELS[s.key]} URL`}
                onChange={(e) =>
                  update((d) => {
                    const t = d.footer.socials.find((x) => x.key === s.key);
                    if (t) t.url = e.target.value;
                  })
                }
                className={inputCls}
              />
            )}
          </div>
        ))}
      </Group>
      <Group
        title="Legal links"
        action={
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              update((d) => d.footer.links.push({ id: uid(), label: "New link", url: "#" }));
            }}
            className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
          >
            + Add
          </span>
        }
      >
        {c.footer.links.map((l) => (
          <div key={l.id} className="flex gap-1.5">
            <input
              value={l.label}
              aria-label="Link label"
              onChange={(e) =>
                update((d) => {
                  const t = d.footer.links.find((x) => x.id === l.id);
                  if (t) t.label = e.target.value;
                })
              }
              className={inputCls}
            />
            <input
              value={l.url}
              aria-label="Link URL"
              onChange={(e) =>
                update((d) => {
                  const t = d.footer.links.find((x) => x.id === l.id);
                  if (t) t.url = e.target.value;
                })
              }
              className={inputCls}
            />
            <button
              type="button"
              aria-label="Delete link"
              onClick={() =>
                update((d) => {
                  d.footer.links = d.footer.links.filter((x) => x.id !== l.id);
                })
              }
              className="shrink-0 rounded-md border border-zinc-200 px-2 text-[12px] text-zinc-400 hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </Group>
    </>
  );
}

/* ------------------------------ Campaign meta ----------------------------- */

export function SenderForm({ campaign: c, update }: Props) {
  return (
    <Group title="Sender">
      <Field label="Campaign name">
        <TextInput value={c.meta.name} onChange={(v) => update((d) => void (d.meta.name = v))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From name">
          <TextInput value={c.meta.fromName} onChange={(v) => update((d) => void (d.meta.fromName = v))} />
        </Field>
        <Field label="From email">
          <TextInput value={c.meta.fromEmail} onChange={(v) => update((d) => void (d.meta.fromEmail = v))} />
        </Field>
      </div>
    </Group>
  );
}

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter", hint: "Modern neutral sans" },
  { value: "Georgia, serif", label: "Georgia", hint: "Warm editorial serif" },
  { value: "Helvetica, Arial, sans-serif", label: "Helvetica", hint: "Classic email-safe sans" },
  { value: "ui-monospace, monospace", label: "Monospace", hint: "Technical, fixed width" },
];

export function ThemeForm({ campaign: c, update }: Props) {
  return (
    <>
      <Group title="Colours">
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Accent" value={c.theme.accent} onChange={(v) => update((d) => void (d.theme.accent = v))} />
          <ColorField label="Email background" value={c.theme.cardBg} onChange={(v) => update((d) => void (d.theme.cardBg = v))} />
        </div>
        <ColorField label="Canvas background" value={c.theme.pageBg} onChange={(v) => update((d) => void (d.theme.pageBg = v))} />
        <Field label="Apply accent to">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update((d) => void (d.cta.bg = d.theme.accent))}
              className="h-9 flex-1 rounded-lg border border-zinc-200 text-[12px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
            >
              Button
            </button>
            <button
              type="button"
              onClick={() => update((d) => void (d.header.bg = d.theme.accent))}
              className="h-9 flex-1 rounded-lg border border-zinc-200 text-[12px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
            >
              Header
            </button>
          </div>
        </Field>
      </Group>

      <Group title="Typography & width">
        <Field label="Font family">
          <Select
            ariaLabel="Font family"
            value={c.theme.bodyFont}
            options={FONT_OPTIONS}
            onChange={(v) =>
              update((d) => {
                d.theme.bodyFont = String(v);
                d.theme.headingFont = String(v);
              })
            }
          />
        </Field>
        <SliderField
          label="Content width"
          value={c.theme.contentWidth}
          min={420}
          max={760}
          step={10}
          onChange={(v) => update((d) => void (d.theme.contentWidth = v))}
        />
      </Group>
    </>
  );
}
