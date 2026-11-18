import { render } from '@solidjs/web';
// The shared system first, so each app's own styles layer on top of it.
import '../../../theme.css';
import App from './App';

render(() => <App />, document.getElementById('root')!);
