---
name: React Hotkeys Hook Documentation
description: A practical documentation site with a tactile shortcut cue sheet on its homepage.
colors:
  home-ink: '#17191f'
  home-surface: '#20232b'
  home-code-bg: '#15171c'
  home-hover: '#30343e'
  home-text: '#f3efe9'
  home-muted: '#c1bdc2'
  home-line: '#4a4b53'
  home-focus: '#b7c8ff'
  home-keyword: '#c4b8ff'
  home-function: '#a7bcff'
  home-string: '#ffab8b'
  home-error: '#ffb6a4'
  cue-edge: '#c65037'
  cue-coral: '#ff805b'
  cue-coral-hover: '#ff9a79'
  cue-dark: '#251b1b'
  home-light-bg: '#f7f5f0'
  home-light-surface: '#efede8'
  home-light-code-bg: '#f9f8f5'
  home-light-hover: '#e4e0d9'
  home-light-text: '#25232a'
  home-light-muted: '#5c5861'
  home-light-line: '#cbc6c0'
  home-light-focus: '#3c55a0'
  home-light-keyword: '#694aa4'
  home-light-function: '#32559c'
  home-light-string: '#a13d28'
  home-light-error: '#a13420'
  docs-light-bg: '#f7f5f0'
  docs-dark-bg: '#17191f'
  docs-light-primary: '#a13d28'
  docs-dark-primary: '#ff805b'
typography:
  home-display:
    fontFamily: 'Manrope Variable, system-ui, sans-serif'
    fontSize: 'clamp(2.6rem, 6vw, 5.75rem)'
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: '-0.04em'
  home-headline:
    fontFamily: 'Manrope Variable, system-ui, sans-serif'
    fontSize: 'clamp(2.2rem, 4vw, 3.5rem)'
    fontWeight: 750
    lineHeight: 1.12
    letterSpacing: '-0.035em'
  home-body:
    fontFamily: 'Manrope Variable, system-ui, sans-serif'
    fontSize: '1rem'
    lineHeight: 1.7
  docs-heading:
    fontFamily: 'Sora, system-ui, -apple-system, sans-serif'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.02em'
  docs-body:
    fontFamily: 'Libre Franklin, system-ui, -apple-system, sans-serif'
  code:
    fontFamily: 'JetBrains Mono, SF Mono, Fira Code, Monaco, monospace'
    fontSize: '0.875rem'
    lineHeight: 1.6
rounded:
  home: '0'
  docs: '0'
spacing:
  1: '0.25rem'
  2: '0.5rem'
  3: '0.75rem'
  4: '1rem'
  6: '1.5rem'
  8: '2rem'
  12: '3rem'
  16: '4rem'
  24: '6rem'
components:
  home-button-primary:
    backgroundColor: '{colors.cue-coral}'
    textColor: '{colors.cue-dark}'
    rounded: '{rounded.home}'
    padding: '0.85rem 1.25rem'
  home-button-primary-hover:
    backgroundColor: '{colors.cue-coral-hover}'
    textColor: '{colors.cue-dark}'
  home-button-closing:
    backgroundColor: '{colors.cue-dark}'
    textColor: '#fff7f1'
    rounded: '{rounded.home}'
    padding: '0.85rem 1.25rem'
  home-key:
    backgroundColor: '{colors.cue-coral}'
    textColor: '{colors.cue-dark}'
    rounded: '{rounded.home}'
    size: '5rem'
  home-command:
    backgroundColor: '{colors.home-surface}'
    textColor: '{colors.home-text}'
    rounded: '{rounded.home}'
    padding: '0.25rem 0.4rem 0.25rem 1rem'
  home-playground:
    backgroundColor: '{colors.home-surface}'
    rounded: '{rounded.home}'
  docs-button-primary-dark:
    backgroundColor: '{colors.docs-dark-primary}'
    textColor: '{colors.cue-dark}'
    rounded: '{rounded.docs}'
    padding: '0.625rem 1.25rem'
  docs-button-secondary-dark:
    backgroundColor: 'transparent'
    textColor: '{colors.home-text}'
    rounded: '{rounded.docs}'
    padding: '0.625rem 1.25rem'
