
## Goal

Rebuild the three wizard steps (Preferences / Content / Promotion) so each one feels purposeful, adds the missing controls from the reference screenshots, and gets a nicer visual layout. Preview behaviour becomes channel-aware: text always shows the phone, email shows desktop/mobile toggle, promotion drops the side preview and renders inline under the editor.

## 1. Preferences step

- Replace the 2-card channel picker with a proper "Message channel strategy" section supporting **four** options:
  - `email` — Email Only
  - `text` — Text Only
  - `both` — Text + Email Together
  - `text_email_fallback` — Text with Email Fallback
- Keep them as compact selectable cards (2×2 grid) with icon + short description; the existing ChannelCard style, densified.
- Regroup the rest into three clearly separated blocks with headings:
  1. **Delivery** — sequence toggle, audience, start date, cut-off toggle + date
  2. **Summary** — the emerald estimate card (unchanged, values react to new channels)
- Wider single-column layout so the section headings breathe.

## 2. Content step

### Text content (shown when channel is `text`, `both`, or `text_email_fallback`)

- New two-panel layout inside the editor column:
  - **Message** card: textarea + character counter + colourful, category-tinted merge-tag chips (name = indigo, dates = amber, hotel = emerald, loyalty = violet). Chips insert at caret.
  - **Media** card (moved inline, no separate tab): drop zone + "Select file" button + preview thumbnail with remove, plus the yellow "strongly recommended" callout from the screenshot.
  - **Tracked link** field.
  - **Send test** card at the bottom.
- The phone preview renders the image above the bubble when one is attached.

### Email content (shown when channel is `email`, `both`, or `text_email_fallback`)

- Keep the template picker + subject/preheader.
- **Unlock header and hero editing.** Move them out of `LOCKED_BLOCKS` into the collapsible accordion so users can change logo/text/bg and hero image/height/overlay directly — same `BlockForm` mechanism used in the structured editor.
- Add a small "Reset to design defaults" link that re-applies the chosen template.

### Both / fallback

- Two tabs at the top of the content step ("Text", "Email") — the editor swaps to the matching form. Preview column also swaps based on the active tab.

## 3. Promotion step

- Expand the form with the fields from the screenshot:
  - `Use promotion` toggle (gates the rest)
  - Promo code + minimum nights dropdown (side-by-side)
  - Discount percentage
  - Offer tagline (short text)
  - `Offer is valid between specific dates` toggle → date range
- **Preview moves inline below the editor**: a promo banner card ("LIYAT, YOU UNLOCKED / THE BEST RATE 50% 🎉") built with CSS + the campaign's accent colour and hotel name. The right-side preview column is hidden on the promotion step.

## 4. Preview column behaviour

- Preferences step: keep empty-state / summary card.
- Content step: text → phone; email → desktop/mobile toggle.
- Promotion step: hidden; editor takes full width and shows the promo card underneath.

## 5. iPhone mockup refresh

- Replace the current frame with a cleaner iPhone 15-style shell in `PhoneMockup.tsx`:
  - Deeper titanium gradient rail, softer 4.2rem corner radius
  - Slimmer Dynamic Island with subtle inner highlight
  - Refined side buttons, crisper drop shadow, subtle screen inner ring
- No API change — existing callers keep working.

## Technical notes

- New channel type: `type Channel = "text" | "email" | "both" | "text_email_fallback"`. Helpers `hasText(channel)` / `hasEmail(channel)` drive step gating and preview.
- `EDITABLE_BLOCKS` becomes `["header", "hero", "body", "cta", "details", "footer"]`; `LOCKED_BLOCKS` removed.
- Text media state: `const [mediaUrl, setMediaUrl] = useState<string | null>(null)` populated via `URL.createObjectURL`; passed to `SmsPreview` as an optional `imageUrl` prop that renders above the bubble.
- Promotion state additions: `promoEnabled`, `minNights`, `tagline`, `validRange` toggle + `validFrom`/`validTo`.
- Promotion preview card: standalone component `PromoPreviewCard` — gradient using `campaign.theme.accent`, hotel name from `campaign.header.logoText`, tagline text overlay.
- No backend changes; all state stays local to the wizard.

## Out of scope

- Actually sending texts/emails, persisting the campaign, or generating AI images for the promo banner.
