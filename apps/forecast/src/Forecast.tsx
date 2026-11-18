import { createMemo, Errored, For, isPending, type ParentComponent } from 'solid-js';
import { fetchForecast } from './api';
import { bundleHost } from './origin';
import { ALERT, PixelIcon, WEATHER } from './pixel';
import './Forecast.css';

/**
 * Receives plain values from the host and turns them into async data.
 *
 * This component has no `<Loading>` of its own. While the first forecast is in
 * flight, the nearest boundary up the tree waits on it, and that boundary
 * lives in the shell, a different bundle built by a different compiler run.
 * After the first answer, a city change keeps the old forecast on screen
 * (the hold) and `isPending` marks it stale.
 *
 * Some entries in the city list are counties or places the geocoder can't
 * find; `<Errored>` shows that here instead of failing the whole page, and it
 * recovers on its own when the city changes.
 */
export default function Forecast(props: { city: string; state: string }) {
  const forecast = createMemo(() => fetchForecast(props.city, props.state));

  return (
    <Errored
      fallback={(error) => (
        <ForecastWindow>
          <div class="forecast-error" role="status">
            <PixelIcon art={ALERT} scale={3} />
            {/* The message names the place that failed, so it never mixes up old and new cities. */}
            <p>No forecast for this one. {String(error()).replace(/^Error: /, '')} Pick another city.</p>
          </div>
        </ForecastWindow>
      )}
    >
      <ForecastWindow holding={isPending(forecast)}>
        <h3 class="forecast-city">
          {forecast().city}
          <span>{forecast().state}</span>
        </h3>

        <ol class="days">
          <For each={forecast().days}>
            {(day) => (
              <li>
                <span class="day">{day.label}</span>
                <PixelIcon art={WEATHER[day.icon]} />
                <span class="sky">{day.sky}</span>
                <span class="temp tabular">
                  <strong>{day.high}°</strong> {day.low}°
                </span>
              </li>
            )}
          </For>
        </ol>
      </ForecastWindow>
    </Errored>
  );
}

const ForecastWindow: ParentComponent<{ holding?: boolean }> = (props) => {
  return (
    <section
      class={['window', 'forecast-window', { holding: props.holding }]}
      aria-labelledby="forecast-title"
    >
      <header class="window-bar">
        <span class="window-close" aria-hidden="true" />
        <h2 id="forecast-title" class="window-title">
          forecast — remote
        </h2>
      </header>
      <div class="window-info">
        <span>
          Exposes <code>./Forecast</code>
        </span>
        <span class="host">{bundleHost()}</span>
      </div>
      <div class="window-body">{props.children}</div>
      <footer class="window-status">
        <span>5 days, °C</span>
        <a href="https://open-meteo.com/">Data: Open-Meteo</a>
      </footer>
    </section>
  );
};
