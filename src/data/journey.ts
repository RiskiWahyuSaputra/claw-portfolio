export type JourneyKind = "education" | "work";

export type JourneyEntry = {
  period: string;
  title: string;
  org: string;
  orgNote?: string;
  kind: JourneyKind;
  type: string;
  location: string;
  body: string;
  tags: string[];
  current?: boolean;
};

/** Mirrors the previous portfolio's timeline, newest first. */
export const JOURNEY: JourneyEntry[] = [
  {
    period: "Aug 2026 - Present",
    title: "Information Technology Developer",
    org: "BEST Corporation Syariah",
    orgNote: "PT Bandung Eco Sinergi Teknologi",
    kind: "work",
    type: "Full-time",
    location: "Bandung, West Java · On-site",
    body: "Building internal web applications and maintaining systems based on incoming helpdesk tickets, keeping every digital service and operational workflow running optimally and reliably.",
    tags: ["IT Development", "Front-End Design", "Laravel", "React"],
    current: true,
  },
  {
    period: "Feb 2026 - Jul 2026",
    title: "Information Technology Developer",
    org: "BEST Corporation Syariah",
    orgNote: "PT Bandung Eco Sinergi Teknologi",
    kind: "work",
    type: "Apprenticeship",
    location: "Bandung, West Java · On-site",
    body: "Joined the IT team as an apprentice, contributing to internal web application development and day-to-day system maintenance before moving into a full-time role.",
    tags: ["Web Development", "JavaScript", "PHP", "MySQL"],
  },
  {
    period: "Education",
    title: "Department of Information Technology",
    org: "Politeknik Negeri Lampung",
    kind: "education",
    type: "Diploma",
    location: "Bandar Lampung, Lampung",
    body: "Studied software and web development fundamentals, including building a QRIS-based practicum payment application for the department.",
    tags: ["Software Engineering", "Web Programming", "Database"],
  },
];
