import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/not-found")({
  head: () => ({
    meta: [
      { title: "404 — page not found" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <main className="min-h-screen w-full bg-black flex items-center justify-center">
      <h1 className="text-white text-sm tracking-[0.2em] lowercase font-light">
        404 — page not found
      </h1>
    </main>
  );
}
