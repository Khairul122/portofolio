# Hero Section — Design Spec

Date: 2026-10-03

## Purpose

Build the hero section (first section only) of a personal portfolio website, closely matching a provided reference image (futuristic/minimalist developer workspace, red/black/white theme), with the center character replaced by the user's own prepared 3D avatar instead of the flat photo character.

## Reference material (in project root)

- `Portofolio Developer Futuristik Minimalis.png` — full composite reference (layout/content to replicate)
- `Ruang Kerja Programmer Modern dengan Aksen Merah.png` — same room, no character/cards; used as the hero background
- `Meshy_AI_Business_Avatar_1002103208_texture.glb` — **selected** 3D avatar (static mesh, no rig/animations, baked texture)
- `Meshy_AI_Pink_Shirt_Avatar_1002110418_texture.glb` — not used for this task

## Scope

In scope: the hero section only — background, left column (brand mark + "Build Ship Improve" + Developer Stats card), center 3D avatar, right column ("Better Code Better Tomorrow" + Tech Stack card).

Out of scope (future work): navbar, other page sections (about/projects/contact/footer), routing, backend/CMS, SEO, deployment.

## Decisions (confirmed with user)

1. **Avatar**: Business Avatar GLB.
2. **3D interactivity**: fixed pose/camera matching the reference photo exactly — only a subtle automatic idle bob/rotation (sine wave) plus a small mouse-follow tilt (clamped ±5–8°). No free orbit/drag/zoom, so the model never shows an angle absent from the reference.
3. **Mobile layout**: avatar on top, both info cards stacked vertically below it (no carousel/accordion).

## Tech stack

- Vite + React (JavaScript, no TypeScript) + npm
- `@react-three/fiber` + `@react-three/drei` (`useGLTF`) for loading/rendering the GLB
- Framer Motion for entrance/hover animation on text and cards
- Plain CSS Modules (no Tailwind) for layout/theme — single section doesn't need a utility framework yet

## Assets handling

- Move the Business Avatar GLB to `public/models/`
- Move the background-only PNG to `public/images/`
- Both referenced by URL (not bundler import) to avoid bloating the JS bundle
- Leave the unused Pink Shirt GLB and the full composite reference PNG at project root (reference-only, not shipped)

## Component structure

```
src/
  App.jsx
  components/Hero/
    Hero.jsx              # layout: bg image, left column, AvatarCanvas, right column
    AvatarCanvas.jsx       # r3f <Canvas>: load GLB, lighting, idle float + mouse-tilt
    StatsCard.jsx          # "Developer Stats" card
    TechStackCard.jsx      # "Tech Stack" card
    heroContent.js         # stats & tech-stack list data (hardcoded, easy to edit)
    Hero.module.css
```

## Interactivity details

- Avatar: idle vertical bob + slight rotation via `useFrame` sine wave; tilt lerps toward normalized pointer position, clamped small range. Camera framing stays fixed to match the reference.
- Cards: staggered fade+slide-in on mount (Framer Motion); hover lift/glow; chevron icon on each row, as in the reference.
- Background: optional few-px parallax drift following mouse (same image, no layout change).

## Responsive behavior

- Desktop (≥1024px): replicate reference layout — cards floating left/right of the centered avatar over the background photo.
- Mobile/tablet (<1024px): avatar on top, both cards stacked vertically below it; background still visible via `object-fit: cover`.

## Verification plan

No unit test framework — this is a static visual section with no business logic beyond trivial tilt math. Verification = run the Vite dev server, load the page in the browser at desktop and mobile viewport widths, confirm: avatar loads and animates, no console errors, layout matches reference at desktop and stacks correctly on mobile.

## Self-review notes

- No placeholders/TBDs remain.
- Scope is a single section; no further decomposition needed.
- Decisions on avatar choice, interactivity level, and mobile layout were explicit user choices, not assumptions.
