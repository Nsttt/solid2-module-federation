import { Loading } from 'solid-js';
import { render } from '@solidjs/web';
import Forecast from './Forecast';
import '../../../theme.css';

// Standalone mode, so the remote can be developed without the shell.
render(
  () => (
    <main class="standalone">
      <Loading fallback={<p>Loading forecast…</p>}>
        <Forecast city="Seattle" />
      </Loading>
    </main>
  ),
  document.getElementById('root')!,
);
