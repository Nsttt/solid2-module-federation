import { Loading } from 'solid-js';
import { render } from '@solidjs/web';
// The shared system first, so the component's own styles layer on top of it.
import '../../../theme.css';
import Forecast from './Forecast';

// Standalone mode, so the remote can be developed without the shell.
render(
  () => (
    <main class="standalone">
      <Loading fallback={<p>Loading forecast…</p>}>
        <Forecast city="Seattle" state="Washington" />
      </Loading>
    </main>
  ),
  document.getElementById('root')!,
);
