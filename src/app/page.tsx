export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section className="w-full rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel)] p-8 shadow-[0_20px_70px_rgba(17,24,39,0.08)] backdrop-blur md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
          Reloop Platform
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
          A clean Next.js foundation for the platform.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
          The project is scaffolded with the App Router, Tailwind CSS, Vitest,
          and the AWS SDK dependencies you listed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
          <span className="rounded-full bg-[var(--accent)] px-4 py-2 text-white">
            Next.js 14.2
          </span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-700">
            Tailwind CSS 4
          </span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-slate-700">
            Vitest ready
          </span>
        </div>
      </section>
    </main>
  );
}