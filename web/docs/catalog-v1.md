# V1 catalog integration

The homepage keeps the NEVERSTOP design and Vietnamese copy. VI/EN/中文,
Zalo, quotation and payment remain placeholders; there is no checkout or full i18n.

## Run locally

From web/, configure your local .env with the existing PostgreSQL DATABASE_URL.
Never commit .env or database credentials. Keep the existing database volume.

1. npm ci
2. docker compose up -d
3. npx prisma generate
4. npx prisma migrate deploy
5. For a fresh development database only: npx prisma db seed
6. npm run dev

## Catalog behavior

- GET /api/vehicles returns active brands, active models and active variants.
- Brand changes reset model/year/variant; model changes reset year/variant;
  year changes reset variant. A null end year offers years up to the current year.
- GET /api/products accepts variantId, year, q and page (default 1).
- A selected vehicle must have active brand/model/variant and a matching year range.
- q independently searches part numbers, OE numbers and active model codes using
  case-insensitive substring matching, with outer whitespace trimmed. Punctuation
  is significant. Search text is limited to 100 characters.
- Only ACTIVE products are returned, 24 per page with hasMore for navigation.
- Availability sums max(quantity - reservedQuantity, 0) at active locations.
- Responses select only public catalog fields and do not include customer,
  order, payment, internal pricing or location details.
- Loading, empty results and retryable error states are shown on the homepage.

## Verification

- npm run typecheck
- npm run lint
- npm run build (generates the Prisma client first)
- With a running app and seeded development database: npm run test:catalog

CATALOG_TEST_URL may point to a different local app port. The integration check
uses the same DATABASE_URL as the app. It creates uniquely named temporary
catalog records and deletes only those records in its finally block; it does
not modify the existing seed records. Run this check only against development.

Manual browser check: Toyota → Vios → 2014 → NCP150, then search. Expect the
seeded front/rear products. Search K3330017 for the front product, and change
brand back to the placeholder to verify dependent selections are cleared.
