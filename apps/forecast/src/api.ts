export type Day = { label: string; high: number; low: number; sky: string };
export type CityForecast = { city: string; days: Day[] };

const SKIES = ['Clear', 'Partly cloudy', 'Overcast', 'Light rain', 'Windy'];
const LABELS = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];

/** Small deterministic hash so a city always gets the same made-up weather. */
function seed(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchForecast(city: string): Promise<CityForecast> {
  await wait(900);
  const s = seed(city);
  const base = 8 + (s % 22);
  return {
    city,
    days: LABELS.map((label, i) => {
      // `>>>`, not `>>`: the hash is unsigned, and a signed shift turns large
      // seeds negative, which makes the modulo (and the array index) negative.
      const drift = ((s >>> (i * 3)) % 7) - 3;
      return {
        label,
        high: base + drift + 6,
        low: base + drift - 2,
        sky: SKIES[(s >>> (i * 5)) % SKIES.length],
      };
    }),
  };
}
