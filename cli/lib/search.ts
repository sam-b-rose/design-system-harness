import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { listComponents } from "./components";
import type { TextResult } from "./format";
import { fromRoot, GENERATED_DIR } from "./paths";

interface Section {
  file: string;
  title: string;
  heading: string;
  lines: string[];
}

export interface SearchHit {
  file: string;
  title: string;
  heading: string;
  score: number;
  snippet: string;
}

const TITLE_WEIGHT = 5;
const HEADING_WEIGHT = 3;
const MAX_RESULTS = 8;
const SNIPPET_LENGTH = 160;

function searchableFiles(): string[] {
  const dir = GENERATED_DIR;
  const componentsDir = fromRoot(dir, "components");
  const components = existsSync(componentsDir)
    ? readdirSync(componentsDir).sort().map((file) => `${dir}/components/${file}`)
    : [];
  return [...components, `${dir}/llms-tokens.txt`, `${dir}/llms.txt`].filter((file) => existsSync(fromRoot(file)));
}

function readSections(file: string): Section[] {
  const sections: Section[] = [];
  let title = basename(file);
  let current: Section | undefined;
  let inCodeFence = false;

  for (const line of readFileSync(fromRoot(file), "utf8").split("\n")) {
    if (line.startsWith("```")) inCodeFence = !inCodeFence;
    const heading = inCodeFence ? null : line.match(/^(#{1,3}) (.+)$/);
    if (heading?.[1] === "#") title = heading[2];
    if (heading) {
      current = { file, title, heading: heading[2], lines: [] };
      sections.push(current);
    } else if (current && line.trim() && !line.startsWith("<!--")) {
      current.lines.push(line);
    }
  }
  return sections;
}

function countOccurrences(text: string, term: string): number {
  return text.toLowerCase().split(term).length - 1;
}

export function searchDocs(query: string): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return searchableFiles()
    .flatMap(readSections)
    .map((section): SearchHit => {
      const body = section.lines.join("\n");
      const score = terms.reduce(
        (total, term) =>
          total +
          TITLE_WEIGHT * countOccurrences(section.title, term) +
          HEADING_WEIGHT * countOccurrences(section.heading, term) +
          countOccurrences(body, term),
        0,
      );
      const matchingLine = section.lines.find((line) => terms.some((term) => line.toLowerCase().includes(term)));
      const snippet = (matchingLine ?? section.lines[0] ?? "").trim().slice(0, SNIPPET_LENGTH);
      return { file: section.file, title: section.title, heading: section.heading, score, snippet };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file) || a.heading.localeCompare(b.heading))
    .slice(0, MAX_RESULTS);
}

export function formatSearch(query: string): TextResult {
  const hits = searchDocs(query);
  if (hits.length === 0) {
    return {
      ok: false,
      message: `No docs match "${query}". List what exists with: ds exports`,
    };
  }
  const components = listComponents();
  const blocks = hits.map((hit, index) => {
    const location = hit.title === hit.heading ? hit.title : `${hit.title} > ${hit.heading}`;
    const next = components.includes(hit.title) ? `\n   read: ds docs get ${hit.title}` : "";
    return `${index + 1}. ${location}  (${hit.file})\n   ${hit.snippet}${next}`;
  });
  return { ok: true, text: blocks.join("\n\n") };
}
