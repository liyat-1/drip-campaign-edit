## Goals

Bring the campaign wizard closer to the reference screenshots and to the "structured" builder's calmer layout. Preview appears the moment a channel is picked, promo preview lives in the preview column (not inline), email content editing is limited to editable blocks with a locked indicator on the rest, textarea tags render as coloured chips, and previews get the same desktop/mobile/inbox/dark modes as the structured builder.

## 1. Preferences step

- Once a channel is selected, the preview column immediately shows a preview matching that channel (text → phone with default SMS, email → placeholder "pick a design", both → tabbed preview).
- Keep the four channel cards and rearrange delivery/summary blocks to match the structured builder's `RailSection` rhythm (light dividers, 12px section headings, less nesting).

## 2. Content step

### Editability model

- `EDITABLE_BLOCKS = ["body", "cta", "details"]`; `LOCKED_BLOCKS = ["header", "hero", "footer"]`.
- Locked blocks appear in the accordion but are dimmed with a `Lock` icon, a "Set in template" hint, and clicking them does nothing (aria-disabled).
- After picking a template, default open block = `body`.
- Add small "Change design" button next to selected template card.

### Text content

- Textarea replaced with a `TagTextArea`: a `contentEditable` div that renders each `{{token}}` as a coloured, non-editable chip (`firstName`, `checkoutDate`, `hotelName`…). Backspace deletes the whole chip. Insert-tag chips add the chip at the caret.
- Media card keeps the drop zone but adds a "Select from recent files" strip with 4 sample thumbnails (`/src/assets`).
- Layout mirrors the structured builder's `RailSection` (indexed section headers, single scroll rail).

### Email content

- Left rail: 1 · Template, 2 · Subject & preheader, 3 · Editable sections (body/cta/details), 4 · Send test. Rail uses the same `RailSection` component visually.
- Right column shows the email preview with a device switcher (Desktop / Mobile / Inbox / Dark) — same modes as the structured builder.

## 3. Promotion step

- Editor keeps the promo fields but the `PromoPreviewCard` moves into the preview column. The preview column is no longer hidden on this step; it shows the promo card (phone-framed if channel is text-only, plain card if email-only or both).

## 4. Template picker

- Each thumbnail shows a light and dark variant (small stacked cards).
- Add an "Edit design" secondary button next to "Use this design" that opens the picked template in the structured builder flow (`/structured` route) so users can customise header/hero/footer before applying. (For this iteration: opens `/structured` in a new tab; nothing persists back — noted in a small hint.)

## 5. Preview column

- Always visible in every step once a channel is selected.
- Preferences: default preview based on channel (phone for text, empty card for email until template chosen).
- Content: text → phone; email → device switcher (desktop / mobile / inbox / dark).
- Promotion: renders `PromoPreviewCard` (phone-wrapped when text-only).

## 6. Phone mockup polish

- Refine `PhoneMockup.tsx`: thinner bezel, brighter titanium gradient, subtle screen glass reflection, cleaner Dynamic Island proportions, tighter home indicator.

## 7. Structured spacing pass

- Adopt the structured builder's paddings (`px-4 py-2.5` rail headers, `p-4` section bodies), 12px section titles with 11.5px hints, and the numbered chip in section headers. Applies to all three wizard steps.

## Technical notes

- New `TagTextArea` component in `src/components/campaign/TagTextArea.tsx`. Stores plaintext with `{{token}}`; renders chips via contentEditable + MutationObserver-free re-render (re-render only when external `value` changes, not on each keystroke).
- New `RailSection` reused from structured builder (extract to `src/components/editor/RailSection.tsx`).
- `EmailPreviewSwitcher` component wrapping the four modes (desktop / mobile / inbox / dark) for reuse across wizard and structured builder.
- `LOCKED_BLOCKS` render `<BlockForm>` disabled (wrap in `<fieldset disabled>` with overlay) rather than hiding, so users see what's set.
- `PromoPreviewCard` accepts `framed` prop to render inside `PhoneMockup` when text-only.

## Out of scope

- Persisting campaign, actually sending, and syncing template edits back from `/structured` route.
