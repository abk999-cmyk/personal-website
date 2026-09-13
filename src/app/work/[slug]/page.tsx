import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projects, getProject } from "@/content/projects";
import { studies } from "@/content/work";
import { DemoEmbed } from "@/components/demos/demo-embed";
import { Tag } from "@/components/ui/tag";
import { Arrow } from "@/components/ui/button";
import { Gallery } from "@/components/work/gallery";
import { DeviceMockup } from "@/components/work/device-mockup";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.name, description: p.oneLiner };
}

export default async function WorkPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const Study = studies[slug] ? (await studies[slug]()).default : null;
  const idx = projects.findIndex((x) => x.slug === slug);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  return (
    <article className="mx-auto max-w-[1400px] px-6 pb-24 pt-28 md:px-10 md:pt-36 lg:px-16">
      <Link href="/#work" className="group inline-flex items-center gap-2 font-mono text-[12px] text-muted hover:text-text">
        <Arrow className="rotate-180 group-hover:-translate-x-0.5" /> All work
      </Link>

      <header className="mt-10 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="eyebrow">{p.contextLabel}</p>
          <p className="num mt-2 text-[13px] text-muted">{p.year}</p>
        </div>
        <div className="md:col-span-9">
          <h1 className="display text-[clamp(2.4rem,6vw,5.2rem)]">{p.name}</h1>
          <p className="mt-6 max-w-[60ch] text-xl leading-relaxed text-muted">{p.oneLiner}</p>
        </div>
      </header>

      {p.demo ? (
        <section className="relative mt-14 overflow-hidden rounded-2xl border border-line bg-surface" aria-label="Live demo">
          <div className="relative min-h-[420px] md:min-h-[560px]">
            <DemoEmbed name={p.demo} mode="full" />
          </div>
        </section>
      ) : p.visual === "device" && p.images?.[0] ? (
        <section className="relative mt-14 h-[360px] overflow-hidden rounded-2xl border border-line bg-surface md:h-[620px]" aria-label="Product">
          <DeviceMockup desktop={p.images.find((i) => i.kind === "desktop") ?? p.images[0]} mobile={p.images.find((i) => i.kind === "mobile")} />
        </section>
      ) : null}

      <section className="mt-12 grid gap-8 border-y border-line py-8 md:grid-cols-12">
        {p.metrics ? (
          <dl className="grid grid-cols-3 gap-4 md:col-span-6">
            {p.metrics.map((m) => (
              <div key={m.label}>
                <dd className="num text-2xl text-text md:text-3xl">{m.value}</dd>
                <dt className="mt-1 font-mono text-[10px] uppercase tracking-widest text-dim">{m.label}</dt>
              </div>
            ))}
          </dl>
        ) : (
          <div className="md:col-span-6" />
        )}
        <div className="flex flex-col gap-4 md:col-span-6 md:items-end">
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            {p.stack.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-[12px]">
            {p.repo ? (
              <a href={p.repo} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-text">
                Repository <Arrow />
              </a>
            ) : null}
            {p.live ? (
              <a href={p.live} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-accent">
                Live <Arrow />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="eyebrow">The story</p>
        </div>
        <div className="study md:col-span-8 lg:col-span-7">
          {p.blurb ? <p className="lead">{p.blurb}</p> : null}
          {Study ? <Study /> : null}
        </div>
      </section>

      {p.images && p.images.length > 0 ? (
        <section className="mt-16 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="eyebrow">Screens</p>
          </div>
          <div className="md:col-span-9">
            <Gallery images={p.images} />
          </div>
        </section>
      ) : null}

      <nav className="mt-24 grid gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="More work">
        <Link href={`/work/${prev.slug}`} className="group flex flex-col gap-2 rounded-2xl border border-line p-5 hover:border-line-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-dim">Previous</span>
          <span className="display text-xl">{prev.name}</span>
        </Link>
        <Link href={`/work/${next.slug}`} className="group flex flex-col gap-2 rounded-2xl border border-line p-5 text-right hover:border-line-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-dim">Next</span>
          <span className="display text-xl">{next.name}</span>
        </Link>
      </nav>
    </article>
  );
}
