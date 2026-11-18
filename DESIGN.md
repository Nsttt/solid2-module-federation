---
name: Solid 2.0 × Module Federation
description: Three separately shipped bundles drawn as three windows on one one-bit desktop.
colors:
  ink: "#000000"
  paper: "#ffffff"
typography:
  display:
    fontFamily: "Silkscreen, Pixelify Sans, monospace"
    fontSize: "clamp(2.25rem, 6.2vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Silkscreen, Pixelify Sans, monospace"
    fontSize: "clamp(22px, 2.6vw, 32px)"
    fontWeight: 700
    lineHeight: 1.05
  title:
    fontFamily: "Silkscreen, Pixelify Sans, monospace"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "0.02em"
  body:
    fontFamily: "Pixelify Sans, Silkscreen, monospace"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "liga 0"
  body-strong:
    fontFamily: "Pixelify Sans, Silkscreen, monospace"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.45
  lede:
    fontFamily: "Pixelify Sans, Silkscreen, monospace"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.45
  small:
    fontFamily: "Pixelify Sans, Silkscreen, monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Silkscreen, Pixelify Sans, monospace"
    fontSize: "13px"
    fontWeight: 700
  menu:
    fontFamily: "Silkscreen, Pixelify Sans, monospace"
    fontSize: "14px"
    fontWeight: 400
  host:
    fontFamily: "Silkscreen, Pixelify Sans, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  none: "0px"
  button: "8px"
spacing:
  frame: "2px"
  strip-y: "6px"
  strip-x: "14px"
  field-gap: "18px"
  window-body: "clamp(16px, 2vw, 24px)"
  gutter: "clamp(16px, 3vw, 40px)"
  desk-gap: "32px"
  bar: "34px"
  menubar: "40px"
components:
  window:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  window-title:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "0 14px"
    height: "{spacing.bar}"
  window-title-holding:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  window-strip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    padding: "6px 14px"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.menu}"
    rounded: "{rounded.button}"
    padding: "9px 22px"
  button-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "10px 40px 10px 12px"
  field-label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  menubar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.menu}"
    height: "{spacing.menubar}"
  menubar-link-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "4px 8px"
  hold-state-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.small}"
    padding: "2px 8px"
  desk-icon-label:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    padding: "1px 6px"
    width: "112px"
  desk-icon-label-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: Solid 2.0 × Module Federation

## Overview

**Creative North Star: "The One-Bit Desktop"**

Federation drawn the way the early one-bit desktop always drew separate programs: as separate windows on one desktop. The shell is a wide host window; each remote bundle is its own window, titled with its bundle name and role, with a Finder-style info strip naming what it exposes and the host it loaded from. The bundle boundary is never described in prose alone; it is a window frame you can see.

Everything is pure ink on pure paper. There are no greys, no tints, no anti-aliasing: every intermediate tone is an ordered dither tile rendered pixel for pixel, the desktop itself is a 50% stipple, and fonts render with smoothing off. State is shown the way that desktop showed it: pressing inverts, the active title inverts, disabled controls dim to dither, and a window that is waiting draws marching ants around itself while its body dims to a 25% dither. The density is calm and document-like inside windows, with real data set in a legible pixel body face.

The system is shared: `theme.css` at the repo root owns tokens, dithers, window chrome, controls and the hold state, and every app (host and both remotes, embedded or standalone) imports it. Remotes style only their own contents.

**Key Characteristics:**
- Two colors only, ink #000 and paper #fff; tone comes from 2×2 ordered dither tiles.
- Windows: 2px ink frame, striped title bar with close box and centered uppercase title, solid offset drop shadow.
- Silkscreen pixel capitals for chrome and display; Pixelify Sans for reading.
- State by inversion, dither and marching ants, never by color or fade.
- Hand-drawn 16-pixel icon art rendered as crisp SVG rects at 2× or 3×.

## Colors

A strict one-bit palette: two values, with ordered dithers standing in for every grey.