---

# Design System: React Hotkeys Hook Documentation

## Overview

**Creative North Star: "The Cue Sheet"**

The homepage is a practical, tactile cue sheet: ink-dark surfaces, warm type, coral controls, fine divisions and code presented as part of the action. Its light theme keeps the same hierarchy in warm paper and dark ink. The live key, its hook and its result belong together; interaction is understandable without decoration.

The documentation and shared navigation use the same ink, warm paper, coral and periwinkle palette. Documentation retains its reading-focused Docusaurus layout and Sora / Libre Franklin typography. The hotkey mark is shared in the navbar and browser tab.

**Key Characteristics:**

- Home: spacious, divided cue-sheet composition with tactile coral actions and legible code.
- Both home themes retain distinct surface, text, line, focus and syntax colors.
- Docs: the same color roles in restrained reading surfaces, compact controls and version-aware navigation.
- Both homepage and documentation use square corners, visible focus and keyboard-accessible controls.

## Colors

Homepage and documentation share their light and dark color roles; documentation exposes them through global Infima overrides. The frontmatter names include the scope and theme explicitly.

### Primary

- **Cue Coral** (`cue-coral`): homepage primary actions, the tactile K key and the closing panel. Its lighter hover is `cue-coral-hover`; dark text on coral is `cue-dark`.
- **Documentation Coral** (`docs-light-primary`, `docs-dark-primary`): dark coral for readable light-theme links and coral on dark backgrounds; filled actions use coral with dark text in both themes.

### Secondary

- **Soft Periwinkle** (`home-keyword`, `home-function`): homepage syntax distinctions in dark mode. The light theme uses `home-light-keyword` and `home-light-function`.
- **Warm String** (`home-string`, `home-light-string`): string literals in the cue, with theme-specific values.

### Neutral

- **Ink and Raised Ink** (`home-ink`, `home-surface`, `home-code-bg`): dark home, controls and code panels. `home-text`, `home-muted`, `home-line` and `home-focus` distinguish content, quiet copy, divisions and focus.
- **Warm Paper** (`home-light-bg`, `home-light-surface`, `home-light-code-bg`): the corresponding light homepage surfaces, paired with `home-light-text`, `home-light-muted`, `home-light-line` and `home-light-focus`. Theme-specific `home-hover` and `home-light-hover` indicate interactive surfaces; `home-error` and `home-light-error` identify errors.
- **Shared Docs Ground** (`docs-light-bg`, `docs-dark-bg`): the same warm paper and ink as the homepage, including the shared navbar.

**The Typography Scope Rule.** Share colors and syntax roles across the site, but retain the documentation's reading typography and layout outside the homepage.

## Typography

**Homepage:** Manrope Variable, falling back to system sans; self-hosted through `@fontsource-variable/manrope`.
**Documentation:** Sora headings and Libre Franklin body text, with system sans fallbacks. **Code:** JetBrains Mono and monospace fallbacks; shared Prism themes apply the landing palette to code blocks and editable examples.

### Hierarchy

- **Home display:** the large, heavy, tightly tracked opening title, balanced and limited to 24ch. At widths up to 760px it becomes `clamp(2.35rem, 10vw, 3.5rem)`.
- **Home headline:** section titles use the smaller `home-headline` scale and a 16ch maximum. Feature titles are 1.3rem / 1.25 at weight 750.
- **Home body:** 1rem / 1.7 for section copy; the introductory paragraph uses `clamp(1.05rem, 1.45vw, 1.2rem)` with a 62ch maximum.
- **Code:** global blocks use the `code` role; the live editor is 0.78rem / 1.75, and the cue example is 0.88rem / 1.75.
- **Docs headings and body:** follow the global Sora and Libre Franklin stacks rather than importing homepage typography into reading pages.

## Layout

