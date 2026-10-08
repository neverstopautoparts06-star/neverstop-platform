# NEVERSTOP homepage HERO v3: preserved product photography

Superseded: the customer rejected the separate background/product layers for their collaged, visually incoherent appearance. The homepage now uses the single cohesive studio/vehicle photograph documented in `hero-image-v5.md`.

The customer rejected the v2 shock absorbers because their generated mechanical structure was incorrect. This revision removes those generated foreground products and reuses an existing product photo asset unchanged.

## Assets

- Product image: `public/images/hero-shocks-dark.webp`, an existing dark-background treatment of the arrangement in `public/images/shock-detail.jpg`. The file is reused byte-for-byte in a separate native HTML image layer. It is not regenerated, stretched, rotated or cropped in this revision. This is a generic brand display, not a verified image of a particular catalog SKU.
- Background: `public/images/hero-backdrop-v3.jpg`, JPEG quality 80, a format-only export of the built-in imagegen background edit. It contains no product or vehicle.
- Preserved generated PNG: `outputs/imagegen/neverstop-hero-backdrop-v3.png` in the task workspace.
- Built-in generated source: `/Users/ninapan/.codex/generated_images/01a102ee-4149-7291-ad5b-81277036af08/exec-b61fd94a-8982-44d9-a471-f7e0b49a2112.png`.

## Rendering

Desktop keeps the full-width 250px hero. The product layer is a 230px-high contain frame, capped at 600px wide, with soft horizontal blending outside the product contours. All product pixels remain in the frame. The copy layer is above both visual layers. At mobile widths the product image remains contained and subdued behind the existing copy. Native search, language selection, social links and contact handlers are unchanged.

## Generation mode and prompt

Built-in imagegen, edit mode. Only the background was generated; existing product photography was not supplied to or altered by imagegen in this revision.

```text
Use case: precise-object-edit.
Asset type: a panoramic background plate for the NEVERSTOP homepage hero, shown 250px high on desktop.
Edit target: the supplied old hero image. Remove BOTH foreground shock absorbers completely, and remove the SUV completely. Reconstruct the empty dark floor and charcoal industrial studio behind them. The result must contain NO products, NO shock absorbers, NO spring assemblies, NO rods, NO car and NO spare parts anywhere.
Preserve the premium black, charcoal and restrained warm brand-yellow lighting, the realistic concrete floor texture and the wide photographic composition. Keep the left 60% very dark and quiet for native white/yellow HTML text. Put only a subtle warm yellow rim-light glow and out-of-focus industrial vertical details at the far right. Clean commercial automotive studio atmosphere, credible materials, no clutter. The entire right side remains an empty background: existing real product photography will be placed on top separately by the website without regenerating the products.
No text, no logos, no captions, no icons, no UI, no watermark. Panoramic wide photograph.
```
