"use client";

import { useState } from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import { LuCheck, LuCopy, LuMail, LuSend } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { PROFILE } from "@/data/profile";
import { Label, Panel, Reveal } from "./shared";

type Status = "idle" | "sending" | "sent" | "mail-app" | "error";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-base text-cream outline-none transition placeholder:text-cream/40 focus:border-[var(--accent)] sm:text-sm";

function ContactLink({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3 transition hover:border-[var(--accent)]/70"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs text-cream/60">{label}</span>
        <span className="block truncate text-sm font-semibold text-cream">{value}</span>
      </span>
    </a>
  );
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.status === 422) {
        setStatus("error");
        return;
      }
      const result: { ok?: boolean } = await response.json();
      if (result.ok) {
        form.reset();
        setStatus("sent");
        return;
      }
    } catch {
      // Network failure: use the mail app below.
    }

    const subject = encodeURIComponent(`Portfolio message from ${data.name}`);
    const body = encodeURIComponent(`${data.message}\n\nFrom: ${data.name} <${data.email}>`);
    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
    setStatus("mail-app");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <Reveal className="space-y-4">
        <p className="text-xl font-medium leading-snug text-cream sm:text-2xl">
          Have an internal system to build, a product idea, or a role that fits? I would love to hear about it.
        </p>
        <p className="leading-relaxed text-cream/75">
          I work across Laravel, Next.js, and MySQL, and I enjoy projects where careful engineering meets a little play.
        </p>
        <div className="space-y-2.5 pt-1">
          <div className="relative">
            <ContactLink href={`mailto:${PROFILE.email}`} icon={<LuMail className="size-5" />} label="Email" value={PROFILE.email} />
            <button
              type="button"
              onClick={copyEmail}
              aria-label={copied ? "Email copied" : "Copy email address"}
              className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg bg-black/40 text-cream/75 hover:text-[var(--accent)]"
            >
              {copied ? <LuCheck className="size-4 text-mint" /> : <LuCopy className="size-4" />}
            </button>
          </div>
          <ContactLink href={PROFILE.github} icon={<SiGithub className="size-5" />} label="GitHub" value={PROFILE.githubHandle} />
          <ContactLink href={PROFILE.linkedin} icon={<FaLinkedinIn className="size-5" />} label="LinkedIn" value={PROFILE.linkedinHandle} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Panel className="border-[var(--accent)]/30">
          <Label>SEND A MESSAGE</Label>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm font-medium text-cream/85">
                Name
                <input name="name" required maxLength={120} autoComplete="name" className={inputClass} />
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-cream/85">
                Email
                <input name="email" type="email" required maxLength={200} autoComplete="email" className={inputClass} />
              </label>
            </div>
            <label className="block space-y-1.5 text-sm font-medium text-cream/85">
              Message
              <textarea name="message" required minLength={10} maxLength={5000} rows={6} className={`${inputClass} resize-y`} />
            </label>
            {/* Hidden from people, tempting to bots. */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-ink shadow-[0_0_30px_-8px_var(--accent)] transition hover:brightness-110 disabled:opacity-60"
              >
                <LuSend className="size-4" /> {status === "sending" ? "Sending..." : "Send message"}
              </button>
              <p aria-live="polite" className="text-sm text-cream/80">
                {status === "sent" && "Message sent. I'll reply soon."}
                {status === "mail-app" && "Your mail app should open with this message ready to send."}
                {status === "error" && "Please check your name, email, and message."}
              </p>
            </div>
          </form>
        </Panel>
      </Reveal>
    </div>
  );
}
