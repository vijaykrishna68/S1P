# Pages and admin

Art direction for each kind of page. The existing site's information architecture, content and functionality come first: adapt these compositions to the pages S1P actually has, and add or remove nothing without a product decision. Representative compositions are live under Pages (HomepageDesktop, HomepageMobile, DonateFlow, AdminScreen).

## Homepage

An illustrated editorial cover brought to life, then a six-beat story.

1. **Cover** — HeroSection: eyebrow, headline (≤ 8 words, one word in the gold marker), the existing mission line, primary "Contribute now" (with `shadow-offset`) and secondary "See our impact"; the shared-table scene on the right 7 columns, bleeding past the edge.
2. **Why it matters** — rose story band, rounded top; copy left, `contribution-pass-it-on` right.
3. **What we've done** — three ImpactStats of verified figures, labels, periods and a link to definitions.
4. **Real days** — a six-photo GalleryGrid on the surface band, "Open the gallery".
5. **How you can help** — numbered sticker steps from the existing contribution process, `impact-many-hands` on the left.
6. **Closing call** — inverse crust band, one display line, primary button, a secondary route for questions.

Band order alternates canvas and tint; never two tinted bands in a row. One primary button per viewport.

## About / mission

Editorial long-read: `display-page` title, a lead, then alternating text and art. Use the Timeline for the origin and milestones, a StoryQuote for one consented voice, the `people-cast` strip for "who's involved", motifs as dividers. No figures or events that aren't documented.

## Impact

Make it verifiable at a glance: a headline stat row (cumulative), then yearly figures (ImpactStat `md` in a grid, or an AdminTable-style public table for many years), each with label, date range, exact/rounded marker and source. A short "How we count" Accordion. Illustration only in the header (`impact-many-hands`). Counters never hide the number; everything is readable without scrolling effects.

## Contribute

The calmest page: no hero scene, no confetti until success. Two columns ≥ 860px — the form at `layout-form` width, the summary and a static `contribution-pass-it-on` beside it; on mobile the summary sits on top. Steps, processing, failure and success are specified in DonateFlow and the handoff section. Keep the existing flow's steps, payment provider and fields; don't add steps for the sake of animation.

## Gallery

An editorial collection of real activity: `display-page` title, optional filters (only those the content supports), GalleryGrid with feature and tall tiles, captions with dates, a Dialog lightbox. Illustration motifs only between sections, never on photos. Loading = Skeleton tiles; empty = EmptyState; error = Alert + retry.

## FAQ, contact and other existing pages

For each: name its main user need, keep its function, give it a `display-page` title, reuse components (Accordion for FAQ, TextField/Select/Checkbox for forms), and add a spot illustration only if it explains something. Not every page gets a scene.

## Responsive

- **Desktop ≥1024:** asymmetric 5/7 and 6/6 splits, art bleeding off the grid, full choreography.
- **Tablet 768–1023:** keep splits where the art stays ≥ 360px wide, else stack; reduce overlaps.
- **Mobile <768:** art above the headline in the hero, every split stacks, stats and steps single column, gallery two-up, the primary button full-width. Scenes scale as a whole — never crop a character out.
- Check at 360px: no horizontal scroll, no clipped headlines, controls ≥ 44px.

## Admin

Same tokens, type, buttons, fields, alerts and focus as the public site, with expression turned down.

- Layout: surface sidebar (232px) with plain links, the active one elevated with a 3px tomato edge; the main area on canvas with a breadcrumb, `heading-1` title, a status pill (PublishStatus) and actions on the right.
- Density: AdminTable at 14px; `sm` buttons; fields at full size (52px) for reliability.
- States: Draft → Saving… → Saved → Scheduled → Published / Failed — only those the system has. Failures get an Alert with the cause and a retry.
- Destructive actions: always a destructive Dialog naming the item and the consequence.
- Uploads: show progress per file, validation before upload (type, size), alt text and caption required before publishing a photo.
- Illustrations: static, in empty states and after a first successful publish only. No hero art, stickers, offset shadows or scroll motion.
- Preserve the existing admin functions and permission boundaries.
