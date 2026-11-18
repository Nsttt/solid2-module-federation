import { createStore } from 'solid-js';

export type FrameId = 'places-frame' | 'forecast-frame';
export type WindowId = 'shell' | 'places' | 'forecast' | FrameId;
type Point = { x: number; y: number };

const IDS: WindowId[] = ['shell', 'forecast', 'places', 'places-frame', 'forecast-frame'];
const START_ORDER: WindowId[] = ['shell', 'forecast', 'places'];
/** How much of a title bar must stay on screen, so a window can always be grabbed again. */
const GRIP = 96;
/** Dragging is a desktop affordance; on narrow screens the windows stack and the page scrolls. */
const WIDE = '(min-width: 901px)';

/**
 * The shell is the host, so it owns the desktop: where each window sits, which
 * one is in front, which windows are open, and the drag. The remotes
 * render their windows as usual and never know they can be moved.
 */
export function createDesktop() {
  const [state, setState] = createStore({
    offset: Object.fromEntries(IDS.map((id) => [id, { x: 0, y: 0 }])) as Record<WindowId, Point>,
    // Back to front; the last one is the active window. Closed windows are not in it.
    order: [...START_ORDER],
  });

  const front = () => state.order[state.order.length - 1];

  const raise = (id: WindowId) => {
    if (front() === id) return;
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
    document.body.classList.add('dragging');

    // The window follows the pointer directly; the store learns where it landed on release.
    const move = (e: PointerEvent) => {
      const left = clamp(rect.left + e.clientX - event.clientX, GRIP - rect.width, window.innerWidth - GRIP);
      const top = clamp(rect.top + e.clientY - event.clientY, menuBottom + 4, window.innerHeight - 40);
      delta = { x: left - rect.left, y: top - rect.top };
      slot.style.transform = `translate(${from.x + delta.x}px, ${from.y + delta.y}px)`;
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.body.classList.remove('dragging');
      setState((s) => {
        s.offset[id] = { x: from.x + delta.x, y: from.y + delta.y };
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  /** Open a window, or bring it to the front if it is already open. */
  const open = (id: WindowId) => raise(id);

  /** Close a window. Federated windows only hide (their state lives on); iframes unmount. */
  const close = (id: WindowId) =>
    setState((s) => {
      s.order = s.order.filter((other) => other !== id);
      s.offset[id] = { x: 0, y: 0 };
    });

  /** "Clean Up": every window back to its place, in the original stacking order. Open windows stay open. */
  const cleanUp = () =>
    setState((s) => {
      for (const id of IDS) s.offset[id] = { x: 0, y: 0 };
      s.order = [...START_ORDER, ...s.order.filter((id) => !START_ORDER.includes(id))];
    });

  return {
    onPointerDown,
    open,
    close,
    cleanUp,
    isOpen: (id: WindowId) => state.order.includes(id),
    offset: (id: WindowId) => state.offset[id],
    zIndex: (id: WindowId) => state.order.indexOf(id) + 1,
    isActive: (id: WindowId) => front() === id,
    moved: () => IDS.some((id) => state.offset[id].x !== 0 || state.offset[id].y !== 0),
  };
}

export type Desktop = ReturnType<typeof createDesktop>;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
