---
name: inter-design-system
description: INTER (Instituto Interamericano de Lenguas) visual identity and product design system — logo usage, color/typography/spacing tokens, reusable components, image treatment, motion, accessibility and UX standards for institutional-premium EdTech. Use whenever designing or building any INTER interface, page, report, email or document (Placement Test, INTERclassrooms, ELR, landing pages, proposals).
---

# INTER Design System

**Direction:** institutional premium · academic sophistication · modern EdTech · minimalist, clean, human-centred.
Credibility of a language-assessment institution + the experience of a premium tech product.
Conceptual references (never copy their identity): Cambridge English, ETS, Pearson (rigour, clarity) and Apple (restraint, precision).

**Guiding test for every decision:** does it add institutional credibility, experience quality, assessment integrity or scalability? If not, remove it.

## 1. Brand assets

| Asset | File (Placement Test repo) | Use |
|---|---|---|
| Emblem (SDG wheel + globe) | `public/brand/inter-emblem.png` | Favicon, compact lockups, hero centrepiece. On navy the globe's interior is transparent (navy shows through). |
| Wordmark (navy, gold tagline) | `public/brand/inter-wordmark.png` | On white/light surfaces. |
| Wordmark (white) | `public/brand/inter-wordmark-white.png` | On navy/dark surfaces only (negative version). |
| Full logo | `public/brand/inter-logo.png` | Documents, OG image. |

Source masters live in INTER's Google Drive (`INTER LOGO-01.png`, `INTER PNG-01.png`). Rules:
- Use only official logos, intact. Never redraw, recolour (except the approved white negative), stretch, add effects or place on busy imagery without an overlay.
- Minimum clear space = height of the "I" in INTER. Minimum wordmark height 20 px on screen.
- Lockup: emblem + wordmark, 10–12 px gap, vertically centred.

## 2. Tokens

Defined in `src/app/globals.css` (`@theme`). Mirror them in any new project; machine-readable copy in `tokens.json`.

**Colour**
| Token | Hex | Role |
|---|---|---|
| `navy` | `#132544` | Primary brand, primary buttons, headers, data marks |
| `navy-900` / `navy-950` | `#0f1d36` / `#0a1426` | Deep surfaces, overlays |
| `navy-700` | `#1d3561` | Primary hover |
| `royal` | `#034a89` | Eyebrows, links, focus outline |
| `gold` | `#faac26` | Accent: the ONE main CTA per view, active markers, key highlights |
| `gold-300` / `gold-100` | `#fcc964` / `#fff1d6` | Accent hover / warning-tint surfaces |
| `mist` | `#f4f6fb` | App background, quiet fills |
| `line` | `#e3e8f2` | Borders, dividers, tracks |
| text | `slate-900/800/700/600` | Body copy. **Never use slate-400/500 or white < 70 % for text** (fails AA) |

Status (always with icon + label, never colour alone): success `#2c6e22` on `sdg-green/10`, warning `#5c3b00` on `gold-100`, critical `#9b1c26` on `sdg-red/5`.
SDG wheel colours (`sdg-*`) are **brand texture only** (thin `sdg-bar` divider, skill accents). Never use them as status colours or decorative gradients.

**Typography**
- Display: **Montserrat 700/800** (`font-display`) — headings, numbers, buttons, labels.
- Text: **Inter** (variable) — body, UI, assessment content.
- Scale (px): 12 (min for meta) · 14 · 15–16 (body) · 18 · 24 · 30 · 36 · 42–50 (hero). Line-height 1.6–1.75 for reading passages, 1.05–1.1 for display.
- Eyebrows: 12 px, bold, uppercase, `tracking-[0.16em]`, `royal`.
- Numbers in data: `tabular-nums`.

**Space & shape:** 4-pt grid; section padding 64–80 px desktop / 48–64 mobile; container `max-w-7xl`, 16 px mobile gutter. Radius: 8 (controls), 12 (buttons, notices), 16 (cards), full (pills). Elevation: border `line` first; shadows only `shadow-lg` for floating layers (dialogs, toasts, tooltips).

## 3. Components (reference implementations)

| Component | File | Notes |
|---|---|---|
| `Button` (`primary` navy · `secondary` outline · `accent` gold) | `src/components/test/shared.tsx` | min-height 44 px, `focus-visible` outline royal, disabled 45 % opacity |
| `Card`, `StepHeading`, `Notice` (info/warn/error/ok) | same | Card = white + 1 px `line` border + radius 16 |
| `BrandLockup`, `Emblem`, `Wordmark` | `src/components/Brand.tsx` | |
| `CefrScale` | `src/components/CefrScale.tsx` | 7 bands; A0 displays as "Pre-A1"; cut-offs never altered in UI |
| Banded score bar + SE whisker + hatched provisional | `src/components/ReportView.tsx` | Uneven band boundaries (20/30/40/50/60/70); `role="meter"` |
| `HeaderTimer` | `src/components/test/HeaderTimer.tsx` | navy → amber (≤5 min) → red (≤1 min), announced via live region |
| `Navbar`, `HeroOrbit`, `Reveal` | `src/components/landing/*`, `Reveal.tsx` | |

## 4. Imagery

- Real, human, Dominican/Caribbean professional context; natural light; no stock clichés.
- On navy heroes: photo at 35–55 % opacity, `mix-blend-luminosity`, horizontal navy gradient (solid ≥ 30 % under text) + bottom fade. The headline must always sit on ≥ 90 % navy.
- `next/image` with explicit `sizes`, WebP, `priority` only for the LCP image.
- Never place UI cards with fake data over imagery.

## 5. Motion

Functional only: state changes (≤ 200 ms colour/transform), entrance reveal (12 px, 600 ms, once), progress. Signature motion allowed: slow emblem spin and skills orbit on the landing. **Everything** must stop under `prefers-reduced-motion` (`motion-safe:` utilities + global CSS guard). No shine sweeps, glows, bouncing, confetti or parallax.

## 6. Two modes

| Landing / marketing | Assessment / tools |
|---|---|
| Navy hero, photo, emblem orbit, gold CTA | White cards on `mist`, navy actions, no decoration |
| Storytelling copy | Instructions, status, progress only |
| Reveal animations | Static layout; focus on content |

Assessment screens must never show anything that could influence answers (praise, ticks on selected options, right/wrong colour, celebratory effects).

## 7. UX & accessibility standards (WCAG 2.2 AA)

- Contrast ≥ 4.5:1 body, ≥ 3:1 large text and UI boundaries. Verify, don't eyeball.
- Every control reachable by keyboard; visible `focus-visible` ring; skip link on every page; logical headings.
- Choice lists: `role="radiogroup"` / `role="radio"` + `aria-checked`. Timers: `role="timer"`, alerts in `aria-live`.
- Targets ≥ 44 × 44 px for primary actions (≥ 24 px minimum).
- Forms: visible labels, inline errors in text (not colour only), `aria-invalid`.
- Status always icon + label + colour.
- Run `node tests/e2e/a11y.cjs` (axe-core, WCAG 2.2 A/AA) before shipping; automated checks are necessary, not sufficient.

## 8. Voice

Spanish (Dominican Republic) for UI; assessment content in English. Clear, respectful, institutional — "tú" for candidates. No hype, no unverifiable claims: say "alineada al MCER", never "certificación oficial"; don't promise precision that hasn't been demonstrated.

## 9. Anti-patterns (reject in review)

Glassmorphism stacks · gradient text · multiple competing CTAs · floating cards with sample/fake metrics · shadows on every card · decorative animation · emoji in UI · low-contrast grey text · SDG colours as UI state · copying third-party brand looks.
