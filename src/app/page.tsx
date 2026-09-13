import { Hero } from "@/components/sections/hero";
import { Now } from "@/components/sections/now";
import { Work } from "@/components/sections/work";
import { Research } from "@/components/sections/research";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { About } from "@/components/sections/about";

export default function Home() {
  return (
    <>
      <Hero />
      <Now />
      <Work />
      <Research />
      <Experience />
      <Skills />
      <About />
    </>
  );
}
