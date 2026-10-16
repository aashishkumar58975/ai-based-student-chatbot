import { useState, type ReactNode } from "react";

// Safe Markdown renderer: builds React elements only (no innerHTML), so any HTML
// in the model output is shown as plain text. Links are limited to http(s)/mailto.

function safeHref(raw: string): string | null {
  try {
    const u = new URL(raw);
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\((?:[^()\s]|\([^()\s]*\))+\))|(\*[^*\n]+\*)/g;

function inline(text: string, keyBase = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const tok = m[0];
    const key = `${keyBase}-${n++}`;
    if (m[1]) out.push(<code key={key} className="md-code">{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{inline(tok.slice(2, -2), key)}</strong>);
    else if (m[4]) out.push(<em key={key}>{inline(tok.slice(1, -1), key)}</em>);
    else {
      const close = tok.indexOf("](");
      const label = tok.slice(1, close);
      const href = safeHref(tok.slice(close + 2, -1));
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">{label}</a>
        ) : (
          label
        )
      );
    }
    last = idx + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable: ignore */
    }
  };
  return (
    <div className="md-pre">
      <div className="md-pre-bar">
        <span>{lang || "code"}</span>
        <button type="button" onClick={copy} aria-label="Copy code">{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre tabIndex={0}><code>{code}</code></pre>
    </div>
  );
}

const SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  const isSpecial = (l: string, next?: string) =>
    /^```/.test(l) || /^#{1,6}\s/.test(l) || /^\s*([-*+]|\d+\.)\s+/.test(l) || /^>\s?/.test(l) ||
    /^\s*(-{3,}|\*{3,})\s*$/.test(l) || (l.includes("|") && next !== undefined && SEP.test(next));

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const fence = line.match(/^```\s*([\w+#.-]*)/);
    if (fence) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      blocks.push(<CodeBlock key={k++} code={buf.join("\n")} lang={fence[1]} />);
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const Tag = (h[1].length <= 2 ? "h3" : "h4") as "h3" | "h4";
      blocks.push(<Tag key={k++} className="md-h">{inline(h[2])}</Tag>);
      i++; continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push(<hr key={k++} />); i++; continue; }

    if (line.includes("|") && i + 1 < lines.length && SEP.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(cells(lines[i++]));
      blocks.push(
        <div className="md-table" key={k++}>
          <table>
            <thead><tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
            <tbody>{rows.map((r, a) => <tr key={a}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(<blockquote key={k++}>{inline(buf.join(" "))}</blockquote>);
      continue;
    }
    const li = line.match(/^\s*([-*+]|\d+\.)\s+/);
    if (li) {
      const ordered = /\d/.test(li[1]);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
      const kids = items.map((t, j) => <li key={j}>{inline(t)}</li>);
      blocks.push(ordered ? <ol key={k++}>{kids}</ol> : <ul key={k++}>{kids}</ul>);
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && (buf.length === 0 || !isSpecial(lines[i], lines[i + 1]))) buf.push(lines[i++]);
    blocks.push(
      <p key={k++}>
        {buf.map((t, j) => (
          <span key={j}>{j > 0 && <br />}{inline(t)}</span>
        ))}
      </p>
    );
  }
  return <div className="md">{blocks}</div>;
}
