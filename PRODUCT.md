# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers arriving from a social post (X, LinkedIn, Bluesky) announcing that Module Federation works with Solid 2.0. They click through to see it running, judge in a few seconds whether the claim holds, then go to the GitHub repository.

## Product Purpose

A live demo proving that Solid 2.0's async reactive graph works across independently built and deployed Module Federation bundles. Success: a visitor leaves knowing which part of the page came from which bundle, and that one Solid transition crossed all three.

## Positioning

The cascading dropdown from the Solid 2.0 release post, split across a host (`shell`) and two remotes (`places`, `forecast`), each built with Rsbuild and deployed separately to Zephyr Cloud. The shell owns the only `<Loading>` boundary; the remotes have no loading state of their own. The weather app is the vehicle; the bundle boundaries are the point.

## Operating Context

- Usually opened from a link in a post, on desktop or phone, by someone who reads code for a living.
- The visitor changes the state or city; during the change the previous answer stays on screen (Solid's "hold") until every bundle has its new data, then everything updates at once.
- Repository: https://github.com/Nsttt/solid2-module-federation. Live deployment on Zephyr Cloud.

## Capabilities and Constraints

- Three apps: `shell` (host, :3000 in dev), `places` (remote, :3001, exposes `./location` and `./LocationPicker`), `forecast` (remote, :3002, exposes `./Forecast`). Each also runs standalone.
- Data is live from public APIs with no key: CountriesNow (US states and cities) and Open-Meteo (geocoding and 5-day forecast). Both are credited on the page.
- States that must stay visible: first-load skeleton, the hold during a change (city select disabled, forecast marked stale), a forecast error for places the geocoder can't find (with recovery), an API-outage error with retry, and the development-only Solid copy counter ("1 copy of Solid").
- Each remote styles its own component; shared tokens come from the shell. Solid 2.0 (`solid-js`, `@solidjs/web`, `@solidjs/signals`) is shared as a singleton.
- Temperatures are shown in °C.

## Brand Commitments

None. No logo or brand assets exist for this demo.

## Evidence on Hand

- Real, live weather and place data from the two APIs above.
- Measured behavior: one copy of Solid across three bundles; a state change held for roughly 0.3 to 0.6 seconds with live APIs.
- No testimonials, users, benchmarks, or other claims exist; none may be invented.

## Product Principles

1. Show the mechanism, don't describe it: bundle boundaries and the hold must be visible in the interface itself.
2. Every piece of the page is honest about where it came from.
3. Fast to understand: a visitor from a post gets the point in one look.
4. Real data, real failure states; nothing faked.
