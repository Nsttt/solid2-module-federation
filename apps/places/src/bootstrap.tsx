import { Loading } from 'solid-js';
import { render } from '@solidjs/web';
import LocationPicker from './LocationPicker';
import { LocationContext, createLocation } from './location';
import '../../../theme.css';

// Standalone mode: the remote renders its own exposed component so it can be
// developed and tested without the shell.
function Standalone() {
  const location = createLocation();
  return (
    <LocationContext value={location}>
      <main class="standalone">
        <Loading fallback={<p>Loading places…</p>}>
          <LocationPicker />
          <p>
            Selected: {location.selectedCity()}, {location.selectedState()}
          </p>
        </Loading>
      </main>
    </LocationContext>
  );
}

render(() => <Standalone />, document.getElementById('root')!);
