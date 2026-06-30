---
name: Emerald Night
colors:
  surface: '#111412'
  surface-dim: '#111412'
  surface-bright: '#373a37'
  surface-container-lowest: '#0c0f0d'
  surface-container-low: '#1a1c1a'
  surface-container: '#1e201e'
  surface-container-high: '#282b28'
  surface-container-highest: '#333533'
  on-surface: '#e2e3df'
  on-surface-variant: '#bbcac1'
  inverse-surface: '#e2e3df'
  inverse-on-surface: '#2f312e'
  outline: '#85948c'
  outline-variant: '#3c4a43'
  surface-tint: '#3edfad'
  primary: '#47e6b3'
  on-primary: '#003828'
  primary-container: '#12c999'
  on-primary-container: '#004e39'
  inverse-primary: '#006c50'
  secondary: '#bac8dc'
  on-secondary: '#243141'
  secondary-container: '#3a4859'
  on-secondary-container: '#a8b6ca'
  tertiary: '#acd7bf'
  on-tertiary: '#0e3727'
  tertiary-container: '#91bba5'
  on-tertiary-container: '#244c3a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#63fcc8'
  primary-fixed-dim: '#3edfad'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513c'
  secondary-fixed: '#d6e4f9'
  secondary-fixed-dim: '#bac8dc'
  on-secondary-fixed: '#0f1c2c'
  on-secondary-fixed-variant: '#3a4859'
  tertiary-fixed: '#c1ecd4'
  tertiary-fixed-dim: '#a5d0b9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#274e3d'
  background: '#111412'
  on-background: '#e2e3df'
  surface-variant: '#333533'
typography:
  headline-xl:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  headline-xl-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is built for a high-tech, professional, and career-oriented platform. It evokes feelings of reliability, intelligence, and modern efficiency through a "Corporate Modern" aesthetic with a "Glassmorphic" twist.

The brand personality is authoritative yet approachable, utilizing a deep, dark canvas to allow vibrant emerald accents to command attention. This high-contrast dark mode approach reduces eye strain for power users while maintaining a premium, "pro-tool" feel. Key visual motifs include subtle background blurs, frosted glass containers, and precise, crisp typography.

## Colors
The palette is centered around a "Deep Sea" navy background and a "Vibrant Mint" primary accent.

- **Primary:** #12C999 (Emerald/Mint). Used for primary calls to action, active states, and success indicators.
- **Secondary:** #0D1B2A (Navy). The core background color for the application.
- **Tertiary:** #1B4332 (Forest). Used for surface layering, cards, and subtle background gradients.
- **Neutral:** #E0E1DD. High-readability grey-white for body text.
- **Surface:** #1B263B. Used for secondary containers and inputs to provide depth against the main background.

## Typography
This design system utilizes **Be Vietnam Pro** across all levels to maintain a contemporary, friendly, and highly legible interface.

Headlines are characterized by heavy weights and slightly tightened letter spacing to create a strong visual impact against the dark background. Body text maintains a generous line height (1.6) to ensure readability of longer paragraphs. Labels use medium weights and uppercase styling to provide clear distinction for metadata and small UI triggers.

## Layout & Spacing
The layout follows a **Fluid Grid** model centered on an 8px base unit.

- **Desktop:** 12-column grid with 24px gutters. Outer margins are flexible but maintain a minimum of 64px.
- **Tablet:** 8-column grid with 24px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Vertical rhythm is established through consistent use of `lg` (48px) and `xl` (80px) spacing between major sections, while internal card components use `md` (24px) padding.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Background):** Pure navy (#0D1B2A).
2.  **Level 1 (Cards/Sections):** Semi-transparent surfaces (rgba(255, 255, 255, 0.05)) with a 12px backdrop blur.
3.  **Level 2 (Modals/Popovers):** Surface-container Tier 2 (#1B263B) with a subtle, diffused 20% opacity black shadow.
4.  **Accents:** Thin, 1px borders in rgba(255, 255, 255, 0.1) are used to define edges on dark surfaces where shadows would be invisible.

## Shapes
The design system uses a **Rounded** shape language to soften the high-tech aesthetic and make the UI feel more approachable.

- Standard components (buttons, inputs) use a 0.5rem (8px) radius.
- Large containers and cards use a 1rem (16px) radius to emphasize the "glass" container feel.
- Icons are typically encased in rounded-square or circular containers to maintain the friendly geometry.

## Components
- **Buttons:** Primary buttons are solid "Vibrant Mint" with dark navy text. Secondary buttons use a ghost style with a 1px emerald border.
- **Cards:** Use frosted glass effect (backdrop-blur) with a subtle 1px border. Backgrounds should be slightly lighter than the base navy to indicate elevation.
- **Input Fields:** Darker than the card surface with a 1px border that glows emerald on focus.
- **Chips:** Small, pill-shaped elements with low-opacity emerald backgrounds (rgba(18, 201, 153, 0.15)) and solid emerald text.
- **Lists:** Items separated by low-contrast 1px dividers. Hover states should utilize a subtle background tint change.
- **Progress Indicators:** Use the primary emerald color against a dark track for high visibility.