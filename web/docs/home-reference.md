# Reference homepage, 8 October 2026

The existing `/[locale]` homepage uses the customer supplied `ChatGPT 图像 2026年10月8日 12_31_24.png` layout: dark photographic hero, overlapping white vehicle/OEM finder, six product categories, light brand wall, photographic popular-model band, compact factory process, retained social-follow block and Hanoi store panel. Text and controls remain native HTML, not a page-sized screenshot.

## Preserved behavior

- The language shortcuts, flags, language order, dropdown, locale URLs and switching handlers are unchanged. Only homepage branding and navigation get a scoped visual variant. An OEM shortcut selects the existing OEM finder.
- Sales Zalo, WhatsApp and email reuse `ContactIntake` without changes. Dealer/garage choices route to existing B2B Zalo, owners to existing B2C Zalo; WhatsApp remains shared. Selection opens the native chat/email destination immediately, with recording in the background and no form.
- The `SocialStrip` section and its existing account links remain between the factory and store sections. Social Zalo Video continues to open its configured profile directly.
- All twenty previously requested model families remain unique, in two batches of ten. The first six follow the reference's order and photos; each row scrolls horizontally. Cards navigate to actual catalog model searches.
- Three vehicle selectors use the existing brands/models API and actual variant IDs. The year field selects a database generation's year range. Product results continue on the existing `/[locale]/products` route. Saved homepage query URLs redirect there with the original filters.
- Prisma schema, Product/Vehicle/OEM APIs, inventory, prices and contact configuration are unchanged.

## Assets and data

48 lossless reference crops are under `public/images/home-reference`; `source.json` records crop coordinates. Product imagery is temporary generic presentation, not verified fitment. Store/factory scenes from the reference are illustrations. Existing real storefront configuration takes priority if present. The reference's decorative QR is replaced with the existing Zalo QR endpoint. Opening hours use `NEXT_PUBLIC_HANOI_OPENING_HOURS` when confirmed; otherwise the card invites contacting the store. The page does not invent store hours. Reference year captions are limited to the local design-preview mode; production year captions use database variants.

CSS is scoped to `.home-reference` or `.site-header--home-reference` to avoid changing the product center/detail/contact routes after client navigation. Mobile categories collapse to two/three columns, logos to five/seven columns, the finder stacks vertically and model rows scroll inside the section rather than widening the page. Reduced-motion preferences and keyboard tab switching are respected.

The homepage hero now matches the product center banner dimensions: full viewport width and 250px height above 640px. At 640px and below it uses the same 280px minimum with natural height for translated text. Headline and benefit spacing are compacted to fit the short banner. The finder sits immediately below it, rather than overlapping its content. Original language and contact controls remain unchanged.

The generated v2 foreground was rejected for incorrect construction; v3's separate background/photo layers were rejected for their collaged appearance. Both are inactive. The hero now renders the single cohesive `public/images/hero-studio-v5.jpg`: a restrained graphite studio beauty shot of one bare strut, edited with the existing product photograph as a structural reference, with a subdued graphite sedan front quarter behind it. The car and soft silver reflections were added after the customer found the product-only studio composition too plain. Neutral silver light, a small original yellow label and a clean contact shadow replace gold light bars and the separate masked foreground. The product was visually checked against the source's seat, short rod and mounting bracket; this generated promotional image is not evidence of SKU specifications. At desktop widths the image is capped at 1500px and positioned at 55% vertically to keep the complete product in the 250px banner. Mobile uses contain sizing with subdued contrast behind native text. The benefit strip has no separate card background. Existing asset files are retained. Prompts and provenance are in `docs/hero-image-v5.md`.

## Validation

- TypeScript: `tsc --noEmit`.
- Targeted ESLint: modified TS/TSX files.
- Website integration: six locale pages, native homepage sections, unique twenty models and ten-model batches, three selectors, three sales channels, retained social and flags, saved search redirect, catalog queries, original quote validation/persistence.
- Contact regression: immediate three-choice links in six languages, unchanged destination routing, no forms, lead persistence and retry handling. Tests use isolated synthetic records and clean them up; no real platform messages are sent.
- Source crops were reopened and compared pixel-for-pixel with their source regions.
- Browser automation is restricted for the local URL in this session. HTTP rendering and asset verification do not constitute actual desktop/mobile screenshots or a pixel-perfect browser comparison.
