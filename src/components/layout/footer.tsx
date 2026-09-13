import { profile } from "@/content/profile";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="relative border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32 lg:px-16">
        <p className="eyebrow">Contact</p>
        <h2 className="display mt-6 text-[clamp(2.4rem,7vw,6.5rem)]">
          Got a problem
          <br />
          with a scoreboard?
        </h2>
        <a
          href={`mailto:${profile.email}`}
          className="link-underline mt-10 inline-block font-mono text-[clamp(1rem,2.4vw,1.6rem)] text-accent"
        >
          {profile.email}
        </a>
        <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            <a className="link-underline hover:text-text" href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="link-underline hover:text-text" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="link-underline hover:text-text" href="/resume">
              Resume
            </a>
            <a
              className="link-underline hover:text-text"
              href="https://github.com/abk999-cmyk/personal-website"
              target="_blank"
              rel="noreferrer"
            >
              Source
            </a>
          </nav>
          <p className="font-mono text-xs">
            © {year} {profile.name} · {profile.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
