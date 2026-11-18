/**
 * US states and their cities from the public CountriesNow API
 * (https://countriesnow.space). No key needed, and it allows browser requests.
 */
const BASE = 'https://countriesnow.space/api/v0.1/countries';

type ApiResponse<T> = { error: boolean; msg: string; data: T };

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  const res = await fetch(`${BASE}${path}?${query}`);
  if (!res.ok) throw new Error(`CountriesNow ${path} responded ${res.status}`);
  const body = (await res.json()) as ApiResponse<T>;
  if (body.error) throw new Error(body.msg);
  return body.data;
}

export async function getStates(country: string): Promise<string[]> {
  const data = await get<{ states: { name: string }[] }>('/states/q', { country });
  return data.states.map((state) => state.name);
}

export function getCities(country: string, state: string): Promise<string[]> {
  return get<string[]>('/state/cities/q', { country, state });
}
