/**
 * Forecasts from the public Open-Meteo APIs (https://open-meteo.com). No key
 * needed, and they allow browser requests. A city name is ambiguous on its own
 * (there's an Aberdeen in about twenty states), so the lookup filters by state.
 */
import type { WeatherIcon } from './pixel';

export type Day = { label: string; high: number; low: number; sky: string; icon: WeatherIcon };
export type CityForecast = { city: string; state: string; days: Day[] };

type Place = { name: string; admin1?: string; feature_code?: string; latitude: number; longitude: number };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${new URL(url).host} responded ${res.status}`);
  return (await res.json()) as T;
}

async function locate(city: string, state: string): Promise<Place> {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search' +
    `?name=${encodeURIComponent(city)}&count=20&countryCode=US&language=en&format=json`;
  const { results = [] } = await getJson<{ results?: Place[] }>(url);
  const inState = results.filter((place) => place.admin1 === state);
  // Prefer populated places (feature codes PPL*) over parks, airports and the like.
  const match = inState.find((place) => place.feature_code?.startsWith('PPL')) ?? inState[0];
  if (!match) throw new Error(`Couldn't find ${city} in ${state}.`);
  return match;
}

// WMO weather interpretation codes, as documented by Open-Meteo.
const SKY: Record<number, [string, WeatherIcon]> = {
  0: ['Clear', 'clear'], 1: ['Mostly clear', 'partly'], 2: ['Partly cloudy', 'partly'], 3: ['Overcast', 'cloudy'],
  45: ['Fog', 'fog'], 48: ['Freezing fog', 'fog'],
  51: ['Light drizzle', 'drizzle'], 53: ['Drizzle', 'drizzle'], 55: ['Heavy drizzle', 'drizzle'],
  56: ['Freezing drizzle', 'drizzle'], 57: ['Freezing drizzle', 'drizzle'],
  61: ['Light rain', 'rain'], 63: ['Rain', 'rain'], 65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'], 67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'], 73: ['Snow', 'snow'], 75: ['Heavy snow', 'snow'], 77: ['Snow grains', 'snow'],
  80: ['Showers', 'rain'], 81: ['Showers', 'rain'], 82: ['Heavy showers', 'rain'],
  85: ['Snow showers', 'snow'], 86: ['Snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'], 96: ['Thunderstorm, hail', 'storm'], 99: ['Thunderstorm, hail', 'storm'],
};

function dayLabel(date: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
}

export async function fetchForecast(city: string, state: string): Promise<CityForecast> {
  const place = await locate(city, state);
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${place.latitude}&longitude=${place.longitude}` +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5';
  const { daily } = await getJson<{
    daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
  }>(url);

  return {
    city,
    state,
    days: daily.time.map((date, i) => ({
      label: dayLabel(date, i),
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      sky: SKY[daily.weather_code[i]]?.[0] ?? 'Unknown',
      icon: SKY[daily.weather_code[i]]?.[1] ?? 'cloudy',
    })),
  };
}
