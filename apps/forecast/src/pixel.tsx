import { createMemo, For } from 'solid-js';

/**
 * Draws a one-bit icon from rows of `#` (ink) and `.` (paper). Runs of ink
 * become rects, so the SVG stays small and every pixel lands on the grid.
 */
export function PixelIcon(props: { art: readonly string[]; scale?: number; label?: string }) {
  const runs = createMemo(() =>
    props.art.flatMap((row, y) => {
      const out: { x: number; y: number; w: number }[] = [];
      let start = -1;
      for (let x = 0; x <= row.length; x++) {
        const ink = row[x] === '#';
        if (ink && start < 0) start = x;
        if (!ink && start >= 0) {
          out.push({ x: start, y, w: x - start });
          start = -1;
        }
      }
      return out;
    }),
  );
  const width = createMemo(() => Math.max(...props.art.map((row) => row.length)));

  return (
    <svg
      class="pixel-icon"
      viewBox={`0 0 ${width()} ${props.art.length}`}
      width={width() * (props.scale ?? 2)}
      height={props.art.length * (props.scale ?? 2)}
      role={props.label ? 'img' : undefined}
      aria-label={props.label}
      aria-hidden={props.label ? undefined : 'true'}
    >
      <For each={runs()}>{(run) => <rect x={run.x} y={run.y} width={run.w} height={1} />}</For>
    </svg>
  );
}

export const ALERT = [
  '.......##.......',
  '......####......',
  '.....##..##.....',
  '.....#....#.....',
  '....##.##.##....',
  '....#..##..#....',
  '...##..##..##...',
  '...#...##...#...',
  '..##...##...##..',
  '..#..........#..',
  '.##....##....##.',
  '.#.....##.....#.',
  '################',
] as const;

// ---------- Weather icons, composed on a 16 x 16 canvas ----------
// In parts, ' ' is transparent, '.' paints paper and '#' paints ink, so a
// cloud's interior hides whatever sits behind it.

const SUN = [
  '.......##.......',
  '.......##.......',
  '..##........##..',
  '..##..####..##..',
  '.....######.....',
  '....########....',
  '##..########..##',
  '##..########..##',
  '....########....',
  '.....######.....',
  '..##..####..##..',
  '..##........##..',
  '.......##.......',
  '.......##.......',
];

const SMALL_SUN = [
  '    #    ',
  ' #     # ',
  '   ###   ',
  '  #####  ',
  '# ##### #',
  '  #####  ',
  '   ###   ',
  ' #     # ',
  '    #    ',
];

const CLOUD = [
  '     ####     ',
  '   ##....##   ',
  ' ###.......#  ',
  '#...........##',
  '#............#',
  '#............#',
  '#............#',
  ' ############ ',
];

function compose(...parts: [readonly string[], number, number][]): string[] {
  const grid = Array.from({ length: 16 }, () => Array<string>(16).fill('.'));
  for (const [art, dx, dy] of parts) {
    art.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch !== ' ' && grid[y + dy]?.[x + dx] !== undefined) grid[y + dy][x + dx] = ch;
      }),
    );
  }
  return grid.map((row) => row.join(''));
}

const RAIN = ['...#...#...#', '..#...#...#.', '.#...#...#..'];
const DRIZZLE = ['.#....#....#', '............', '....#....#..'];
const SNOW = ['.#....#....#', '###..###..##', '.#....#....#'];
const BOLT = ['....###', '...###.', '..#####', '....##.', '...##..', '...#...'];
const FOG = [
  '.##############.',
  '................',
  '####.#######.###',
  '................',
  '..##############',
  '................',
  '.######.#######.',
];

export const WEATHER = {
  clear: compose([SUN, 0, 1]),
  partly: compose([SMALL_SUN, 0, 0], [CLOUD, 2, 6]),
  cloudy: compose([CLOUD, 1, 4]),
  fog: compose([FOG, 0, 4]),
  drizzle: compose([CLOUD, 1, 1], [DRIZZLE, 2, 11]),
  rain: compose([CLOUD, 1, 1], [RAIN, 2, 11]),
  snow: compose([CLOUD, 1, 1], [SNOW, 2, 11]),
  storm: compose([CLOUD, 1, 0], [BOLT, 5, 9]),
} as const;

export type WeatherIcon = keyof typeof WEATHER;
