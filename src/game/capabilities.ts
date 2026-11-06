/** Decides whether this device gets the WebGL machine or the CSS 3D fallback. */
export function detectRenderer(): "3d" | "lite" {
  const params = new URLSearchParams(window.location.search);
  if (params.get("renderer") === "lite") return "lite";
  if (params.get("renderer") === "3d") return "3d";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return "lite";
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return "lite";
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 3) return "lite";

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return "lite";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return "3d";
  } catch {
    return "lite";
  }
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
