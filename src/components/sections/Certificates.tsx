"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LuExternalLink, LuX } from "react-icons/lu";
import { CERTIFICATES, ISSUERS, type Certificate } from "@/data/certificates";
import { Reveal } from "./shared";

function CertificateDialog({ certificate, onClose }: { certificate: Certificate | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (certificate && !dialog.current?.open) dialog.current?.showModal();
    if (!certificate && dialog.current?.open) dialog.current.close();
  }, [certificate]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      aria-label={certificate?.title}
      className="m-auto max-h-[92dvh] w-[min(46rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-[#f6e7c8]/30 bg-[#17140e] p-0 text-cream"
    >
      {certificate && (
        <div>
          <div className="relative aspect-[1.41] w-full bg-black/40">
            <Image src={certificate.image} alt={`Certificate: ${certificate.title}`} fill sizes="(min-width: 768px) 736px, 95vw" className="object-contain" />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 p-5">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold leading-snug">{certificate.title}</h2>
              <p className="mt-1 text-sm text-cream/75">
                {certificate.issuer} · Issued {certificate.date}
              </p>
            </div>
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#f6e7c8] px-3.5 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              <LuExternalLink className="size-4" /> Open credential page
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate"
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-lg bg-black/70 text-cream hover:text-[#f6e7c8]"
          >
            <LuX className="size-5" />
          </button>
        </div>
      )}
    </dialog>
  );
}

export function Certificates() {
  const [issuer, setIssuer] = useState("All");
  const [open, setOpen] = useState<Certificate | null>(null);
  const list = issuer === "All" ? CERTIFICATES : CERTIFICATES.filter((c) => c.issuer === issuer);

  return (
    <div className="space-y-5">
      <Reveal className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {ISSUERS.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={issuer === name}
            onClick={() => setIssuer(name)}
            className={`h-9 shrink-0 rounded-lg px-3 text-sm font-semibold transition ${
              issuer === name ? "bg-[var(--accent)] text-ink" : "border border-white/15 bg-black/20 text-cream/80 hover:text-cream"
            }`}
          >
            {name}
          </button>
        ))}
      </Reveal>

      <Reveal delay={0.08} className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((certificate) => (
          <button
            key={certificate.id}
            type="button"
            onClick={() => setOpen(certificate)}
            className="group relative block pb-3 text-left"
          >
            <span className="relative block aspect-[1.41] overflow-hidden rounded-lg border border-[var(--accent)]/20 bg-black/30 transition duration-300 group-hover:-translate-y-1.5 group-hover:border-[var(--accent)]/70 group-hover:shadow-[0_18px_34px_-18px_var(--accent)]">
              <Image src={certificate.image} alt="" fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 95vw" className="object-cover" />
            </span>
            <span className="mt-3 block border-t-2 border-[var(--accent)]/25 pt-2.5">
              <span className="block truncate text-sm font-semibold text-cream">{certificate.title}</span>
              <span className="block text-[13px] text-cream/65">
                {certificate.issuer} · {certificate.date}
              </span>
            </span>
          </button>
        ))}
      </Reveal>

      <CertificateDialog certificate={open} onClose={() => setOpen(null)} />
    </div>
  );
}
