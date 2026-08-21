---
name: FinSense Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#6029c9'
  on-tertiary: '#ffffff'
  tertiary-container: '#7948e3'
  on-tertiary-container: '#f0e6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-financial:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-financial-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1.25rem
  gutter: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
  section-gap: 2rem
---

## Brand & Style
The design system is centered on the intersection of human-centric support and AI-driven precision. It targets individuals seeking financial clarity through a "calm-tech" lens. The brand personality is supportive, professional, and reliable, avoiding the coldness of traditional banking in favor of a friendly, guiding presence.

The visual style follows a **Corporate / Modern** aesthetic with a strong emphasis on **Minimalism**. It utilizes generous whitespace, high-quality typography, and a card-based architecture to reduce cognitive load. Subtle AI accents are introduced via soft violet gradients, signifying intelligent insights without disrupting the overall sense of financial security.

## Colors
The palette is rooted in a deep teal primary color to evoke trust and stability. A "Positive Mint" is used exclusively for income and growth indicators, while "Soft Red" and "Amber" manage risk communication. 

In **Dark Mode**, surfaces are elevated using a deep slate base (#0F172A) with slightly lighter navy-slate tones for nested cards to maintain depth. The AI Accent utilizes a linear gradient (e.g., `#8B5CF6` to `#6366F1`) to highlight predictive features and automated insights.

## Typography
The system uses a dual-font strategy. **Plus Jakarta Sans** provides a friendly yet authoritative voice for headlines and financial figures. For high-impact numbers (account balances), the "Extra Bold" weight is mandatory. **Inter** is used for all functional text, body copy, and inputs to ensure maximum legibility at small sizes.

On mobile devices, headlines scale down to prevent awkward line breaks, while the "Display Financial" role ensures that primary balances remain the focal point of the dashboard.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for handheld devices. The standard horizontal margin is 20px (1.25rem) to provide breathing room against the device edges. 

Content is organized into a vertical stack of cards. Spacing between cards should generally be 16px (1rem), while spacing within a card follows an 8px incremental scale. For dense data views (like transaction lists), a tighter 12px gutter is permitted. On tablets, the layout expands to a 2-column masonry grid for card units.

## Elevation & Depth
The system uses **Tonal Layers** combined with **Ambient Shadows** to define hierarchy. 
- **Base:** The background (#F8FAFC) is the lowest layer.
- **Level 1 (Cards):** Pure white surfaces with a soft, diffused shadow (0px 4px 12px rgba(15, 23, 42, 0.05)).
- **Level 2 (Modals/Overlays):** Elevated surfaces with a more pronounced shadow (0px 10px 25px rgba(15, 23, 42, 0.1)).

In Dark Mode, elevation is communicated through color shifts rather than shadow intensity. Higher-elevation elements use lighter shades of slate to appear "closer" to the user.

## Shapes
The shape language is approachable and soft. The standard corner radius for primary containers and cards is **20px**, creating a friendly, modern appearance. Buttons and input fields use a **12px** radius to maintain a cohesive look with the larger containers while fitting comfortably within the layout. Interactive chips use a fully rounded "pill" shape (999px) for quick visual scanning.

## Components
- **Buttons:** Primary buttons use the Teal #0F766E fill with white text. AI-specific actions (e.g., "Ask AI") should use the Violet gradient with a subtle white glow.
- **Cards:** Cards are the primary container. They must have a 20px radius and a 1px border (#E2E8F0) in light mode to define edges on white backgrounds.
- **Inputs:** Text fields use a 12px radius, a light gray background (#F1F5F9), and a 2px Teal border on focus.
- **Chips:** Used for categories (e.g., "Groceries"). These should have a low-opacity background of the primary color (Teal at 10% opacity) with Teal text.
- **Lists:** Transaction lists should be clean, using a 1px bottom border for separation, with the amount in Inter SemiBold.
- **Progress Bars:** Use for budget tracking. The track is light gray, and the fill color dynamically changes from Teal to Amber to Red based on the percentage of budget spent.
- **AI Insights:** A special component with a thin violet-to-blue gradient border to signify that the content was generated by the AI engine.