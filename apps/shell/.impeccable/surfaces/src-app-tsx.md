---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Shell demo page

Scope: the shell page (host) and the two federated components it renders, `places/LocationPicker` and `forecast/Forecast`, plus their standalone pages. Visitor mode: Experience.

Audience: developers arriving from a social post. Job: see in one look that three separately deployed bundles share one Solid 2.0 graph, then go to the repo. Constraints: live API data only, every state in PRODUCT.md stays visible, each remote keeps styling its own component.

Memorable moment: change the state and both remote windows dither down together, marching ants running, then snap back at the same instant.

## Direction contract

THESIS: Federation as the one-bit desktop always drew it: separately shipped programs are separate windows on one desktop. Refuses the dark dev-tool demo with a headline over a row of cards.

OWN-WORLD: Pure #000 ink on #fff paper, every grey an ordered dither (25/50/75%); the desktop is a 50% stipple. Windows: 2px black frame, hard 4px offset shadow, striped title bar with close box and centered title. Silkscreen pixel capitals for titles and display, Pixelify Sans for body. Pressing inverts; selection inverts over dither; disabled dims to dither.

STORY: The visitor sees three windows, each titled with its bundle and port, understands the picker and forecast are separate programs inside the shell, changes the state, watches one transition cross both, then opens the GitHub icon.

FIRST VIEWPORT: Menu bar across the top (Solid × MF wordmark left, "1 copy of Solid" status right). A wide shell window holds the headline "One graph, three bundles" at display scale and one line of explanation. Overlapping it lower: the places window (left, ~35% width) and the larger forecast window (right, ~55%). Desktop icons for GitHub and Zephyr at the right edge. The primary action is the state select in the places window.

FORM: One-bit desktop, dealt challenger, chosen over my ranked list (assigned was my 4th, the synoptic chart). seed:fe35852a94c7748e

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
