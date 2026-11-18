import { createContext, createMemo, createSignal } from 'solid-js';
import { getCities, getStates } from './api';

/** Start somewhere recognizable when the API lists it; otherwise the first entry. */
const DEFAULT_STATE = 'California';
const DEFAULT_CITY = 'San Francisco';

const pick = (options: string[], preferred: string) =>
  options.includes(preferred) ? preferred : options[0];

/**
 * The cascading dropdown from the Solid 2.0 announcement, lifted out of the
 * component so other bundles can share it.
 *
 * `states` and `cities` are async memos: they return Promises and everything
 * downstream waits on them. `selectedState` and `selectedCity` are writable
 * derived signals: they reset whenever their source changes, and the user can
 * still overwrite them. No createResource, no createComputed, no effect keeping
 * two pieces of state in sync.
 */
export function createLocation(country = 'United States') {
  const states = createMemo(() => getStates(country));
  const [selectedState, setState] = createSignal(() => pick(states(), DEFAULT_STATE));
  const cities = createMemo(() => getCities(country, selectedState()));
  const [selectedCity, setCity] = createSignal(() => pick(cities(), DEFAULT_CITY));

  return { states, selectedState, setState, cities, selectedCity, setCity };
}

export type LocationModel = ReturnType<typeof createLocation>;

/**
 * Default-less context: the host must provide it. The context object is
 * created exactly once, in this module, and the shell imports this same module
 * through Module Federation, so the shell's provider and this remote's
 * consumer agree on its identity.
 */
export const LocationContext = createContext<LocationModel>();
