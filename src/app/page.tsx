import Hero from "@/components/Hero";
import About from "@/components/About";
import Background from "@/components/Background";
import ProjectGrid from "@/components/ProjectGrid";
import BlogPreview from "@/components/BlogPreview";
import Links from "@/components/Links";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Background />
      <ProjectGrid />
      <BlogPreview />
      <Links />
    </>
  );
}