### Primary
- **Ink** (#000000): all text, frames, rules, title-bar stripes, shadows, icons, focus outlines, and the inverted fill of any active or pressed thing (menu hover, pressed button, holding title, active hold indicator, desk-icon hover label, text selection).

### Neutral
- **Paper** (#ffffff): window interiors, the menu bar, control faces, label plates that knock out the stipple behind desk-icon names and window titles.

### Dithers (patterns, not colors)
- **25% dither**: a 2×2 tile with one ink pixel. Used for the hold dim over a waiting window body (multiplied) and the disabled select face.
- **50% dither**: a 2×2 checkerboard. The desktop background behind every window.

### Named Rules
**The One-Bit Rule.** Only #000 and #fff are ever painted. A grey, a tint, an opacity fade or a colored accent breaks the world; when an in-between tone is needed, use a dither tile at `background-size: 2px 2px` with `image-rendering: pixelated`.

**The Inversion Rule.** Emphasis and activity are expressed by swapping ink and paper on the element. Selection, hover in menus and icon labels, pressed buttons, the holding window title and the active hold indicator all invert; nothing gets a highlight color.

## Typography

**Display Font:** Silkscreen (with Pixelify Sans, monospace)
**Body Font:** Pixelify Sans (with Silkscreen, monospace)

**Character:** Silkscreen's blocky bitmap capitals carry chrome, titles and the headline the way a system font did; Pixelify Sans is the softer, mixed-case pixel face that keeps forecast rows and explanation readable at length. Both are self-hosted through `@fontsource` (Silkscreen 400/700, Pixelify Sans 400/600), with font smoothing off.

### Hierarchy
- **Display** (Silkscreen 700, clamp(2.25rem, 6.2vw, 5rem), 1.12, -0.03em, uppercase, balanced wrap): the single page headline in the shell window.
- **Headline** (Silkscreen 700, clamp(22px, 2.6vw, 32px), 1.05, uppercase): the forecast city name; its state sits beneath in body type.
- **Title** (Silkscreen 700, 16px, 0.02em, uppercase; 13px under 560px): window titles, ellipsized on one line.
- **Lede** (Pixelify Sans 400, 20px, max 62ch): the one explanatory paragraph under the headline.
- **Body** (Pixelify Sans 400, 18px, 1.45): select values and window content. Weight 600 marks forecast day names and the high temperature.
- **Small** (Pixelify Sans 400, 15px): info strips, status strips, the hold indicator, desk-icon names, sky descriptions on phones.
- **Menu / Button** (Silkscreen, 14px; 700 for the wordmark and buttons, buttons uppercase): the menu bar and push buttons.
- **Label** (Silkscreen 700, 13px, uppercase): field labels and the Solid copy counter.
- **Host** (Silkscreen 400, 12px): host:port readouts in info strips; inline `code` uses Silkscreen at 0.8em.

### Named Rules
**The No-Ligature Rule.** `font-variant-ligatures: none` is set globally; Pixelify's fi ligature reads as an A. Every letter is set on its own.

**The Two-Face Split Rule.** Silkscreen is for chrome and names (titles, labels, menu, code, hosts, headline); Pixelify Sans is for anything a person reads as a sentence or a data row. Numbers in data use `tabular-nums`.

## Layout

The page is a desktop: a sticky 40px menu bar across the top (wordmark with the two-window mark left, live hold and Solid status right, then text links), and below it a desk grid of one flexible column plus a 128px icon column, max 1360px, padded by the fluid gutter (clamp(16px, 3vw, 40px)) with a 32px column gap.

The shell window holds the headline, lede and the two remote windows. Remotes sit in a 5fr/7fr grid and overlap like real windows: the places window drops 56px lower and pushes 44px across the forecast window's left frame, sitting on top; the forecast window pads its contents left by 64px to stay clear. Overlap order is carried by wrapper slots so the windows themselves never become stacking contexts.

Spacing inside windows is quiet: info and status strips are 6px × 14px, window bodies clamp(16px, 2vw, 24px) (the shell body clamp(20px, 3vw, 40px)), fields stack 18px apart. Forecast days are a four-column grid (day, 32px icon, sky, temps) separated by 2px dotted ink rules.

Responsive behavior: at 900px the desk drops to one column, the remotes stack with a 28px gap and no overlap, the desk icons become a centered row under the shell, and the secondary menu link hides. At 560px the menu bar wraps, the wordmark shortens, and the status becomes its own full-bleed strip under a 2px rule. At 480px each forecast row becomes icon / day over sky / temps. At 360px gaps and icon widths tighten further. Standalone remote pages center a single window in 760px.

## Elevation & Depth

Depth is drawn, never lit. The only shadow is a solid ink slab offset down-right behind each window, the one depth cue the one-bit desktop had; there is no blur, no ambient shadow and no layering by tone. Stacking otherwise comes from overlap itself: the window on top simply covers the frame of the one below.

### Shadow Vocabulary
- **Window drop** (solid ink plate offset 6px right and 6px down, drawn as a `::before` behind the window): every window.
- **Control lift** (`box-shadow: 3px 3px 0 #000`): the select at rest; removed when disabled.
- **Default ring** (`box-shadow: 0 0 0 2px #fff, 0 0 0 4px #000`): the push button's outer bold ring, separated from its frame by a paper gap.
- **Knockout** (`box-shadow: 0 0 0 4px #fff`): clears the title-bar stripes around the close box.

### Named Rules
**The Solid Slab Rule.** Shadows are hard, unblurred ink offsets only. A blurred or translucent shadow cannot exist in one bit.

**The Hold Rule.** A window waiting on async data does three things at once and nothing else: its title inverts, its body dims under a multiplied 25% dither, and dashed 6px-on/6px-off marching ants circle it 9px out, stepping in 6 steps over 0.6s. With reduced motion the ants stand still but stay drawn. The previous content stays fully visible under the dim.

## Shapes

Rectangles with square corners and 2px ink frames everywhere: windows, selects, the close box, strips and rules. The one exception is the push button, rounded at 8px with its separate outer ring, the classic default-button silhouette. Icons are 16-pixel-wide hand-drawn grids (folder, document, disk, hourglass, check, alert, the two-window mark, and composed weather glyphs) rendered as `crispEdges` SVG rects at 2× (32px) inline or 3× (48px) for desk icons and alerts. Dashed and dotted lines are part of the vocabulary: dotted 2px for links, focus outlines and list rules; dashed 6px segments for marching ants.

## Components

### Windows
The signature container: every bundle, the alert and the loading placeholders are windows.
- **Frame:** 2px ink, square corners, paper interior, solid 6px ink drop slab.
- **Title bar:** 34px high; ink stripes (3px paper, 2px ink, repeating) fill the content box; a 16px square close box at 12px from the left, knocked out of the stripes; the centered uppercase Silkscreen title sits on its own paper plate. Remote titles read "places — remote", "forecast — remote"; the host reads "shell — host". The alert window omits the close box.
- **Info strip:** below the title bar, a 2px rule beneath; left says what the bundle exposes (with `code`), right gives the host:port in Silkscreen 12px.
- **Status strip:** bottom, 2px rule above; counts and the data-source credit link.
- **Holding:** see The Hold Rule.

### Buttons
- **Shape:** gently rounded (8px), 2px ink frame plus a 2px paper gap and 2px ink outer ring.
- **Default:** paper face, Silkscreen 700 14px uppercase ink, 9px × 22px padding.
- **Active:** inverts to ink face, paper text. No hover tint, no transition.

### Inputs / Fields
- **Field:** Silkscreen 700 13px uppercase label stacked 6px over its control.
- **Select:** native appearance removed; paper face, 2px ink frame, square corners, Pixelify 18px value, a pixel-drawn 14×8 ink chevron 14px from the right, 3px solid offset lift.
- **Hover:** the frame thickens by an inset 1px ink line.
- **Disabled (held):** lift removed, face fills with 25% dither behind the chevron, cursor shows progress.
- **Focus:** global 2px dotted ink outline, 3px offset.

### Navigation
- **Menu bar:** sticky, 40px, paper with a 2px ink bottom rule, Silkscreen 14px. Links have no underline and 4px × 8px padding; hover and focus invert the link to ink.
- **Desk icons:** right-hand column of 48px pixel icons over paper-plated names (Pixelify 15px) that knock out the stipple; hover inverts the name plate, keyboard focus draws a dotted outline around the icon.
- **Links in content:** inherit ink, 2px dotted underline at 4px offset, solid on hover.

### Hold Indicator
Lives in the menu bar: a check and "Settled" at rest; while held, an hourglass and "Holding for both remotes" in an inverted ink chip. Beside it, the Silkscreen copy counter ("1 copy of Solid"), which inverts when more than one copy is detected.

### Forecast Day Row
Day name (Pixelify 600), 32px composed weather icon, sky text, then tabular temperatures with the high in 600 and the low in 400, all separated by 2px dotted ink rules.

## Do's and Don'ts

### Do:
- **Do** paint only #000 and #fff, and reach for the 25% or 50% dither tile (2×2, pixelated) whenever a tone between them is needed.
- **Do** put every separately shipped bundle in its own window with the striped title bar, its bundle name and role in the title, and an info strip naming what it exposes and where it loaded from.
- **Do** show state by inversion, dither dimming and marching ants, applied to whole windows at once.
- **Do** draw icons as 16-pixel art rendered through the pixel icon renderer at 2× or 3× with `crispEdges`.
- **Do** keep Silkscreen for chrome and names and Pixelify Sans for sentences and data rows, with ligatures off.
- **Do** keep the ants static but visible under `prefers-reduced-motion`.

### Don't:
- **Don't** introduce greys, tints, opacity fades, smooth gradients (hard-stop stripes and dashes only), or any color.
- **Don't** blur or soften shadows; depth is the solid 6px slab and hard 3px control lift only.
- **Don't** round windows, selects or frames; the 8px corner belongs to the push button alone.
- **Don't** use spinners, skeleton shimmer or fade transitions for loading; a waiting window holds its previous content under the dither and ants.
- **Don't** turn on font smoothing or the Pixelify ligatures.
