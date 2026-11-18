import { For, type Element as SolidElement } from 'solid-js';

/**
 * A small markdown renderer for one blog post's MDX source. It covers what the
 * post uses (headings, paragraphs, fenced code, links, inline code, emphasis,
 * lists, blockquotes, rules) and builds Solid elements and text nodes only:
 * no innerHTML, so text from another repository can never inject markup.
 */

type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'strong' | 'em'; children: Inline[] }
  | { kind: 'link'; href: string; children: Inline[] };

export type Block =
  | { kind: 'heading'; level: number; children: Inline[] }
  | { kind: 'paragraph'; children: Inline[] }
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'quote'; children: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'rule' };

export type Post = { meta: Record<string, string>; blocks: Block[] };

/** Splits frontmatter from the body and drops MDX imports and JSX wrapper tags. */
export function parsePost(source: string, base: string): Post {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  const meta: Record<string, string> = {};
  for (const line of (match?.[1] ?? '').split('\n')) {
    const kv = /^(\w+):\s*"?(.*?)"?\s*$/.exec(line);
    if (kv) meta[kv[1]] = kv[2];
  }
  const body = source
    .slice(match ? match[0].length : 0)
    .split('\n')
    .filter((line) => !/^import\s/.test(line) && !/^<\/?[A-Z][\w.]*[^>]*>\s*$/.test(line))
    .join('\n');
  return { meta, blocks: parseBlocks(body, base) };
}

function parseBlocks(body: string, base: string): Block[] {
  const lines = body.split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
    } else if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith('```'); i++) code.push(lines[i]);
      i++;
      blocks.push({ kind: 'code', lang, text: code.join('\n') });
    } else if (/^#{1,6}\s/.test(line)) {
      const level = line.indexOf(' ');
      blocks.push({ kind: 'heading', level, children: parseInline(line.slice(level + 1), base) });
      i++;
    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ kind: 'rule' });
      i++;
    } else if (line.startsWith('>')) {
      const quote: string[] = [];
      for (; i < lines.length && lines[i].startsWith('>'); i++) quote.push(lines[i].replace(/^>\s?/, ''));
      blocks.push({ kind: 'quote', children: parseInline(quote.join(' '), base) });
    } else if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: Inline[][] = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i]); i++) {
        items.push(parseInline(lines[i].replace(/^\s*([-*]|\d+\.)\s/, ''), base));
      }
      blocks.push({ kind: 'list', ordered, items });
    } else {
      const para: string[] = [];
      for (; i < lines.length && lines[i].trim() && !/^(```|#{1,6}\s|>|\s*([-*]|\d+\.)\s)/.test(lines[i]); i++) para.push(lines[i]);
      blocks.push({ kind: 'paragraph', children: parseInline(para.join(' '), base) });
    }
  }
  return blocks;
}

const INLINE = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|(?<![\w*])\*([^*\n]+)\*(?!\*)/g;

function parseInline(text: string, base: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: 'code', text: m[1] });
    else if (m[2] !== undefined) {
      const href = safeHref(m[3], base);
      const children = parseInline(m[2], base);
      out.push(href ? { kind: 'link', href, children } : { kind: 'strong', children });
    } else if (m[4] !== undefined) out.push({ kind: 'strong', children: parseInline(m[4], base) });
    else out.push({ kind: 'em', children: parseInline(m[5], base) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out;
}

/** Only http(s) links survive; relative ones resolve against the post's own site. */
function safeHref(href: string, base: string): string | undefined {
  try {
    const url = new URL(href, base);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/*
 * The parsed post is plain data that never changes once fetched, so it renders
 * with ordinary functions: no reactive control flow, nothing for Solid to track.
 */
function renderInline(node: Inline): SolidElement {
  switch (node.kind) {
    case 'text':
      return node.text;
    case 'code':
      return <code>{node.text}</code>;
    case 'strong':
      return <strong>{node.children.map(renderInline)}</strong>;
    case 'em':
      return <em>{node.children.map(renderInline)}</em>;
    case 'link':
      return (
        <a href={node.href} target="_blank" rel="noopener">
          {node.children.map(renderInline)}
        </a>
      );
  }
}

function renderBlock(block: Block): SolidElement {
  switch (block.kind) {
    case 'heading':
      return <h4 class="md-heading">{block.children.map(renderInline)}</h4>;
    case 'paragraph':
      return <p>{block.children.map(renderInline)}</p>;
    case 'code':
      return (
        <pre class="md-code" data-lang={block.lang || undefined}>
          <code>{block.text}</code>
        </pre>
      );
    case 'quote':
      return <blockquote class="md-quote">{block.children.map(renderInline)}</blockquote>;
    case 'list': {
      const items = block.items.map((item) => <li>{item.map(renderInline)}</li>);
      return block.ordered ? <ol class="md-list">{items}</ol> : <ul class="md-list">{items}</ul>;
    }
    case 'rule':
      return <hr class="md-rule" />;
  }
}

export function Markdown(props: { blocks: Block[] }): SolidElement {
  return <For each={props.blocks}>{(block) => renderBlock(block)}</For>;
}
