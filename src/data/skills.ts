import type { IconType } from "react-icons";
import {
  SiCodeigniter, SiGit, SiGithub, SiJavascript, SiLaravel, SiLinux, SiMysql, SiNextdotjs,
  SiPhp, SiReact, SiTailwindcss, SiTypescript, SiUbuntu,
} from "react-icons/si";
import { TbSql } from "react-icons/tb";

export type Skill = { name: string; icon: IconType; color: string };

export const SKILLS: Skill[] = [
  { name: "JavaScript", icon: SiJavascript, color: "#f7df1e" },
  { name: "TypeScript", icon: SiTypescript, color: "#5a9fe0" },
  { name: "PHP", icon: SiPhp, color: "#a3a9e8" },
  { name: "SQL", icon: TbSql, color: "#8ecbff" },
  { name: "Next.js", icon: SiNextdotjs, color: "#f4f1e8" },
  { name: "React", icon: SiReact, color: "#61dafb" },
  { name: "Laravel", icon: SiLaravel, color: "#ff5a4f" },
  { name: "CodeIgniter", icon: SiCodeigniter, color: "#ef6c3e" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38bdf8" },
  { name: "Git", icon: SiGit, color: "#f05033" },
  { name: "GitHub", icon: SiGithub, color: "#f4f1e8" },
  { name: "MySQL", icon: SiMysql, color: "#6fb1dc" },
  { name: "Linux", icon: SiLinux, color: "#fcc624" },
  { name: "Ubuntu", icon: SiUbuntu, color: "#f0703f" },
];
