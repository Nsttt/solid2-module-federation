/**
 * A stand-in for a real API. Each call resolves after a delay so the async
 * graph has something to wait on, and the delays are long enough to see the
 * hold in the UI.
 */
const STATES: Record<string, string[]> = {
  US: ['California', 'New York', 'Texas', 'Washington'],
};

const CITIES: Record<string, string[]> = {
  California: ['San Francisco', 'Los Angeles', 'San Diego', 'Sacramento'],
  'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
  Texas: ['Austin', 'Houston', 'Dallas', 'El Paso'],
  Washington: ['Seattle', 'Spokane', 'Tacoma', 'Olympia'],
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getStates(country: string): Promise<string[]> {
  await wait(500);
  return STATES[country] ?? [];
}

export async function getCities(state: string): Promise<string[]> {
  await wait(700);
  return CITIES[state] ?? [];
}
