"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuArrowRight, LuDownload, LuShare2 } from "react-icons/lu";
import { ALL_PRIZES, type PrizeId } from "@/data/collectibles";
import { PROFILE } from "@/data/profile";
import { openSection } from "@/game/engine";
import { useGame } from "@/game/store";
import { CollectibleIcon } from "@/components/ui/CollectibleIcon";
import { Label, Panel, Reveal } from "./shared";

const WIDTH = 1080;
const HEIGHT = 1350;
const DISPLAY = '"Unbounded Variable", sans-serif';
const BODY = '"Instrument Sans Variable", sans-serif';
const PIXEL = '"Silkscreen", monospace';
const DEFAULT_NAME = "PLAYER ONE";

type Icons = Partial<Record<PrizeId, HTMLImageElement>>;

/** A short code derived from the name, so each card feels like its own. */
function cardCode(name: string) {
  let hash = 7;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash.toString(16).toUpperCase().padStart(6, "0").slice(-6);
}

function drawCard(ctx: CanvasRenderingContext2D, name: string, date: string, icons: Icons) {
  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, "#14103a");
  background.addColorStop(0.55, "#0d0b26");
  background.addColorStop(1, "#0a1a3a");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(WIDTH / 2, 400, 40, WIDTH / 2, 400, 620);
  glow.addColorStop(0, "rgba(127,107,255,.5)");
  glow.addColorStop(1, "rgba(127,107,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const frame = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  frame.addColorStop(0, "#9ff0ff");
  frame.addColorStop(0.5, "#c7b5ff");
  frame.addColorStop(1, "#ffd166");
  ctx.strokeStyle = frame;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(36, 36, WIDTH - 72, HEIGHT - 72, 44);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `400 34px ${PIXEL}`;
  ctx.fillStyle = "#9ff0ff";
  ctx.fillText("RWS ARCADE", WIDTH / 2, 120);

  if (icons.secret) {
    ctx.shadowColor = "#9ff0ff";
    ctx.shadowBlur = 50;
    ctx.drawImage(icons.secret, WIDTH / 2 - 150, 170, 300, 300);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "#f4ecdc";
  ctx.font = `800 84px ${DISPLAY}`;
  ctx.fillText("MACHINE", WIDTH / 2, 552, WIDTH - 180);
  ctx.fillText("CLEARED", WIDTH / 2, 650, WIDTH - 180);

  ctx.font = `500 36px ${BODY}`;
  ctx.fillStyle = "rgba(244,236,220,.74)";
  ctx.fillText("All 6 collectibles and the secret prize, claimed by", WIDTH / 2, 752, WIDTH - 180);

  ctx.font = `700 66px ${DISPLAY}`;
  ctx.fillStyle = "#ffd166";
  ctx.shadowColor = "rgba(255,209,102,.6)";
  ctx.shadowBlur = 24;
  ctx.fillText(name.trim() || DEFAULT_NAME, WIDTH / 2, 842, WIDTH - 180);
  ctx.shadowBlur = 0;

  const row = ALL_PRIZES.filter((p) => p.id !== "secret");
  const size = 104;
  const gap = 28;
  const start = (WIDTH - (row.length * size + (row.length - 1) * gap)) / 2;
  row.forEach((prize, i) => {
    const x = start + i * (size + gap);
    ctx.fillStyle = "rgba(255,255,255,.07)";
    ctx.beginPath();
    ctx.roundRect(x, 940, size, size, 22);
    ctx.fill();
    const icon = icons[prize.id];
    if (icon) ctx.drawImage(icon, x + 14, 954, size - 28, size - 28);
  });

  ctx.font = `400 28px ${PIXEL}`;
  ctx.fillStyle = "#c7b5ff";
  ctx.fillText(`CARD ${cardCode(name)}  /  ${date}`, WIDTH / 2, 1118);

  ctx.font = `600 34px ${BODY}`;
  ctx.fillStyle = "#f4ecdc";
  ctx.fillText(`${PROFILE.name}'s Claw Machine Portfolio`, WIDTH / 2, 1200, WIDTH - 180);
  ctx.font = `500 28px ${BODY}`;
  ctx.fillStyle = "rgba(244,236,220,.62)";
  ctx.fillText(window.location.host, WIDTH / 2, 1250, WIDTH - 180);
}

/** Turns the inline SVG icons into images the canvas can paint. */
function loadIcons(root: HTMLElement) {
  const entries = [...root.querySelectorAll<SVGSVGElement>("svg[data-prize]")].map(
    (svg) =>
      new Promise<[PrizeId, HTMLImageElement]>((resolve, reject) => {
        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute("width", "512");
        clone.setAttribute("height", "512");
        const image = new Image();
        image.onload = () => resolve([svg.dataset.prize as PrizeId, image]);
        image.onerror = reject;
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
      }),
  );
  return Promise.all(entries).then((list) => Object.fromEntries(list) as Icons);
}

export function MachineCleared() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const iconRoot = useRef<HTMLDivElement>(null);
  const name = useGame((s) => s.playerName);
  const set = useGame((s) => s.set);
  const [icons, setIcons] = useState<Icons | null>(null);
  const [notice, setNotice] = useState("");
  const [date] = useState(() =>
    new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
  );

  useEffect(() => {
    let alive = true;
    const fonts = [`800 84px ${DISPLAY}`, `500 36px ${BODY}`, `400 34px ${PIXEL}`].map((font) => document.fonts.load(font));
    Promise.all([loadIcons(iconRoot.current!), ...fonts])
      .then(([loaded]) => {
        if (alive) setIcons(loaded);
      })
      .catch(() => {
        if (alive) setIcons({});
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx && icons) drawCard(ctx, name, date, icons);
  }, [name, date, icons]);

  const toBlob = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        if (canvas.current) canvas.current.toBlob(resolve, "image/png");
        else resolve(null);
      }),
    [],
  );

  const fileName = `machine-cleared-${(name.trim() || "player-one").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  const download = async () => {
    const blob = await toBlob();
    if (!blob) {
      setNotice("The card couldn't be created. Please try again.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Card downloaded.");
  };

  const share = async () => {
    const url = window.location.origin;
    const text = `I cleared ${PROFILE.name}'s claw machine portfolio!`;
    const blob = await toBlob();
    const file = blob ? new File([blob], fileName, { type: "image/png" }) : null;

    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setNotice("Link copied to clipboard.");
    } catch (error) {
      // Closing the share sheet is a choice, not a failure.
      if ((error as Error).name !== "AbortError") setNotice("Sharing isn't available here. Try downloading the card.");
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <Reveal>
        <canvas
          ref={canvas}
          width={WIDTH}
          height={HEIGHT}
          role="img"
          aria-label={`Machine Cleared card for ${name.trim() || DEFAULT_NAME}`}
          className="w-full rounded-2xl shadow-[0_30px_70px_-30px_var(--accent)]"
        />
      </Reveal>

      <div className="min-w-0 space-y-5">
        <Reveal delay={0.08}>
          <p className="text-xl font-medium leading-snug text-cream sm:text-2xl">
            You opened every collectible in the machine. Thank you for taking the time to explore my work.
          </p>
          <p className="mt-3 leading-relaxed text-cream/75">
            This card is yours. Put your name on it and keep it, or send it to someone who would enjoy playing too.
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <Panel>
            <Label>YOUR CARD</Label>
            <label className="block space-y-1.5 text-sm font-medium text-cream/85">
              Your name
              <input
                value={name}
                onChange={(event) => set({ playerName: event.target.value })}
                maxLength={24}
                placeholder={DEFAULT_NAME}
                autoComplete="off"
                className="w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-base text-cream outline-none transition placeholder:text-cream/40 focus:border-[var(--accent)] sm:text-sm"
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={download}
                disabled={!icons}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-50"
              >
                <LuDownload className="size-4" /> Download card
              </button>
              <button
                type="button"
                onClick={share}
                disabled={!icons}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-semibold text-cream transition hover:border-white/50 disabled:opacity-50"
              >
                <LuShare2 className="size-4" /> Share
              </button>
              <p aria-live="polite" className="text-sm text-cream/75">{notice}</p>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.24}>
          <button
            type="button"
            onClick={() => openSection("contact")}
            className="group flex w-full items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-left transition hover:border-gold"
          >
            <CollectibleIcon id="contact" className="size-11 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-cream">Liked what you saw?</span>
              <span className="block text-sm text-cream/75">Let&apos;s build something together.</span>
            </span>
            <LuArrowRight className="size-5 shrink-0 text-gold transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>
      </div>

      {/* Source artwork for the canvas. Never shown. */}
      <div ref={iconRoot} className="hidden" aria-hidden="true">
        {ALL_PRIZES.map((prize) => (
          <CollectibleIcon key={prize.id} id={prize.id} data-prize={prize.id} />
        ))}
      </div>
    </div>
  );
}
