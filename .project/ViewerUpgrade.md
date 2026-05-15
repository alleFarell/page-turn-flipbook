You are a senior frontend rendering engineer and UI motion designer.

Your task is to upgrade an existing React flipbook component called `MagazineViewer` so that its layout, sizing system, cinematic proportions, rendering sharpness, spacing, and interaction feel closely match Heyzine’s premium “MAGAZINE” viewer mode.

IMPORTANT:
- Do NOT redesign the architecture.
- Preserve the existing component structure and APIs.
- Upgrade the sizing/layout/rendering system only.
- Keep compatibility with existing `usePageFlip`.
- Keep all existing features working.
- Maintain TypeScript compatibility.
- Preserve mobile support.
- Preserve page turning behavior.

## TARGET VISUAL GOAL

The final viewer should feel:
- immersive
- cinematic
- premium
- editorial
- spacious
- realistic

It should visually resemble:
- Heyzine Magazine Viewer
- modern luxury magazine readers
- realistic double spread publications

## REFERENCE ANALYSIS

Heyzine uses approximately:

Single page:
- 512 × 724

Spread:
- 1024 × 724

Outer viewport:
- 1295 × 724

Aspect ratio:
- 1.414 (A4 ratio)

Their viewer intentionally includes:
- large outer interaction gutters
- overflow space for page curl
- soft cinematic shadows
- high render sharpness
- centered transforms
- realistic fold geometry

## REQUIRED UPGRADES

1. DESKTOP PAGE SIZE
----------------------------------------------------

Increase desktop page size.

Current:
- pageWidth = 400

Replace with:
- desktop page width around 512
- preserve A4 ratio

Target:
```ts
const MAX_PAGE_WIDTH = 512;

const pageWidth = isMobile
  ? Math.min(window.innerWidth - 40, 320)
  : Math.min(
      MAX_PAGE_WIDTH,
      Math.floor((window.innerWidth - 260) / 2)
    );

const pageHeight = Math.round(pageWidth * 1.414);
```

2. ADD CINEMATIC VIEWPORT GUTTERS

---

Add large outer spacing around the spread.

Heyzine has large invisible gutters allowing:

* page curl overflow
* shadows
* cinematic centering
* realistic fold movement

Target viewport sizing:

```ts
const spreadWidth = pageWidth * (isPortrait ? 1 : 2);

const viewportWidth = isPortrait
  ? pageWidth + 40
  : spreadWidth + 270;

const viewportHeight = pageHeight + 40;
```


3. ALLOW PAGE OVERFLOW

---

The current viewer clips animations too aggressively.

Upgrade containers to:

* overflow-visible
* preserve 3D transforms
* allow page curl geometry outside spread bounds

Required:

* outer viewport uses overflow-visible
* flipping pages may extend beyond spread
* shadows must not be clipped


4. IMPROVE RENDER SHARPNESS

---

Heyzine renders pages at roughly 2x visual resolution.

Improve image sharpness by:

* enabling GPU compositing
* improving rendering quality
* avoiding blurry transforms

Add:

```css
transform: translateZ(0);
backface-visibility: hidden;
image-rendering: auto;
```

Apply to:

* page images
* flipping pages
* animated layers


5. SOFT CINEMATIC SHADOWS

---

Current shadows are too small and hard.

Replace with:

* wider shadows
* softer spread
* cinematic ambient depth

Desired style:

* subtle dark edges
* realistic center spine shading
* smooth shadow falloff
* premium glossy magazine feel

Improve:

* spread shadow
* page inner shadows
* spine shadow
* hover depth

Avoid:

* harsh black shadows
* cartoon-like contrast
* overly dark gradients


6. IMPROVE SPINE DEPTH

---

The center spine should feel more realistic.

Add:

* soft center compression shadow
* subtle fold depth
* gradual darkening near spine
* slight light falloff

Do NOT:

* add fake thick 3D books
* add huge page stacks
* create unrealistic depth

Keep it elegant and subtle.


7. KEEP FIRST/LAST PAGE CENTERING

---

Preserve current behavior:

* cover page centered
* last page centered
* spread centered

But improve smoothness of transitions.


8. MAINTAIN RESPONSIVENESS

---

Mobile mode must remain:

* performant
* touch friendly
* correctly scaled

Desktop should:

* scale up elegantly
* never exceed safe viewport bounds
* maintain cinematic margins


9. PERFORMANCE REQUIREMENTS

---

Avoid:

* excessive blur filters
* expensive box shadows
* unnecessary rerenders
* layout thrashing

Prefer:

* GPU transforms
* lightweight gradients
* transform-based animations


10. FINAL VISUAL RESULT

---

The final result should:

* visually resemble Heyzine Magazine mode
* feel significantly more premium
* have larger immersive spreads
* have spacious cinematic layout
* have realistic page depth
* support smooth page flipping
* maintain elegant editorial aesthetics

## EXPECTED OUTPUT

Return:

1. Fully upgraded `MagazineViewer.tsx`
2. Any necessary CSS/Tailwind changes
3. Explanation comments inside code
4. Clean production-quality code
5. No pseudocode
6. No incomplete snippets

Do not explain theory.
Implement the full upgraded component directly.
