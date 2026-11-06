"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuExternalLink, LuLock } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { PROJECT_CATEGORIES, PROJECTS, type Project, type ProjectCategory } from "@/data/projects";
import { Label, Reveal, Tag } from "./shared";

function ProjectDetail({ project }: { project: Project }) {
  const longFeatures = project.features.some((feature) => feature.length > 34);
  return (
    <motion.article
      key={project.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28 }}
      className="grid gap-5 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm lg:grid-cols-[1.25fr_1fr] lg:p-4"
    >
      <div className="relative aspect-[16/10] self-start overflow-hidden rounded-xl bg-navy">
        <Image src={project.image} alt={`Screenshot of ${project.title}`} fill loading="eager" sizes="(min-width: 1024px) 620px, 95vw" className="object-cover object-top" />
      </div>
      <div className="flex min-w-0 flex-col gap-4 p-1">
        <div>
          <p className="pixel mb-1 text-[11px] text-[var(--accent)]">{project.category.toUpperCase()}</p>
          <h2 className="font-display text-xl font-bold leading-tight text-cream sm:text-2xl">{project.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-cream/80">{project.description}</p>
        </div>
        <div>
          <Label>KEY FEATURES</Label>
          <ul className={`grid gap-x-3 gap-y-1 text-sm text-cream/80 ${longFeatures ? "" : "sm:grid-cols-2"}`}>
            {project.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="mt-[.45rem] size-1.5 shrink-0 rounded-sm bg-[var(--accent)]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 text-sm font-semibold text-ink transition hover:brightness-110">
              <LuExternalLink className="size-4" /> Live demo
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 px-3.5 text-sm font-semibold text-cream transition hover:border-white/50">
              <SiGithub className="size-4" /> Repository
            </a>
          )}
          {project.note && (
            <p className="flex items-center gap-2 text-sm text-cream/65">
              <LuLock className="size-4 shrink-0" /> {project.note}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function Work() {
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const list = useMemo(
    () => (category === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === category)),
    [category],
  );
  const [selectedId, setSelectedId] = useState(PROJECTS[0].id);
  const selected = list.find((p) => p.id === selectedId) ?? list[0];
  const detail = useRef<HTMLDivElement>(null);

  const select = (id: string) => {
    setSelectedId(id);
    // The list sits below the detail, so bring the newly selected project into view.
    detail.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-5">
      <Reveal className="flex flex-wrap gap-1.5">
        {PROJECT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`h-9 rounded-lg px-3.5 text-sm font-semibold transition ${
              category === c.id ? "bg-[var(--accent)] text-ink" : "border border-white/15 bg-black/20 text-cream/80 hover:text-cream"
            }`}
          >
            {c.label}
          </button>
        ))}
      </Reveal>

      <Reveal delay={0.08}>
        <div ref={detail} className="scroll-mt-20">
          <AnimatePresence mode="wait">
            <ProjectDetail key={selected.id} project={selected} />
          </AnimatePresence>
        </div>
      </Reveal>

      <Reveal delay={0.16}>
        <div role="list" aria-label="Projects" className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {list.map((project) => {
            const isActive = project.id === selected.id;
            return (
              <button
                key={project.id}
                type="button"
                role="listitem"
                aria-current={isActive}
                onClick={() => select(project.id)}
                className={`group w-44 shrink-0 snap-start overflow-hidden rounded-xl border text-left transition sm:w-auto ${
                  isActive ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-white/10 bg-black/25 hover:border-white/30"
                }`}
              >
                <span className="relative block aspect-[16/9] overflow-hidden bg-navy">
                  <Image src={project.image} alt="" fill sizes="220px" className="object-cover object-top transition-transform duration-300 group-hover:scale-105" />
                </span>
                <span className="block truncate px-2.5 py-2 text-[13px] font-semibold text-cream">{project.title}</span>
              </button>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
