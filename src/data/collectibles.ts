export type CollectibleId = "who" | "work" | "journey" | "certificates" | "contribution" | "contact";

export type Collectible = {
  id: CollectibleId;
  index: number;
  number: string;
  /** URL hash, so every section can be linked to directly. */
  slug: string;
  title: string;
  object: string;
  tagline: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  /** Section identity. Consumed as CSS variables by the section shell. */
  accent: string;
  accentSoft: string;
  backdrop: string;
};

export const COLLECTIBLES: Collectible[] = [
  {
    id: "who",
    index: 0,
    number: "01",
    slug: "who-am-i",
    title: "Who Am I",
    object: "Mini Dev Figure",
    tagline: "The person behind the machine, and why I build things.",
    rarity: "COMMON",
    accent: "#c7b5ff",
    accentSoft: "#6f58c9",
    backdrop: "#17132f",
  },
  {
    id: "work",
    index: 1,
    number: "02",
    slug: "professional-work",
    title: "Professional Work",
    object: "Mini Laptop",
    tagline: "Enterprise systems in production and products shipped in public.",
    rarity: "EPIC",
    accent: "#8ecbff",
    accentSoft: "#2f6fb5",
    backdrop: "#0c1a33",
  },
  {
    id: "journey",
    index: 2,
    number: "03",
    slug: "career-journey",
    title: "Career Journey",
    object: "Mini Rocket",
    tagline: "From Politeknik Negeri Lampung to a full-time IT developer role.",
    rarity: "RARE",
    accent: "#ff9fb8",
    accentSoft: "#b4476e",
    backdrop: "#1f1029",
  },
  {
    id: "certificates",
    index: 3,
    number: "04",
    slug: "certificates",
    title: "Certificates",
    object: "Trophy",
    tagline: "Fifteen credentials across web, cloud, and AI.",
    rarity: "RARE",
    accent: "#f6e7c8",
    accentSoft: "#a58a54",
    backdrop: "#1b1812",
  },
  {
    id: "contribution",
    index: 4,
    number: "05",
    slug: "contribution-graph",
    title: "Contribution Graph",
    object: "Pixel Cube",
    tagline: "A year of commits, straight from public GitHub data.",
    rarity: "EPIC",
    accent: "#6df0b0",
    accentSoft: "#1f8f63",
    backdrop: "#08201c",
  },
  {
    id: "contact",
    index: 5,
    number: "06",
    slug: "lets-work-together",
    title: "Let's Work Together",
    object: "Golden Capsule",
    tagline: "The rare one. Open it and let's build something.",
    rarity: "LEGENDARY",
    accent: "#ffd166",
    accentSoft: "#c98a1b",
    backdrop: "#1f1706",
  },
];

export const byId = (id: CollectibleId) => COLLECTIBLES.find((c) => c.id === id)!;
export const bySlug = (slug: string) => COLLECTIBLES.find((c) => c.slug === slug);
