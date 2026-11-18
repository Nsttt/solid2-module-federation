import { createSignal, createStore } from 'solid-js';

export type WindowId = 'shell' | 'places' | 'forecast';
type Point = { x: number; y: number };
type Outline = { x: number; y: number; w: number; h: number };

const IDS: WindowId[] = ['shell', 'forecast', 'places'];
/** How much of a title bar must stay on screen, so a window can always be grabbed again. */
const GRIP = 96;
/** Dragging is a desktop affordance; on narrow screens the windows stack and the page scrolls. */
const WIDE = '(min-width: 901px)';

/**
 * The shell is the host, so it owns the desktop: where each window sits, which
 * one is in front, and the drag. The remotes render their windows as usual and
 * never know they can be moved.
 */
export function createDesktop() {
  const [state, setState] = createStore({
    offset: Object.fromEntries(IDS.map((id) => [id, { x: 0, y: 0 }])) as Record<WindowId, Point>,
    // Back to front; the last one is the active window.
    order: [...IDS],
  });
  const [outline, setOutline] = createSignal<Outline | null>(null);

  const raise = (id: WindowId) => {
    if (state.order[state.order.length - 1] === id) return;
    setState((s) => {
      s.order = [...s.order.filter((other) => other !== id), id];
    });
  };

  /** Pointer-down anywhere on the desk: activate the window, and drag it when grabbed by its title bar. */
  const onPointerDown = (event: PointerEvent) => {
    const target = event.target as Element;
    const slot = target.closest<HTMLElement>('[data-window]');
    if (!slot) return;
    const id = slot.dataset.window as WindowId;
    raise(id);

    const grabbed = target.closest('.window-bar') && !target.closest('a, button, select, input');
    if (!grabbed || event.button !== 0 || !window.matchMedia(WIDE).matches) return;
    event.preventDefault();

    const rect = slot.getBoundingClientRect();
    const menuBottom = document.querySelector('.menubar')?.getBoundingClientRect().bottom ?? 0;
    const from = { ...state.offset[id] };
    let delta = { x: 0, y: 0 };
    setOutline({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    document.body.classList.add('dragging');

    const move = (e: PointerEvent) => {
      const left = clamp(rect.left + e.clientX - event.clientX, GRIP - rect.width, window.innerWidth - GRIP);
      const top = clamp(rect.top + e.clientY - event.clientY, menuBottom + 4, window.innerHeight - 40);
      delta = { x: left - rect.left, y: top - rect.top };
      setOutline({ x: left, y: top, w: rect.width, h: rect.height });
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.body.classList.remove('dragging');
      setOutline(null);
      // Like the old desktop: the window stays put while the outline moves, then jumps on release.
      if (Math.abs(delta.x) + Math.abs(delta.y) > 2) {
        setState((s) => {
          s.offset[id] = { x: from.x + delta.x, y: from.y + delta.y };
        });
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  /** "Clean Up": every window back to its place, in the original stacking order. */
  const cleanUp = () =>
    setState((s) => {
      for (const id of IDS) s.offset[id] = { x: 0, y: 0 };
      s.order = [...IDS];
    });

  return {
    onPointerDown,
    cleanUp,
    outline,
    offset: (id: WindowId) => state.offset[id],
    zIndex: (id: WindowId) => state.order.indexOf(id) + 1,
    isActive: (id: WindowId) => state.order[state.order.length - 1] === id,
    moved: () => IDS.some((id) => state.offset[id].x !== 0 || state.offset[id].y !== 0),
  };
}

export type Desktop = ReturnType<typeof createDesktop>;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
