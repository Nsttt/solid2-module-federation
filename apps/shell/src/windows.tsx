import { createMemo, Errored, For, Loading } from 'solid-js';
import { Markdown, parsePost } from './markdown';
import { DOCUMENT, FOLDER, HOURGLASS, PixelIcon } from './pixel';

export const REPO = 'https://github.com/Nsttt/solid2-module-federation';
export const RELEASE_POST = 'https://www.solidjs.com/blog/solid-2-0-the-long-hold/';
export const ZEPHYR = 'https://zephyr-cloud.io/';

const REPO_API = 'https://api.github.com/repos/Nsttt/solid2-module-federation';
/** The post's own source in the Solid website repository, fetched by the visitor's browser. */
const POST_SOURCE = 'https://raw.githubusercontent.com/solidjs/solid-site/main/src/routes/blog/solid-2-0-the-long-hold.mdx';
const POST_SOURCE_PAGE = 'https://github.com/solidjs/solid-site/blob/main/src/routes/blog/solid-2-0-the-long-hold.mdx';

async function fetchPost() {
  const res = await fetch(POST_SOURCE);
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  return parsePost(await res.text(), RELEASE_POST);
}

type Entry = { name: string; type: 'file' | 'dir'; html_url: string };
type RepoInfo = { description: string | null; default_branch: string; stargazers_count: number };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(res.status === 403 ? 'GitHub rate limit reached' : `GitHub responded ${res.status}`);
  return (await res.json()) as T;
}

async function fetchRepo() {
  const [info, entries] = await Promise.all([getJson<RepoInfo>(REPO_API), getJson<Entry[]>(`${REPO_API}/contents`)]);
  // Folders first, like a Finder window sorted by kind.
  const items = [...entries].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
  return { ...info, items };
}

/** A small wait inside one window, so opening it never touches the page's main boundary. */
function Opening(props: { what: string }) {
  return (
    <div class="window-body opening">
      <PixelIcon art={HOURGLASS} scale={3} />
      <span>Opening {props.what}…</span>
    </div>
  );
}

/** The repository as a Finder window: its real top-level contents, live from GitHub's public API. */
export function RepoContents() {
  const repo = createMemo(() => fetchRepo());

  return (
    <Errored
      fallback={(error) => (
        <div class="window-body">
          <p class="window-note">
            Couldn't list the repository ({error() instanceof Error ? (error() as Error).message : String(error())}).
          </p>
          <a href={REPO} target="_blank" rel="noopener">
            Open it on GitHub
          </a>
        </div>
      )}
    >
      <Loading fallback={<Opening what="the repository" />}>
        <div class="window-info">
          <span class="tabular">{repo().items.length} items</span>
          <span class="host">github.com/Nsttt</span>
        </div>
        <div class="window-body">
          <p class="window-note">{repo().description}</p>
          <ul class="finder">
            <For each={repo().items}>
              {(item) => (
                <li>
                  <a href={item.html_url} target="_blank" rel="noopener">
                    <PixelIcon art={item.type === 'dir' ? FOLDER : DOCUMENT} scale={2} />
                    <span>{item.name}</span>
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
        <footer class="window-status">
          <span class="tabular">
            {repo().default_branch} · {repo().stargazers_count} {repo().stargazers_count === 1 ? 'star' : 'stars'}
          </span>
          <a href={REPO} target="_blank" rel="noopener">
            Open on GitHub
          </a>
        </footer>
      </Loading>
    </Errored>
  );
}

/**
 * The release post itself. solidjs.com refuses to be framed, so the window
 * renders the post from its public source in the Solid website repository,
 * with its byline and a link to the original. If that source can't be
 * reached, it falls back to the post's outline.
 */
export function PostContents() {
  const post = createMemo(() => fetchPost());

  return (
    <Errored fallback={<PostOutline />}>
      <Loading fallback={<Opening what="the post" />}>
        <div class="window-info">
          <span>Rendered from the post's source</span>
          <span class="host">solidjs/solid-site</span>
        </div>
        <article class="window-body post post-scroll">
          <h3 class="post-title">{post().meta.title}</h3>
          <p class="post-byline">
            {post().meta.author} · {formatDate(post().meta.date)}
          </p>
          <Markdown blocks={post().blocks} />
        </article>
        <footer class="window-status">
          <a href={POST_SOURCE_PAGE} target="_blank" rel="noopener">
            Source
          </a>
          <a href={RELEASE_POST} target="_blank" rel="noopener">
            Read on solidjs.com
          </a>
        </footer>
      </Loading>
    </Errored>
  );
}

function formatDate(date: string | undefined) {
  if (!date) return '';
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Fallback when the source can't be fetched: the post's outline and a link to read it. */
function PostOutline() {
  return (
    <>
      <div class="window-info">
        <span>Couldn't load the post's source</span>
        <span class="host">solidjs.com</span>
      </div>
      <div class="window-body post">
        <h3 class="post-title">Solid 2.0 - The Long Hold</h3>
        <p class="post-byline">Ryan Carniato · November 16, 2026 · 8 min read</p>
        <p>
          Solid 2.0 reaches stable after five years: async in the reactive graph, server functions, diagnostics
          built for agents, and a smaller API.
        </p>
        <ol class="post-outline">
          <li>Async Graph</li>
          <li>Built to Be Written by Agents</li>
          <li>One Framework for All</li>
          <li>Less is More</li>
          <li>The Road Here</li>
        </ol>
      </div>
      <footer class="window-status">
        <span>The post this demo is built on</span>
        <a href={RELEASE_POST} target="_blank" rel="noopener">
          Read the post
        </a>
      </footer>
    </>
  );
}

/** Zephyr Cloud allows framing, so this one is the real site. */
export function ZephyrContents() {
  return (
    <>
      <div class="window-info">
        <span>Where these three bundles are deployed</span>
        <span class="host">zephyr-cloud.io</span>
      </div>
      <iframe class="frame" src={ZEPHYR} title="Zephyr Cloud" />
    </>
  );
}
