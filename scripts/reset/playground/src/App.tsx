import type { ComponentType } from "react";

const modules = import.meta.glob<Record<string, ComponentType>>("./pages/*.tsx", { eager: true });

const pages = Object.entries(modules).flatMap(([path, module]) => {
  const name = path.replace("./pages/", "").replace(".tsx", "");
  const Page = module[name];
  return Page ? [{ name, Page }] : [];
});

export function App() {
  const selected = new URLSearchParams(window.location.search).get("page");
  const current = pages.find((page) => page.name === selected);
  if (current) return <current.Page />;

  return (
    <main>
      <h1>Playground</h1>
      {pages.length === 0 ? <p>No pages yet. Create one with: pnpm ds add page home</p> : null}
      {pages.map((page) => (
        <p key={page.name}>
          <a href={`?page=${page.name}`}>{page.name}</a>
        </p>
      ))}
    </main>
  );
}
