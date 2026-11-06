import type { CollectibleId } from "@/data/collectibles";

const shapes: Record<CollectibleId, React.ReactNode> = {
  who: (
    <>
      <rect x="20" y="33" width="24" height="23" rx="11" fill="#6f58c9" />
      <circle cx="32" cy="23" r="14" fill="#e9bb92" />
      <path d="M18 23a14 14 0 0 1 28 0c-5-5-10-6-14-6s-9 1-14 6Z" fill="#14162e" />
      <circle cx="27" cy="26" r="2" fill="#14162e" />
      <circle cx="37" cy="26" r="2" fill="#14162e" />
      <path d="M16 24a16 16 0 0 1 32 0" fill="none" stroke="#8ecbff" strokeWidth="3" />
      <rect x="13" y="21" width="6" height="10" rx="3" fill="#8ecbff" />
      <rect x="45" y="21" width="6" height="10" rx="3" fill="#8ecbff" />
    </>
  ),
  work: (
    <>
      <rect x="13" y="14" width="38" height="27" rx="3" fill="#b9c6e4" />
      <rect x="16" y="17" width="32" height="21" rx="1.5" fill="#0c1533" />
      <rect x="20" y="22" width="13" height="2.6" fill="#c7b5ff" />
      <rect x="23" y="27" width="18" height="2.6" fill="#8ecbff" />
      <rect x="23" y="32" width="10" height="2.6" fill="#6df0b0" />
      <path d="M8 43h48l-3 6H11Z" fill="#8ea0c9" />
    </>
  ),
  journey: (
    <>
      <path d="M32 6c9 7 12 17 11 34H21C20 23 23 13 32 6Z" fill="#f4ecdc" />
      <path d="M32 6c4 3 7 7 9 12H23c2-5 5-9 9-12Z" fill="#ff7b9c" />
      <circle cx="32" cy="27" r="5" fill="#8ecbff" stroke="#8b90a8" strokeWidth="2" />
      <path d="M21 32 12 46l10-3ZM43 32l9 14-10-3Z" fill="#ff7b9c" />
      <path d="M26 42h12l-6 15Z" fill="#ffb45e" />
    </>
  ),
  certificates: (
    <>
      <path d="M20 9h24v15a12 12 0 0 1-24 0Z" fill="#f6e7c8" />
      <path d="M20 13H10c0 10 4 15 12 17M44 13h10c0 10-4 15-12 17" fill="none" stroke="#f0dfba" strokeWidth="3.5" />
      <rect x="29" y="35" width="6" height="9" fill="#d9c294" />
      <rect x="20" y="44" width="24" height="5" rx="1.5" fill="#d9c294" />
      <rect x="16" y="49" width="32" height="7" rx="2" fill="#2b2560" />
    </>
  ),
  contribution: (
    <>
      <path d="m32 7 21 12v26L32 57 11 45V19Z" fill="#123f33" />
      <path d="m32 7 21 12-21 12-21-12Z" fill="#6df0b0" />
      <path d="M11 19 32 31v26L11 45Z" fill="#28a874" />
      <path d="m32 31 7-4v7l-7 4Zm7 11 7-4v7l-7 4Z" fill="#6df0b0" />
      <path d="m18 30 7 4v7l-7-4Z" fill="#1a6e4f" />
    </>
  ),
  contact: (
    <>
      <circle cx="32" cy="32" r="29" fill="#ffd166" opacity=".16" />
      <path d="M12 32a20 20 0 0 1 40 0Z" fill="#ffc94d" />
      <path d="M12 34h40a20 20 0 0 1-40 0Z" fill="#fff0c7" />
      <rect x="10" y="30.5" width="44" height="4" rx="2" fill="#fff8e3" />
      <path d="m32 15 2.2 5 5.3.5-4 3.5 1.2 5.3-4.7-2.8-4.7 2.8 1.2-5.3-4-3.5 5.3-.5Z" fill="#fff8e3" />
    </>
  ),
};

export function CollectibleIcon({ id, className }: { id: CollectibleId; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {shapes[id]}
    </svg>
  );
}
