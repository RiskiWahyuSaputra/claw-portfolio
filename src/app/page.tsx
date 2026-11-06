import { Experience } from "@/components/Experience";
import { COLLECTIBLES } from "@/data/collectibles";
import { PROFILE } from "@/data/profile";

export default function Home() {
  return (
    <>
      {/* Readable by crawlers and screen readers before any script runs. */}
      <div className="sr-only">
        <h1>{PROFILE.name}</h1>
        <p>{PROFILE.role}. Welcome to My Creative World.</p>
        <p>Explore my journey, projects, skills, and experiences through an interactive claw machine.</p>
        <p>{PROFILE.intro}</p>
        <ul>
          {COLLECTIBLES.map((c) => (
            <li key={c.id}>
              <a href={`#${c.slug}`}>{c.title}</a>: {c.tagline}
            </li>
          ))}
        </ul>
      </div>
      <Experience />
    </>
  );
}
