# Product center reference implementation

Route: `/[locale]/products`. Only the product landing page uses the reference layout and header variant; the home page, product details, contact page and commerce screens retain their existing presentation.

The customer supplied `codex-clipboard-d83b22eb-065d-45a8-b45f-b1ebf63b7cba.png` on 8 October 2026. The Chinese desktop frame follows its product-center banner, six category tiles, shock-absorber introduction, three search tabs, six vehicle cards and coming-products banner. Photography, wordmark, brand marks and feature/social icons are lossless crops from that image, with pixel preservation checked against the source. Assets and provenance are in `public/images/product-center/`.

The header variant matches the reference's wordmark, brand line and compact VI / EN / 中文 shortcuts. Its full language menu retains the current flag labels. Existing verified social URLs remain unchanged; the follow button opens the existing Zalo Video account. The unconfigured YouTube link remains an icon without an invented account URL. The local-data notice stays visible below this page, preserving the reference's top alignment; the shared footer remains below the reference content.

On 9 October 2026, the product-page HERO title was replaced with the localized Factory-direct eyebrow, a larger white Automotive Shock Absorbers heading, and an inline Since 1983 / TS16949 quality-certification row. Factory-direct, 1983 and TS16949 use bold brand yellow. The year follows the repeatedly requested 1983; the conflicting 1993 in the latest message was not used. The photographic background and 250px desktop banner remain unchanged. At narrow widths the heading and credentials wrap naturally; redundant translated introduction and secondary benefit captions are omitted to keep the hierarchy compact. The homepage and shared language/contact controls are unchanged by this edit.

## Query behavior

- `/api/vehicles` supplies actual active brand, model and variant IDs.
- The reference has three vehicle fields. The third selects an existing variant's year range. Search sends its actual `variantId`; no chassis or year is inferred from a picture.
- Existing deep links with `variantId` plus a single `year` preserve that filter.
- OEM and NEVERSTOP part-number tabs use the existing `/api/products?q=...` query, without changing its database matching logic.
- URL query state is preserved across direct links, navigation and pagination. Search results appear only after a search or a search deep link; the default landing frame contains the six reference vehicle shortcuts.
- Those six shortcuts query real model names rather than linking to fabricated SKUs. Additional vehicle selection opens the existing homepage finder.
- In local preview, the six caption ranges are transcribed from the supplied design. Production captions use active database variant ranges; missing ranges stay hidden.
- Query results reuse ProductCard and the current customer-type contact flow. Prices and numeric stock quantities are not added to the page.

No Prisma Schema, product/vehicle/OEM records, public contact numbers or catalog API code were changed. Non-shock categories remain marked coming soon, as in the reference.

The page supports zh, vi, en, ar, es and pt. Narrow screens use two/three-column category and vehicle grids, stacked form fields and the existing mobile header menu. All native parameter controls remain usable, and the three search tabs support keyboard navigation.

## Verification

TypeScript and targeted ESLint pass with no errors or warnings. The website integration check covers six-language product-center HTML, six vehicle cards, five coming-soon categories, three selectors/tabs, OEM and part-number deep links, image responses, normal headers on other routes, and existing quotation validation/persistence. Two existing assertions were corrected to decode HTML ampersands and use the current localized product-name helper.

Product-detail regression checks pass for sparse/verified data handling, private-field exclusion, real related products, SEO, six locales, original part/OEM/vehicle queries and 404s. Synthetic inquiry records are cleaned up after tests. No real chat or notification messages are sent.

The browser tool previously rejected local-page access, so the implementation has not been checked through actual browser screenshots or pixel-difference comparison. HTTP and source/asset checks do not establish pixel-perfect browser rendering.

HERO copy validation on 9 October: targeted ESLint and TypeScript `tsc --noEmit` passed. All six product landing routes returned HTTP 200 with their localized product heading, 1983 and TS16949, and the served CSS contains the new typography rules. The homepage still returns HTTP 200. This validates the rendered HTML and served assets; no browser screenshot was captured for this change.