The homepage centers a container at `min(100% - 3rem, 76rem)` with generous responsive section padding. At 760px and below its side subtraction is 2.5rem; at 380px and below it is 2rem. The hero starts at `clamp(4rem, 7vw, 6.5rem)` top padding. The feature area and task demo use two columns on wide screens and stack at 760px.

The cue row uses three divided columns for key, hook and result. At 996px the key and hint stack; at 700px the key and result sit side by side above the full-width hook while the source order remains key, hook, result. Horizontal overflow is contained within code. The shared global spacing scale runs from 0.25rem to 6rem; homepage sections also use fluid spacing.

## Elevation & Depth

The homepage is predominantly flat: subtle surface changes and 1px rules separate areas. The K control gets physical depth from a thicker bottom border, which reduces on press; this is a border, not a card shadow. Home actions lift 2px on hover over 160ms ease-out, while the key's press changes its position and bottom border. These transitions are disabled for reduced motion.

The global documentation primary-button hover shadow is `0 4px 12px rgb(255 128 91 / 30%)`. The shared navbar is flat, with a bottom border and no shadow. The existing zero-blur keycap shadow is not a reusable elevation rule.

## Shapes

Use fine 1px separators for homepage sections, columns and panels. Controls, code blocks and playground surfaces use square corners across the homepage and documentation, including navigation, breadcrumbs and search. Key shapes have a grounded bottom edge. The borderless flame mark is an SVG asset, shown at 32 × 32 in the navbar and offered as a favicon. A multi-size ICO fallback is generated from the same SVG with `rsvg-convert` and ImageMagick, at 16, 24, 32, 48 and 64px.

## Components

### Homepage actions and install command

The primary action is coral with dark text, square corners, a 3.5rem minimum height and 0.85rem × 1.25rem padding. It lightens and lifts on hover. The closing panel reverses the action to dark with warm white text. Home links and actions receive a 3px theme focus outline with a 4px offset.

The install command is a square, bordered surface beside the action. A keyboard-accessible radio group lists pnpm, bun, npm and yarn, with pnpm selected by default; the icon-only copy button copies the selected command. Success and copy failure are announced inline, and the command remains selectable if copying fails.

### Shortcut cue

A divided key / hook / result row shows a coral 5rem square key (4.25rem at 700px and below), syntax-colored code and a tabular count. Press K without focusing the example, or click or tap the key; the result updates in a polite live region. A square switch turns the global shortcut on or off; its track and label become neutral when off, while the key remains tappable. The shortcut does not fire while typing in fields or editors. A 3px focus ring and reduced-motion treatment preserve clarity across input methods.

### Editable playground

A square, outlined container joins a darker code editor and an interactive preview, each with a labeled header. The editor uses the shared theme-specific Prism palette and visible focus; the preview has a square bordered surface, list dividers, and a square action. At 760px and below, the preview follows the editor vertically. Errors appear in the theme's error color.

### Documentation controls and navigation

Shared buttons use Sora, square corners and 0.625rem × 1.25rem padding; the primary uses coral with dark ink and the secondary uses an outlined surface. Inline keyboard keys are monospace with square corners and a thicker lower edge. Tags use the monospace stack and square corners. Navigation retains the active documentation theme, Sora title, Libre Franklin links, version selection and theme switch; at 380px its horizontal padding and title shrink.

## Do's and Don'ts

### Do:

- **Do** keep homepage key, hook and result visually related, including in the narrow layout.
- **Do** preserve a visible focus treatment and a pointer or touch alternative for interactive shortcuts.
- **Do** use the homepage's light and dark token sets together when changing a home component.
- **Do** share the landing palette with documentation while retaining its reading typography and navigation.
- **Do** use the supplied hotkey SVG for the navbar and favicon.

### Don't:

- **Don't** apply homepage Manrope as if it were the global documentation typeface.
- **Don't** rely on motion alone to communicate a shortcut result.
- **Don't** turn the thin cue-sheet dividers into decorative card shadows.
- **Don't** trigger the global shortcut while users type in fields or editors, or after they turn it off.
