import * as THREE from "three";

const DISPLAY = '"Unbounded Variable", sans-serif';
const BODY = '"Instrument Sans Variable", sans-serif';
const PIXEL = '"Silkscreen", monospace';

function canvas(width: number, height: number) {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return { el, ctx: el.getContext("2d")! };
}

function toTexture(el: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Fonts must be ready before anything is drawn onto a canvas. */
export async function loadTextureFonts() {
  await Promise.all([
    document.fonts.load(`800 100px ${DISPLAY}`),
    document.fonts.load(`500 40px ${BODY}`),
    document.fonts.load(`400 40px ${PIXEL}`),
  ]).catch(() => undefined);
}

export function marqueeTexture() {
  const { el, ctx } = canvas(2048, 560);
  const w = el.width;
  const h = el.height;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0d1233");
  bg.addColorStop(0.55, "#191447");
  bg.addColorStop(1, "#0b1a3d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft light falling on the sign from behind the lettering.
  const glow = ctx.createRadialGradient(w / 2, h * 0.34, 20, w / 2, h * 0.34, w * 0.5);
  glow.addColorStop(0, "rgba(160,130,255,.34)");
  glow.addColorStop(1, "rgba(160,130,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `800 138px ${DISPLAY}`;
  const name = ctx.createLinearGradient(0, 70, 0, 230);
  name.addColorStop(0, "#fff8e8");
  name.addColorStop(1, "#b9d8ff");
  ctx.shadowColor = "rgba(142,203,255,.85)";
  ctx.shadowBlur = 34;
  ctx.fillStyle = name;
  ctx.fillText("RISKI WAHYU SAPUTRA", w / 2, 170, w - 190);

  ctx.shadowColor = "rgba(199,181,255,.8)";
  ctx.shadowBlur = 18;
  ctx.font = `600 66px ${DISPLAY}`;
  ctx.fillStyle = "#d9ccff";
  ctx.fillText("Welcome to My Creative World", w / 2, 322, w - 260);

  ctx.shadowBlur = 0;
  ctx.font = `500 45px ${BODY}`;
  ctx.fillStyle = "rgba(244,241,232,.82)";
  ctx.fillText(
    "Explore my journey, projects, skills, and experiences through an interactive claw machine.",
    w / 2,
    432,
    w - 240,
  );
  return toTexture(el);
}

export function backWallTexture() {
  const { el, ctx } = canvas(1024, 768);
  const bg = ctx.createLinearGradient(0, 0, 0, el.height);
  bg.addColorStop(0, "#1a1a55");
  bg.addColorStop(0.6, "#121138");
  bg.addColorStop(1, "#0a0b25");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, el.width, el.height);

  ctx.strokeStyle = "rgba(142,203,255,.09)";
  ctx.lineWidth = 2;
  for (let x = 0; x <= el.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, el.height);
    ctx.stroke();
  }
  for (let y = 0; y <= el.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(el.width, y);
    ctx.stroke();
  }
  const glow = ctx.createRadialGradient(620, 280, 10, 620, 280, 520);
  glow.addColorStop(0, "rgba(150,110,255,.42)");
  glow.addColorStop(1, "rgba(150,110,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, el.width, el.height);
  return toTexture(el);
}

export function glowTexture() {
  const { el, ctx } = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.28, "rgba(255,255,255,.42)");
  g.addColorStop(0.65, "rgba(255,255,255,.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(el);
}

/** A diagonal reflection streak, drawn across the front glass. */
export function glassStreakTexture() {
  const { el, ctx } = canvas(1024, 768);
  ctx.clearRect(0, 0, el.width, el.height);
  ctx.translate(el.width / 2, el.height / 2);
  ctx.rotate(0.42);
  const bands = [
    { x: -420, w: 150, a: 0.13 },
    { x: -240, w: 44, a: 0.09 },
    { x: 300, w: 90, a: 0.06 },
  ];
  for (const band of bands) {
    const g = ctx.createLinearGradient(band.x, 0, band.x + band.w, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, `rgba(235,240,255,${band.a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(band.x, -1000, band.w, 2000);
  }
  return toTexture(el);
}

export function laptopScreenTexture() {
  const { el, ctx } = canvas(512, 320);
  ctx.fillStyle = "#0c1533";
  ctx.fillRect(0, 0, 512, 320);
  ctx.fillStyle = "#1a2a57";
  ctx.fillRect(0, 0, 512, 34);
  ["#ff7b9c", "#ffd166", "#6df0b0"].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(22 + i * 24, 17, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  const rows: [number, number, string][] = [
    [30, 150, "#c7b5ff"], [60, 220, "#8ecbff"], [60, 130, "#f6e7c8"], [90, 240, "#6df0b0"],
    [90, 170, "#8ecbff"], [60, 90, "#ff9fb8"], [30, 120, "#c7b5ff"], [30, 260, "#8ecbff"],
  ];
  rows.forEach(([x, w, color], i) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, 58 + i * 31, w, 13);
  });
  return toTexture(el);
}

export function doorTexture() {
  const { el, ctx } = canvas(512, 340);
  ctx.fillStyle = "#101538";
  ctx.fillRect(0, 0, 512, 340);
  ctx.strokeStyle = "rgba(142,203,255,.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 480, 308);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 54px ${DISPLAY}`;
  ctx.fillStyle = "#f4f1e8";
  ctx.fillText("PRIZE", 256, 150);
  ctx.font = `400 28px ${PIXEL}`;
  ctx.fillStyle = "#8ecbff";
  ctx.fillText("PUSH TO COLLECT", 256, 222);
  return toTexture(el);
}

/** Dot-matrix status display. Returns a redraw function so the texture is reused. */
export function statusDisplay() {
  const { el, ctx } = canvas(1024, 256);
  const texture = toTexture(el);

  const draw = (primary: string, secondary: string, color: string) => {
    ctx.fillStyle = "#05060f";
    ctx.fillRect(0, 0, el.width, el.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    ctx.font = `400 70px ${PIXEL}`;
    ctx.fillText(primary, 512, 96, 960);
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#8ecbff";
    ctx.font = `400 40px ${PIXEL}`;
    ctx.fillText(secondary, 512, 190, 960);
    ctx.shadowBlur = 0;
    // Pixel mesh over the text, like a real LED panel.
    ctx.fillStyle = "rgba(5,6,15,.5)";
    for (let x = 0; x < el.width; x += 6) ctx.fillRect(x, 0, 2, el.height);
    for (let y = 0; y < el.height; y += 6) ctx.fillRect(0, y, el.width, 2);
    texture.needsUpdate = true;
  };
  return { texture, draw };
}
