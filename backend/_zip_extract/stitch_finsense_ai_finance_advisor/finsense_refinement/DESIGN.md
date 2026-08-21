---
name: FinSense Refinement
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3e4947'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
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
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a high-trust fintech environment that balances institutional stability with forward-thinking AI intelligence. The brand personality is precise, transparent, and empowering, designed to evoke a sense of financial clarity and proactive control.

The visual style follows a **Corporate Modern** aesthetic with **Glassmorphic** accents specifically reserved for AI-driven insights. It prioritizes a clean, card-based architecture with generous whitespace to reduce cognitive load during complex data analysis. The interface utilizes soft depth, refined typography, and a sophisticated color palette to differentiate between human-input data and machine-generated intelligence.

## Colors

The palette is anchored by **Deep Teal (#0F766E)**, providing a professional and grounded foundation for primary actions and navigation. **Mint Green (#10B981)** is utilized for positive growth metrics and "success" states, while **Amber (#F59E0B)** and **Soft Red (#EF4444)** serve as critical indicators for warnings and alerts respectively.

A signature **AI Violet (#8B5CF6)** is introduced as a functional accent, used exclusively to denote features, insights, or data visualizations powered by artificial intelligence. 

In **Light Mode**, the system uses soft gray fills and subtle borders. In **Dark Mode**, the background shifts to a deep navy-slate to maintain contrast with the primary teal while ensuring the AI Violet remains vibrant and legible.

## Typography

This design system employs a dual-font strategy. **Plus Jakarta Sans** is used for headlines and display text to provide a modern, welcoming, and slightly rounded geometric feel that softens the seriousness of financial data. 

**Inter** is the workhorse for all body copy, data tables, and labels. Its high legibility and neutral character ensure that complex financial figures remain the focus. For mobile devices, headline scales are aggressively reduced to maintain hierarchy without sacrificing screen real estate.

## Layout & Spacing

The system utilizes a **Fluid Grid** based on an 8px rhythmic scale. Main dashboard views should adhere to a 12-column layout on desktop with 24px gutters.

**Desktop:** 12 columns | 24px gutters | 40px side margins.
**Tablet:** 8 columns | 16px gutters | 24px side margins.
**Mobile:** 4 columns | 16px gutters | 16px side margins.

Content is organized into logical "Card Groups." White space is used as a structural tool; ensure a minimum of 40px (lg) spacing between major functional sections to prevent visual clutter.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

- **Level 0 (Background):** Solid background color (F9FAFB/0F172A).
- **Level 1 (Cards):** White or Deep Navy cards with a 1px border (#E5E7EB in light, #1E293B in dark) and a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)).
- **Level 2 (Active/Hover):** Increased shadow spread and slight lift.
- **AI Overlay:** For AI-generated components, use a subtle 4px backdrop blur with a 5% AI Violet tint to distinguish from standard data.

## Shapes

The design system uses a generous corner radius to create an approachable, modern feel. 
- **Standard Cards:** 20px corner radius.
- **Input Fields & Small Components:** 12px corner radius.
- **Buttons:** Fully rounded (Pill-shaped) to distinguish interactive triggers from structural containers.

## Components

### Buttons
Primary buttons are **Pill-shaped** using the Deep Teal fill. Secondary buttons use a transparent background with a 1px Teal border. AI-specific actions should use a gradient transition from Deep Teal to AI Violet.

### Input Fields
Inputs are styled with a **12px corner radius** and a light gray fill (#F3F4F6 in light mode). On focus, the border transitions to Deep Teal with a 2px outer glow. Labels should always be positioned above the field using `label-md` typography.

### AI Insight Cards
These are specialized containers for machine-learning outputs. They feature a 20px radius, a subtle 1px border colored in AI Violet at 30% opacity, and a "Spark" icon in the top right. The background may use a very faint violet-to-transparent gradient to signal its "smart" nature.

### Chips & Lists
Lists use 16px vertical padding with subtle dividers. Chips (used for categories or status) are pill-shaped with 8px horizontal padding, utilizing the semantic colors (Mint, Amber, Red) at 10% opacity for the background and 100% opacity for the text.